package httpserver

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/dilanlopezn/impulso/server/workers/internal/leaderboard"
)

type Server struct {
	httpServer    *http.Server
	leaderboard   *leaderboard.Repository
	internalToken string
}

func New(addr string, logger *slog.Logger, leaderboardRepo *leaderboard.Repository, internalToken string) *http.Server {
	s := &Server{leaderboard: leaderboardRepo, internalToken: internalToken}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", healthHandler)
	mux.HandleFunc("GET /rankings", s.rankingsHandler)
	mux.HandleFunc("POST /internal/rankings/snapshot", s.snapshotHandler)

	s.httpServer = &http.Server{
		Addr:              addr,
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
		ErrorLog:          slog.NewLogLogger(logger.Handler(), slog.LevelError),
	}
	return s.httpServer
}

type healthResponse struct {
	Status    string `json:"status"`
	Service   string `json:"service"`
	Timestamp string `json:"timestamp"`
}

func healthHandler(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(healthResponse{
		Status:    "ok",
		Service:   "workers",
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	})
}

func (s *Server) rankingsHandler(w http.ResponseWriter, r *http.Request) {
	period := leaderboard.Period(r.URL.Query().Get("period"))
	if period == "" {
		period = leaderboard.PeriodWeekly
	}
	if period != leaderboard.PeriodWeekly && period != leaderboard.PeriodMonthly && period != leaderboard.PeriodAllTime {
		http.Error(w, "invalid period", http.StatusBadRequest)
		return
	}

	scope := leaderboard.Scope(r.URL.Query().Get("scope"))
	if scope == "" {
		scope = leaderboard.ScopeGlobal
	}
	if scope != leaderboard.ScopeGlobal && scope != leaderboard.ScopeFriends && scope != leaderboard.ScopeTeam {
		http.Error(w, "invalid scope", http.StatusBadRequest)
		return
	}

	limit := parseIntOrDefault(r.URL.Query().Get("limit"), 50)
	if limit < 1 {
		limit = 1
	}
	if limit > 200 {
		limit = 200
	}
	offset := parseIntOrDefault(r.URL.Query().Get("offset"), 0)
	if offset < 0 {
		offset = 0
	}

	viewerID := r.URL.Query().Get("viewerId")
	teamID := r.URL.Query().Get("teamId")
	if scope == leaderboard.ScopeFriends && viewerID == "" {
		http.Error(w, "viewerId is required for scope=friends", http.StatusBadRequest)
		return
	}
	if scope == leaderboard.ScopeTeam && teamID == "" {
		http.Error(w, "teamId is required for scope=team", http.StatusBadRequest)
		return
	}

	result, err := s.leaderboard.List(r.Context(), leaderboard.ListRequest{
		Period:   period,
		Scope:    scope,
		ViewerID: viewerID,
		TeamID:   teamID,
		Limit:    limit,
		Offset:   offset,
	})
	if err != nil {
		http.Error(w, "failed to load rankings", http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusOK, result)
}

func (s *Server) snapshotHandler(w http.ResponseWriter, r *http.Request) {
	if strings.TrimSpace(s.internalToken) != "" {
		token := strings.TrimSpace(r.Header.Get("X-Worker-Token"))
		if token != s.internalToken {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}
	}

	results, err := s.leaderboard.RefreshSnapshots(r.Context())
	if err != nil {
		http.Error(w, "failed to refresh rankings", http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"results": results,
	})
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(payload); err != nil {
		http.Error(w, errors.New("failed to encode json").Error(), http.StatusInternalServerError)
	}
}

func parseIntOrDefault(raw string, fallback int) int {
	if raw == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(raw)
	if err != nil {
		return fallback
	}
	return parsed
}
