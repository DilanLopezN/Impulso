/* global React, Icon */
const { useState } = React;

/* =================================================
   ACHIEVEMENTS
   ================================================= */
const Achievements = () => {
  const [filter, setFilter] = useState("all");
  const categories = ["Todas", "Sequências", "Metas", "Marcos"];

  const earned = [
    { id: 1, title: "Primeiro Passo", sub: "Concluiu primeira meta", icon: "sparkle", tier: "bronze", date: "12 Mar", xp: 100 },
    { id: 2, title: "Semana Perfeita", sub: "7 dias de streak",       icon: "flame",   tier: "silver", date: "18 Mar", xp: 200 },
    { id: 3, title: "Corredor",        sub: "Correu 50km no total",   icon: "run",     tier: "silver", date: "02 Abr", xp: 250 },
    { id: 4, title: "Intelecto",       sub: "Finalizou 3 cursos",     icon: "book",    tier: "gold",   date: "15 Abr", xp: 500 },
  ];
  const locked = [
    { id: 5, title: "Inabalável",  sub: "30 dias de streak",      icon: "lock", progress: 0.93, req: "28/30" },
    { id: 6, title: "Maratonista", sub: "Correr 100km no total",  icon: "lock", progress: 0.42, req: "42/100km" },
    { id: 7, title: "Centurião",   sub: "Complete 100 tarefas",   icon: "lock", progress: 0.71, req: "71/100" },
    { id: 8, title: "Lendário",    sub: "Alcance o nível 20",     icon: "lock", progress: 0.60, req: "LVL 12/20" },
  ];

  const tiers = {
    bronze: { color: "oklch(0.72 0.13 55)",  label: "BRONZE" },
    silver: { color: "oklch(0.80 0.05 240)", label: "PRATA"  },
    gold:   { color: "oklch(0.88 0.18 95)",  label: "OURO"   },
  };

  return (
    <div className="phone-inner">
      <StatusBar />
      <div className="screen" style={{ paddingBottom: 120 }}>
        <div style={{ padding: "4px 20px 20px" }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>CONQUISTAS</div>
          <h1 className="h1">Sua coleção</h1>

          {/* Progress strip */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 12 }}>
            <div className="mono" style={{ fontSize: 28, fontWeight: 500, color: "var(--accent)" }}>12</div>
            <div className="mono" style={{ fontSize: 16, color: "var(--ink-3)" }}>/ 48</div>
            <div className="chip" style={{ marginLeft: "auto" }}>25% desbloqueado</div>
          </div>
          <div className="bar" style={{ marginTop: 10 }}>
            <div className="bar-fill" style={{ width: "25%" }}/>
          </div>
        </div>

        {/* Filter */}
        <div style={{ padding: "0 20px 20px", display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none" }}>
          {categories.map((c, i) => (
            <button key={c} className="chip" onClick={() => setFilter(c)}
                    style={{
                      background: filter === c ? "var(--accent)" : "var(--glass-strong)",
                      color: filter === c ? "var(--accent-ink)" : "var(--ink-1)",
                      border: filter === c ? "1px solid var(--accent)" : "1px solid var(--border)",
                      boxShadow: filter === c ? "0 0 16px var(--accent-glow)" : "none",
                      cursor: "pointer", whiteSpace: "nowrap"
                    }}>{c}</button>
          ))}
        </div>

        {/* Featured */}
        <div style={{ padding: "0 20px 24px" }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>DESBLOQUEADA RECENTEMENTE</div>
          <div className="card card-accent grid-bg" style={{ padding: 22, display: "flex", alignItems: "center", gap: 16 }}>
            <BadgeBig tier="gold" icon="book" />
            <div style={{ flex: 1 }}>
              <div className="eyebrow" style={{ color: "var(--accent)", marginBottom: 4 }}>OURO · 15 ABR</div>
              <div className="h3" style={{ marginBottom: 4 }}>Intelecto</div>
              <div className="small" style={{ color: "var(--ink-2)" }}>Finalizou 3 cursos completos</div>
              <div className="mono" style={{ fontSize: 11, color: "var(--accent)", marginTop: 8, fontWeight: 600 }}>+500 XP</div>
            </div>
          </div>
        </div>

        {/* Earned grid */}
        <div style={{ padding: "0 20px 24px" }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>CONQUISTADAS · 12</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {earned.map(a => (
              <div key={a.id} className="card" style={{ padding: 16, textAlign: "center" }}>
                <div style={{ display: "grid", placeItems: "center", marginBottom: 10 }}>
                  <BadgeSmall tier={a.tier} icon={a.icon} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{a.title}</div>
                <div className="small" style={{ color: "var(--ink-3)", fontSize: 10 }}>{a.sub}</div>
                <div className="hr" style={{ margin: "10px 0" }}/>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="mono small" style={{ fontSize: 10, color: "var(--ink-3)" }}>{a.date}</span>
                  <span className="mono small" style={{ fontSize: 10, color: tiers[a.tier].color, fontWeight: 600 }}>+{a.xp} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Locked */}
        <div style={{ padding: "0 20px 12px" }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>EM PROGRESSO</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {locked.map(a => (
              <div key={a.id} className="card" style={{ padding: 14, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                  background: "var(--bg-2)", border: "1px dashed var(--border-strong)",
                  display: "grid", placeItems: "center", color: "var(--ink-3)"
                }}>
                  <Icon name="lock" size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-1)" }}>{a.title}</div>
                  <div className="small" style={{ color: "var(--ink-3)", marginBottom: 8 }}>{a.sub}</div>
                  <div className="bar" style={{ height: 3 }}>
                    <div className="bar-fill" style={{ width: `${a.progress * 100}%` }}/>
                  </div>
                </div>
                <div className="mono small" style={{ fontSize: 10, color: "var(--ink-2)", fontWeight: 600, whiteSpace: "nowrap" }}>{a.req}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ===== Badge visuals (hex/diamond SVGs) ===== */
const BadgeBig = ({ tier, icon }) => {
  const colors = {
    bronze: "oklch(0.72 0.13 55)",
    silver: "oklch(0.80 0.05 240)",
    gold:   "oklch(0.88 0.18 95)",
  };
  const c = colors[tier];
  return (
    <div style={{ position: "relative", width: 88, height: 96 }}>
      <svg viewBox="0 0 88 96" style={{ position: "absolute", inset: 0, filter: `drop-shadow(0 0 16px ${c}80)` }}>
        <defs>
          <linearGradient id={`bg-${tier}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={c} stopOpacity="1"/>
            <stop offset="100%" stopColor={c} stopOpacity="0.4"/>
          </linearGradient>
        </defs>
        <polygon points="44,4 82,24 82,72 44,92 6,72 6,24" fill={`url(#bg-${tier})`}/>
        <polygon points="44,10 76,28 76,68 44,86 12,68 12,28" fill="var(--bg-1)"/>
        <polygon points="44,14 72,30 72,66 44,82 16,66 16,30" fill={c} opacity="0.15"/>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: c }}>
        <Icon name={icon} size={28} stroke={1.8} />
      </div>
    </div>
  );
};
const BadgeSmall = ({ tier, icon }) => {
  const colors = {
    bronze: "oklch(0.72 0.13 55)",
    silver: "oklch(0.80 0.05 240)",
    gold:   "oklch(0.88 0.18 95)",
  };
  const c = colors[tier];
  return (
    <div style={{ position: "relative", width: 56, height: 62 }}>
      <svg viewBox="0 0 56 62" style={{ position: "absolute", inset: 0, filter: `drop-shadow(0 0 8px ${c}60)` }}>
        <polygon points="28,2 52,16 52,46 28,60 4,46 4,16" fill={c} opacity="0.9"/>
        <polygon points="28,7 47,19 47,43 28,55 9,43 9,19" fill="var(--bg-1)"/>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: c }}>
        <Icon name={icon} size={18} stroke={1.8} />
      </div>
    </div>
  );
};

window.Achievements = Achievements;
