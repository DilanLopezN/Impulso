/* global React, Icon, ProgressRing, WeekBars, SectionHead */
const { useState } = React;

/* =================================================
   HOME / DASHBOARD
   ================================================= */
const Home = ({ state, dispatch, openGoal }) => {
  const { goals, streak, xp, level, xpToNext, todayDone, todayTotal, weekDays, name } = state;

  const momentum = Math.round(goals.reduce((a, g) => a + g.progress, 0) / goals.length * 100);

  return (
    <div className="phone-inner">
      <StatusBar />
      <div className="screen" style={{ paddingBottom: 120 }}>
        {/* =========== HERO =========== */}
        <div style={{ padding: "8px 20px 20px", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 6 }}>TERÇA · 23 ABR</div>
              <div className="h2" style={{ lineHeight: 1.2 }}>
                Bom dia, <span className="neon">{name}</span>
              </div>
              <div className="body" style={{ marginTop: 4, color: "var(--ink-2)" }}>
                {todayDone}/{todayTotal} tarefas para hoje
              </div>
            </div>
            <button style={{
              width: 40, height: 40, borderRadius: 12,
              background: "var(--glass-strong)", border: "1px solid var(--border)",
              display: "grid", placeItems: "center", position: "relative"
            }}>
              <Icon name="bell" size={18} />
              <span style={{
                position: "absolute", top: 8, right: 9,
                width: 7, height: 7, borderRadius: 999,
                background: "var(--accent)",
                boxShadow: "0 0 6px var(--accent-glow)"
              }}/>
            </button>
          </div>
        </div>

        {/* =========== MOMENTUM HUD =========== */}
        <div style={{ padding: "0 20px 24px" }}>
          <div className="card card-highlight grid-bg" style={{ padding: 22, position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <ProgressRing value={momentum / 100} size={108} stroke={7}>
                <div style={{ textAlign: "center" }}>
                  <div className="mono" style={{ fontSize: 30, fontWeight: 500, letterSpacing: "-0.04em" }}>
                    {momentum}<span style={{ fontSize: 14, color: "var(--ink-3)" }}>%</span>
                  </div>
                  <div className="eyebrow" style={{ fontSize: 8, color: "var(--ink-3)" }}>MOMENTUM</div>
                </div>
              </ProgressRing>

              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                <StatRow label="Nível" value={level} sub={`${xp} / ${xpToNext} XP`}
                         pill={<div className="chip chip-accent">LVL {level}</div>}/>
                <div style={{ height: 1, background: "var(--border)" }}/>
                <StatRow label="Sequência" value={`${streak}d`} sub="Melhor: 31d"
                         pill={<span className="flame" style={{ fontSize: 18 }}>🔥</span>}/>
                <div style={{ height: 1, background: "var(--border)" }}/>
                <StatRow label="XP Hoje" value="+180" sub="↑ 32% vs. ontem"
                         icon="zap"/>
              </div>
            </div>

            {/* week strip */}
            <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span className="eyebrow">ESTA SEMANA</span>
                <span className="small mono" style={{ color: "var(--accent)" }}>5/7 dias ativos</span>
              </div>
              <WeekBars days={weekDays} height={40} />
            </div>
          </div>
        </div>

        {/* =========== TODAY FOCUS =========== */}
        <div style={{ padding: "0 20px 24px" }}>
          <SectionHead eyebrow="FOCO DE HOJE" title="3 impulsos para agora" action="Ver tudo" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <TodayItem
              icon="run" label="Correr 5km" sub="Parque Ibirapuera · 30min"
              done={todayDone >= 1} onToggle={() => dispatch({type: "toggle", key: "run"})}
              chip="+50 XP"
            />
            <TodayItem
              icon="book" label="Estudar React — 2 aulas" sub="Curso Avançado · 45min"
              done={todayDone >= 2} onToggle={() => dispatch({type: "toggle", key: "study"})}
              chip="+80 XP"
            />
            <TodayItem
              icon="sparkle" label="Journal da noite" sub="Reflexão + 3 gratidões"
              done={todayDone >= 3} onToggle={() => dispatch({type: "toggle", key: "journal"})}
              chip="+30 XP"
            />
          </div>
        </div>

        {/* =========== METAS ATIVAS =========== */}
        <div style={{ padding: "0 20px 24px" }}>
          <SectionHead eyebrow="METAS ATIVAS" title={`${goals.length} em progresso`} action="Filtrar" />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {goals.map(g => (
              <GoalCard key={g.id} goal={g} onClick={() => openGoal(g.id)} />
            ))}
          </div>
        </div>

        {/* =========== INSIGHT =========== */}
        <div style={{ padding: "0 20px 12px" }}>
          <div className="card" style={{ padding: 18, border: "1px solid var(--accent)", background: "var(--accent-dim)" }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: "var(--accent)", color: "var(--accent-ink)",
                display: "grid", placeItems: "center",
                boxShadow: "0 0 20px var(--accent-glow)"
              }}>
                <Icon name="trend" size={18} stroke={2.2} />
              </div>
              <div>
                <div className="eyebrow" style={{ color: "var(--accent)", marginBottom: 4 }}>COACH INSIGHT</div>
                <div className="body" style={{ color: "var(--ink-0)", lineHeight: 1.5 }}>
                  Você está <b>3 dias</b> do seu recorde pessoal de sequência. Se mantiver até domingo, desbloqueia a <span className="neon">medalha Inabalável</span>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =================================================
   SUB-COMPONENTS
   ================================================= */
const StatRow = ({ label, value, sub, pill, icon }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <div>
      <div className="small" style={{ color: "var(--ink-3)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span className="mono" style={{ fontSize: 18, fontWeight: 500 }}>{value}</span>
        {sub && <span className="small" style={{ fontSize: 10, color: "var(--ink-3)" }}>{sub}</span>}
      </div>
    </div>
    {pill || (icon && (
      <div style={{
        width: 28, height: 28, borderRadius: 8, background: "var(--accent-dim)",
        display: "grid", placeItems: "center", color: "var(--accent)"
      }}>
        <Icon name={icon} size={14} stroke={2} />
      </div>
    ))}
  </div>
);

const TodayItem = ({ icon, label, sub, done, onToggle, chip }) => (
  <button
    onClick={onToggle}
    className="card"
    style={{
      padding: 14,
      display: "flex", alignItems: "center", gap: 12,
      textAlign: "left", width: "100%",
      opacity: done ? 0.55 : 1,
      transition: "opacity 200ms",
    }}
  >
    <div
      className={done ? "pop" : ""}
      style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: done ? "var(--accent)" : "var(--glass-strong)",
        border: done ? "1px solid var(--accent)" : "1px solid var(--border-strong)",
        color: done ? "var(--accent-ink)" : "var(--ink-1)",
        display: "grid", placeItems: "center",
        boxShadow: done ? "0 0 16px var(--accent-glow)" : "none",
        transition: "all 260ms"
      }}
    >
      <Icon name={done ? "check" : icon} size={18} stroke={2} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-0)",
                    textDecoration: done ? "line-through" : "none",
                    textDecorationColor: "var(--ink-3)" }}>
        {label}
      </div>
      <div className="small" style={{ color: "var(--ink-3)", marginTop: 2 }}>{sub}</div>
    </div>
    <div className="chip mono" style={{ fontSize: 10 }}>{chip}</div>
  </button>
);

