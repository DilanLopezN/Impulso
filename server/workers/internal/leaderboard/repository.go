package leaderboard

import (
	"context"
	"database/sql"
	"fmt"
	"time"
)

type Period string

type Scope string

const (
	PeriodWeekly  Period = "weekly"
	PeriodMonthly Period = "monthly"
	PeriodAllTime Period = "all_time"

	ScopeGlobal  Scope = "global"
	ScopeFriends Scope = "friends"
	ScopeTeam    Scope = "team"
)

var TieBreakers = []string{
	"total_xp DESC",
	"checkins_count DESC",
	"last_activity_at DESC",
	"user_id ASC",
}

type Repository struct {
	db *sql.DB
}

type SnapshotResult struct {
	Period      Period    `json:"period"`
	GeneratedAt time.Time `json:"generatedAt"`
	Users       int       `json:"users"`
}

type Entry struct {
	Position       int       `json:"position"`
	UserID         string    `json:"userId"`
	DisplayName    string    `json:"displayName"`
	AvatarURL      *string   `json:"avatarUrl,omitempty"`
	TotalXP        int       `json:"totalXp"`
	CheckinsCount  int       `json:"checkinsCount"`
	LastActivityAt time.Time `json:"lastActivityAt"`
}

type ListRequest struct {
	Period   Period
	Scope    Scope
	ViewerID string
	TeamID   string
	Limit    int
	Offset   int
}

type ListResult struct {
	Period      Period    `json:"period"`
	Scope       Scope     `json:"scope"`
	GeneratedAt time.Time `json:"generatedAt"`
	TieBreakers []string  `json:"tieBreakers"`
	Items       []Entry   `json:"items"`
}

func NewRepository(db *sql.DB) *Repository { return &Repository{db: db} }

func (r *Repository) RefreshSnapshots(ctx context.Context) ([]SnapshotResult, error) {
	periods := []Period{PeriodWeekly, PeriodMonthly, PeriodAllTime}
	results := make([]SnapshotResult, 0, len(periods))
	for _, period := range periods {
		res, err := r.refreshPeriod(ctx, period)
		if err != nil {
			return nil, err
		}
		results = append(results, res)
	}
	return results, nil
}

func (r *Repository) refreshPeriod(ctx context.Context, period Period) (SnapshotResult, error) {
	tx, err := r.db.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		return SnapshotResult{}, err
	}
	defer tx.Rollback()

	var snapshotID int64
	var generatedAt time.Time
	if err := tx.QueryRowContext(ctx, `
		INSERT INTO ranking_snapshots (period)
		VALUES ($1)
		RETURNING id, generated_at
	`, string(period)).Scan(&snapshotID, &generatedAt); err != nil {
		return SnapshotResult{}, err
	}

	filter := periodFilterSQL(period)
	query := fmt.Sprintf(`
		WITH xp AS (
			SELECT xl.user_id, COALESCE(SUM(xl.amount), 0)::int AS total_xp,
			       COALESCE(MAX(xl.occurred_at), to_timestamp(0)) AS last_activity_at
			FROM xp_ledger xl
			INNER JOIN users u ON u.id = xl.user_id
			WHERE u.deleted_at IS NULL %s
			GROUP BY xl.user_id
		),
		checkins AS (
			SELECT hc.user_id, COUNT(*)::int AS checkins_count
			FROM habit_checkins hc
			INNER JOIN users u ON u.id = hc.user_id
			WHERE u.deleted_at IS NULL %s
			GROUP BY hc.user_id
		),
		scored AS (
			SELECT xp.user_id,
			       xp.total_xp,
			       COALESCE(c.checkins_count, 0)::int AS checkins_count,
			       xp.last_activity_at
			FROM xp
			LEFT JOIN checkins c ON c.user_id = xp.user_id
		),
		ordered AS (
			SELECT user_id,
			       total_xp,
			       checkins_count,
			       last_activity_at,
			       ROW_NUMBER() OVER (
				ORDER BY total_xp DESC, checkins_count DESC, last_activity_at DESC, user_id ASC
			   )::int AS position
			FROM scored
		)
		INSERT INTO ranking_snapshot_entries (
			snapshot_id,
			period,
			snapshot_generated_at,
			user_id,
			position,
			total_xp,
			checkins_count,
			last_activity_at
		)
		SELECT $1, $2, $3, user_id, position, total_xp, checkins_count, last_activity_at
		FROM ordered
	`, filter.ledger, filter.checkins)

	result, err := tx.ExecContext(ctx, query, snapshotID, string(period), generatedAt)
	if err != nil {
		return SnapshotResult{}, err
	}

	if err := tx.Commit(); err != nil {
		return SnapshotResult{}, err
	}

	affected, _ := result.RowsAffected()
	return SnapshotResult{Period: period, GeneratedAt: generatedAt, Users: int(affected)}, nil
}

