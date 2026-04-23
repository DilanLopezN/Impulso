/* global React, Icon, ProgressRing, WeekBars, SectionHead */
const { useState } = React;

/* =================================================
   GOAL DETAIL
   ================================================= */
const GoalDetail = ({ goal, onBack, onToggleMilestone }) => {
  if (!goal) return null;
  const pct = Math.round(goal.progress * 100);

  return (
    <div className="phone-inner">
      <StatusBar />
      <div className="screen" style={{ paddingBottom: 32 }}>
        {/* Header */}
        <div style={{ padding: "4px 20px 16px", display: "flex", justifyContent: "space-between" }}>
          <button onClick={onBack} style={{
            width: 40, height: 40, borderRadius: 12,
            background: "var(--glass-strong)", border: "1px solid var(--border)",
            display: "grid", placeItems: "center"
          }}>
            <Icon name="chevronL" size={18} stroke={2} />
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{
              width: 40, height: 40, borderRadius: 12,
              background: "var(--glass-strong)", border: "1px solid var(--border)",
              display: "grid", placeItems: "center"
            }}>
              <Icon name="share" size={16} stroke={2} />
            </button>
            <button style={{
              width: 40, height: 40, borderRadius: 12,
              background: "var(--glass-strong)", border: "1px solid var(--border)",
              display: "grid", placeItems: "center"
            }}>
              <Icon name="dots" size={18} stroke={2} />
            </button>
          </div>
        </div>

        {/* Hero */}
        <div style={{ padding: "0 20px 24px", textAlign: "center" }}>
          <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
            <ProgressRing value={goal.progress} size={200} stroke={8} colorVar={goal.color}>
              <div style={{ textAlign: "center" }}>
                <Icon name={goal.icon} size={28} stroke={1.5} style={{ color: goal.color, marginBottom: 6 }} />
                <div className="mono" style={{ fontSize: 42, fontWeight: 500, letterSpacing: "-0.04em", lineHeight: 1 }}>
                  {pct}<span style={{ fontSize: 18, color: "var(--ink-3)" }}>%</span>
                </div>
                <div className="eyebrow" style={{ fontSize: 9, color: "var(--ink-3)", marginTop: 4 }}>CONCLUÍDO</div>
              </div>
            </ProgressRing>
          </div>
          <div className="eyebrow" style={{ marginBottom: 6, color: goal.color }}>{goal.category}</div>
          <h1 className="h1" style={{ marginBottom: 8, textWrap: "balance" }}>{goal.title}</h1>
          <p className="body" style={{ color: "var(--ink-2)", maxWidth: 300, margin: "0 auto" }}>
            {goal.description}
          </p>
        </div>

        {/* Stats strip */}
        <div style={{ padding: "0 20px 24px" }}>
          <div className="card" style={{ padding: 0, display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
            {[
              { label: "PRAZO", value: goal.deadline, sub: `${goal.daysLeft}d restantes` },
              { label: "SEQUÊNCIA", value: `${goal.streak || 12}d`, sub: "de 21 dias" },
              { label: "XP GANHO", value: `${goal.xp || 840}`, sub: `de ${goal.xpTotal || 1200}` },
            ].map((s, i) => (
              <div key={i} style={{
                padding: "16px 12px",
                textAlign: "center",
                borderRight: i < 2 ? "1px solid var(--border)" : "none"
              }}>
                <div className="eyebrow" style={{ fontSize: 9, marginBottom: 4 }}>{s.label}</div>
                <div className="mono" style={{ fontSize: 16, fontWeight: 500, color: "var(--ink-0)" }}>{s.value}</div>
                <div className="small mono" style={{ fontSize: 9, color: "var(--ink-3)", marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div style={{ padding: "0 20px 24px" }}>
          <SectionHead eyebrow="MARCOS" title="Jornada" action="Editar" />
          <div style={{ position: "relative", paddingLeft: 0 }}>
            {goal.milestones.map((m, i) => {
              const isLast = i === goal.milestones.length - 1;
              return (
                <div key={i} style={{ display: "flex", gap: 14, position: "relative" }}>
                  {/* Timeline column */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 28, flexShrink: 0 }}>
                    <button onClick={() => onToggleMilestone(i)} style={{
                      width: 28, height: 28, borderRadius: 999,
                      background: m.done ? goal.color : "var(--bg-2)",
                      border: `2px solid ${m.done ? goal.color : "var(--border-strong)"}`,
                      display: "grid", placeItems: "center",
                      color: m.done ? "var(--accent-ink)" : "var(--ink-3)",
                      boxShadow: m.done ? `0 0 12px ${goal.color}80` : "none",
                      transition: "all 200ms"
                    }}>
                      {m.done ? <Icon name="check" size={14} stroke={3} /> :
                                <span className="mono" style={{ fontSize: 11, fontWeight: 600 }}>{i+1}</span>}
                    </button>
                    {!isLast && (
                      <div style={{
                        width: 2, flex: 1, minHeight: 44,
                        background: m.done ? goal.color : "var(--border-strong)",
                        opacity: m.done ? 0.4 : 0.6,
                      }}/>
                    )}
                  </div>

                  <div style={{ flex: 1, paddingBottom: isLast ? 0 : 20, paddingTop: 2 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: 14, fontWeight: 600,
                          color: m.done ? "var(--ink-2)" : "var(--ink-0)",
                          textDecoration: m.done ? "line-through" : "none",
                          textDecorationColor: "var(--ink-3)"
                        }}>
                          {m.title}
                        </div>
                        <div className="small mono" style={{ fontSize: 10, marginTop: 3, color: "var(--ink-3)" }}>
                          {m.date}
                        </div>
                      </div>
                      {m.done && <span className="chip mono" style={{ fontSize: 9, color: goal.color, borderColor: `${goal.color}60` }}>+{m.xp} XP</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity chart */}
        <div style={{ padding: "0 20px 24px" }}>
          <SectionHead eyebrow="ATIVIDADE" title="Últimas 4 semanas" />
          <div className="card" style={{ padding: 18 }}>
            <div style={{ display: "flex", gap: 3, height: 100, alignItems: "flex-end" }}>
              {Array.from({length: 28}).map((_, i) => {
                const v = [0.1,0.3,0.6,0.2,0.9,0.4,0.0,
                           0.5,0.7,0.8,0.6,0.9,0.3,0.4,
                           0.2,0.9,0.5,0.8,0.7,0.9,0.4,
                           0.6,0.9,1.0,0.8,0.9,0.7,0.85][i];
                return <div key={i} style={{
                  flex: 1,
                  height: `${Math.max(4, v * 100)}%`,
                  background: v > 0.05 ? goal.color : "var(--border-strong)",
                  opacity: v > 0.05 ? (0.4 + v * 0.6) : 1,
                  borderRadius: 2,
                  boxShadow: v > 0.7 ? `0 0 6px ${goal.color}80` : "none",
                }}/>;
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, color: "var(--ink-3)" }} className="mono small">
              <span>há 4sem</span><span>há 3sem</span><span>há 2sem</span><span>semana atual</span>
            </div>
          </div>
        </div>

        {/* Action */}
        <div style={{ padding: "0 20px 24px", display: "flex", gap: 10 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }}>
            <Icon name="clock" size={16} stroke={2} /> Lembrete
          </button>
          <button className="btn btn-primary" style={{ flex: 1.5, background: goal.color, boxShadow: `0 0 30px ${goal.color}80` }}>
            Registrar progresso
            <Icon name="plus" size={16} stroke={2.4} />
          </button>
        </div>
      </div>
    </div>
  );
};

window.GoalDetail = GoalDetail;