const GoalCard = ({ goal, onClick }) => {
  const pct = Math.round(goal.progress * 100);
  return (
    <button onClick={onClick} className="card" style={{
      padding: 16, textAlign: "left", width: "100%",
      display: "flex", flexDirection: "column", gap: 14
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flex: 1, minWidth: 0 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: `linear-gradient(135deg, ${goal.color}40, ${goal.color}10)`,
            border: `1px solid ${goal.color}80`,
            color: goal.color,
            display: "grid", placeItems: "center"
          }}>
            <Icon name={goal.icon} size={20} stroke={1.8} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="eyebrow" style={{ marginBottom: 2, fontSize: 9 }}>{goal.category}</div>
            <div style={{ fontSize: 15, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {goal.title}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="mono" style={{ fontSize: 20, fontWeight: 500, lineHeight: 1, color: "var(--accent)" }}>
            {pct}<span style={{ fontSize: 11, color: "var(--ink-3)" }}>%</span>
          </div>
          <div className="small mono" style={{ fontSize: 9, color: "var(--ink-3)", marginTop: 2 }}>{goal.deadline}</div>
        </div>
      </div>

      <div className="bar">
        <div className="bar-fill" style={{ width: `${pct}%`, background: goal.color, boxShadow: `0 0 12px ${goal.color}80` }}/>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6 }}>
          <span className="chip mono" style={{ fontSize: 10 }}>
            <Icon name="clock" size={10} stroke={2} /> {goal.next}
          </span>
          {goal.streak && (
            <span className="chip mono" style={{ fontSize: 10 }}>
              🔥 {goal.streak}d
            </span>
          )}
        </div>
        <Icon name="chevron" size={14} stroke={2} style={{ color: "var(--ink-3)" }} />
      </div>
    </button>
  );
};

window.Home = Home;
window.GoalCard = GoalCard;