type periodFilter struct {
	ledger   string
	checkins string
}

func periodFilterSQL(period Period) periodFilter {
	switch period {
	case PeriodWeekly:
		return periodFilter{
			ledger:   "AND xl.occurred_at >= date_trunc('week', now() AT TIME ZONE 'UTC')",
			checkins: "AND hc.date >= date_trunc('week', now() AT TIME ZONE 'UTC')::date",
		}
	case PeriodMonthly:
		return periodFilter{
			ledger:   "AND xl.occurred_at >= date_trunc('month', now() AT TIME ZONE 'UTC')",
			checkins: "AND hc.date >= date_trunc('month', now() AT TIME ZONE 'UTC')::date",
		}
	default:
		return periodFilter{}
	}
}

func (r *Repository) List(ctx context.Context, req ListRequest) (ListResult, error) {
	var generatedAt time.Time
	if err := r.db.QueryRowContext(ctx, `
		SELECT generated_at
		FROM ranking_snapshots
		WHERE period = $1
		ORDER BY generated_at DESC
		LIMIT 1
	`, string(req.Period)).Scan(&generatedAt); err != nil {
		if err == sql.ErrNoRows {
			if _, refreshErr := r.refreshPeriod(ctx, req.Period); refreshErr != nil {
				return ListResult{}, refreshErr
			}
			if err = r.db.QueryRowContext(ctx, `
				SELECT generated_at
				FROM ranking_snapshots
				WHERE period = $1
				ORDER BY generated_at DESC
				LIMIT 1
			`, string(req.Period)).Scan(&generatedAt); err != nil {
				return ListResult{}, err
			}
		} else {
			return ListResult{}, err
		}
	}

	args := []any{string(req.Period), generatedAt}
	scopeJoin := ""
	scopeWhere := ""

	switch req.Scope {
	case ScopeFriends:
		args = append(args, req.ViewerID)
		scopeWhere = `
			AND e.user_id IN (
				SELECT uf.friend_id FROM user_friendships uf
				WHERE uf.user_id = $3 AND uf.status = 'accepted'
				UNION
				SELECT $3
			)
		`
	case ScopeTeam:
		args = append(args, req.TeamID)
		scopeJoin = "INNER JOIN team_memberships tm ON tm.user_id = e.user_id"
		scopeWhere = "AND tm.team_id = $3"
	}

	args = append(args, req.Limit, req.Offset)
	query := fmt.Sprintf(`
		SELECT e.position, e.user_id, u.display_name, u.avatar_url,
		       e.total_xp, e.checkins_count, e.last_activity_at
		FROM ranking_snapshot_entries e
		INNER JOIN users u ON u.id = e.user_id
		%s
		WHERE e.period = $1
		  AND e.snapshot_generated_at = $2
		  AND u.deleted_at IS NULL
		  %s
		ORDER BY e.position ASC
		LIMIT $4 OFFSET $5
	`, scopeJoin, scopeWhere)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return ListResult{}, err
	}
	defer rows.Close()

	items := make([]Entry, 0, req.Limit)
	for rows.Next() {
		var entry Entry
		if err := rows.Scan(
			&entry.Position,
			&entry.UserID,
			&entry.DisplayName,
			&entry.AvatarURL,
			&entry.TotalXP,
			&entry.CheckinsCount,
			&entry.LastActivityAt,
		); err != nil {
			return ListResult{}, err
		}
		items = append(items, entry)
	}
	if err := rows.Err(); err != nil {
		return ListResult{}, err
	}

	return ListResult{
		Period:      req.Period,
		Scope:       req.Scope,
		GeneratedAt: generatedAt,
		TieBreakers: TieBreakers,
		Items:       items,
	}, nil
}
