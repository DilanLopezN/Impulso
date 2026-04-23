/* global React, Icon */
const { useState } = React;

/* =================================================
   HABITS & STREAKS
   ================================================= */
const Habits = ({ habits, toggleHabit }) => {
  const totalDone = habits.filter(h => h.todayDone).length;
  const totalHabits = habits.length;

  return (
    <div className="phone-inner">
      <StatusBar />
      <div className="screen" style={{ paddingBottom: 120 }}>
        {/* Header */}
        <div style={{ padding: "4px 20px 20px" }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>HÁBITOS</div>
          <h1 className="h1">Ritual diário</h1>
          <p className="body" style={{ color: "var(--ink-2)", marginTop: 6 }}>
            {totalDone} de {totalHabits} concluídos hoje
          </p>
        </div>

        {/* Big streak card */}
        <div style={{ padding: "0 20px 20px" }}>
          <div className="card card-highlight grid-bg" style={{ padding: 22, textAlign: "center", position: "relative", overflow: "hidden" }}>
            {/* radial glow */}
            <div style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(circle at 50% 30%, var(--accent-dim), transparent 70%)",
              pointerEvents: "none"
            }}/>
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 56, filter: "drop-shadow(0 0 20px rgba(255, 150, 50, 0.4))" }} className="flame">🔥</div>
              <div className="mono" style={{ fontSize: 64, fontWeight: 500, letterSpacing: "-0.04em", lineHeight: 1, color: "var(--accent)" }}>
                28
              </div>
              <div className="eyebrow" style={{ marginTop: 6, color: "var(--accent)" }}>DIAS DE SEQUÊNCIA</div>
              <div className="body" style={{ marginTop: 12, color: "var(--ink-1)", textWrap: "balance" }}>
                3 dias para quebrar seu recorde pessoal (<span className="mono">31d</span>)
              </div>

              {/* Calendar heatmap — last 30 days */}
              <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(15, 1fr)", gap: 4 }}>
                {Array.from({length: 30}).map((_, i) => {
                  const v = Math.random() > 0.2 ? Math.random() : 0;
                  const isToday = i === 29;
                  return (
                    <div key={i} style={{
                      aspectRatio: 1, borderRadius: 3,
                      background: v > 0 ? `color-mix(in srgb, var(--accent) ${20 + v * 80}%, transparent)` : "var(--border-strong)",
                      boxShadow: v > 0.6 ? "0 0 6px var(--accent-glow)" : "none",
                      border: isToday ? "1px solid var(--accent)" : "none"
                    }}/>
                  );
                })}
              </div>
              <div className="small mono" style={{ color: "var(--ink-3)", marginTop: 10, display: "flex", justifyContent: "space-between" }}>
                <span>há 30 dias</span>
                <span>hoje</span>
              </div>
            </div>
          </div>
        </div>

        {/* Today list */}
        <div style={{ padding: "0 20px 24px" }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>HOJE · TERÇA, 23 ABR</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {habits.map(h => (
              <HabitRow key={h.id} habit={h} onToggle={() => toggleHabit(h.id)} />
            ))}
          </div>
        </div>

        {/* Weekly grid */}
        <div style={{ padding: "0 20px 12px" }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>VISÃO SEMANAL</div>
          <div className="card" style={{ padding: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "80px repeat(7, 1fr)", gap: 6, alignItems: "center" }}>
              <div/>
              {["D","S","T","Q","Q","S","S"].map((d,i) => (
                <div key={i} className="mono small" style={{
                  fontSize: 10, textAlign: "center",
                  color: i === 2 ? "var(--accent)" : "var(--ink-3)",
                  fontWeight: 600
                }}>{d}</div>
              ))}
              {habits.slice(0, 4).map(h => (
                <React.Fragment key={h.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                    <div style={{ width: 16, height: 16, borderRadius: 4, background: h.color, flexShrink: 0 }}/>
                    <span className="small" style={{ color: "var(--ink-1)", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.short}</span>
                  </div>
                  {h.week.map((done, i) => (
                    <div key={i} style={{
                      aspectRatio: 1, borderRadius: 4,
                      background: done ? h.color : "var(--border-strong)",
                      opacity: done ? 1 : 0.5,
                      boxShadow: done ? `0 0 4px ${h.color}80` : "none",
                      border: i === 2 ? "1px solid var(--ink-3)" : "none"
                    }}/>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HabitRow = ({ habit, onToggle }) => {
  const done = habit.todayDone;
  return (
    <button onClick={onToggle} className="card" style={{
      padding: 14, display: "flex", alignItems: "center", gap: 12,
      textAlign: "left", width: "100%",
      borderColor: done ? habit.color : "var(--border)",
      background: done ? `${habit.color}10` : "var(--glass-strong)",
      transition: "all 200ms"
    }}>
      <div className={done ? "pop" : ""} style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: done ? habit.color : `${habit.color}15`,
        color: done ? "var(--accent-ink)" : habit.color,
        border: `1px solid ${done ? habit.color : "var(--border-strong)"}`,
        display: "grid", placeItems: "center",
        boxShadow: done ? `0 0 16px ${habit.color}80` : "none",
        transition: "all 260ms"
      }}>
        <Icon name={done ? "check" : habit.icon} size={20} stroke={2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink-0)" }}>
          {habit.title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 3 }}>
          <span className="small mono" style={{ color: "var(--ink-3)", fontSize: 11 }}>{habit.time}</span>
          <span style={{ width: 3, height: 3, borderRadius: 999, background: "var(--ink-4)" }}/>
          <span className="small mono" style={{ color: habit.color, fontSize: 11 }}>🔥 {habit.streak}d</span>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div className="mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>{habit.weekDone}/7</div>
        <div style={{ width: 40, height: 3, background: "var(--border)", borderRadius: 999, marginTop: 4 }}>
          <div style={{
            width: `${(habit.weekDone/7)*100}%`, height: "100%",
            background: habit.color, borderRadius: 999,
            boxShadow: `0 0 4px ${habit.color}80`
          }}/>
        </div>
      </div>
    </button>
  );
};

window.Habits = Habits;
