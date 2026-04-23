/* global React, Icon, ProgressRing */

/* =================================================
   PROFILE
   ================================================= */
const Profile = ({ state, onReset, onOpenOnboarding }) => {
  const { name, xp, level, xpToNext, streak } = state;

  const stats = [
    { label: "METAS CONCLUÍDAS", value: "14", sub: "de 18 criadas" },
    { label: "TAREFAS FEITAS",   value: "247", sub: "últimos 30 dias" },
    { label: "XP TOTAL",         value: "4.2k", sub: `nível ${level}` },
    { label: "DIAS ATIVOS",      value: "89",  sub: "desde jan/26" },
  ];

  return (
    <div className="phone-inner">
      <StatusBar />
      <div className="screen" style={{ paddingBottom: 120 }}>
        {/* Header */}
        <div style={{ padding: "4px 20px 20px", display: "flex", justifyContent: "space-between" }}>
          <div className="eyebrow">PERFIL</div>
          <button style={{ color: "var(--ink-2)" }}>
            <Icon name="settings" size={20} />
          </button>
        </div>

        {/* Profile hero */}
        <div style={{ padding: "0 20px 24px", textAlign: "center" }}>
          <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
            <ProgressRing value={xp / xpToNext} size={144} stroke={6}>
              <div style={{
                width: 116, height: 116, borderRadius: 999,
                background: "linear-gradient(135deg, var(--bg-2), var(--bg-3))",
                border: "1px solid var(--border-strong)",
                display: "grid", placeItems: "center",
                position: "relative", overflow: "hidden"
              }}>
                <div style={{
                  fontSize: 48, fontWeight: 700, color: "var(--accent)",
                  textShadow: "0 0 20px var(--accent-glow)",
                  fontFamily: "var(--font-mono)", letterSpacing: "-0.04em"
                }}>{name[0]}</div>
              </div>
            </ProgressRing>
            {/* Level badge */}
            <div style={{
              position: "absolute", bottom: -2, right: -2,
              minWidth: 40, height: 28, padding: "0 10px",
              borderRadius: 999,
              background: "var(--accent)", color: "var(--accent-ink)",
              display: "grid", placeItems: "center",
              boxShadow: "0 0 16px var(--accent-glow), 0 0 0 3px var(--bg-0)",
              fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700
            }}>
              LVL {level}
            </div>
          </div>
          <h1 className="h2" style={{ marginBottom: 4 }}>{name} Ribeiro</h1>
          <div className="small" style={{ color: "var(--ink-2)" }}>@{name.toLowerCase()} · Desde Janeiro de 2026</div>

          {/* XP bar */}
          <div style={{ maxWidth: 240, margin: "16px auto 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span className="small mono" style={{ color: "var(--ink-2)", fontSize: 10 }}>NÍVEL {level}</span>
              <span className="small mono" style={{ color: "var(--accent)", fontSize: 10 }}>{xp} / {xpToNext} XP</span>
            </div>
            <div className="bar"><div className="bar-fill" style={{ width: `${(xp/xpToNext)*100}%` }}/></div>
            <div className="small mono" style={{ color: "var(--ink-3)", fontSize: 10, marginTop: 6 }}>
              {xpToNext - xp} XP para nível {level + 1}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ padding: "0 20px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {stats.map((s, i) => (
              <div key={i} className="card" style={{ padding: 16 }}>
                <div className="eyebrow" style={{ fontSize: 9, marginBottom: 6 }}>{s.label}</div>
                <div className="mono" style={{ fontSize: 26, fontWeight: 500, letterSpacing: "-0.03em", color: "var(--ink-0)" }}>
                  {s.value}
                </div>
                <div className="small" style={{ color: "var(--ink-3)", fontSize: 10, marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Streak card */}
        <div style={{ padding: "0 20px 24px" }}>
          <div className="card" style={{ padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: "linear-gradient(135deg, rgba(255,140,50,0.3), rgba(255,80,30,0.15))",
              border: "1px solid rgba(255,120,50,0.5)",
              display: "grid", placeItems: "center", fontSize: 24
            }} className="flame">🔥</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Sequência atual</div>
              <div className="small mono" style={{ color: "var(--ink-3)", marginTop: 2 }}>
                Recorde: 31 dias · Continue mais 3 para superar
              </div>
            </div>
            <div className="mono" style={{ fontSize: 22, fontWeight: 500, color: "var(--accent)" }}>{streak}d</div>
          </div>
        </div>

        {/* Menu */}
        <div style={{ padding: "0 20px 12px" }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>AJUSTES</div>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <MenuRow icon="bell" label="Notificações" right="Ativas" />
            <MenuRow icon="moon" label="Aparência" right="Escuro" />
            <MenuRow icon="calendar" label="Integração com Calendário" right="Google" />
            <MenuRow icon="heart" label="Apoiar Impulso" right="Pro" rightAccent />
            <MenuRow icon="share" label="Convidar amigos" />
            <MenuRow icon="sparkle" label="Revisitar onboarding" onClick={onOpenOnboarding} last />
          </div>
        </div>

        <div style={{ padding: "0 20px 12px", textAlign: "center" }}>
          <button onClick={onReset} className="small mono" style={{ color: "var(--ink-3)", padding: 12 }}>
            Reset dos dados demo
          </button>
        </div>
      </div>
    </div>
  );
};

const MenuRow = ({ icon, label, right, rightAccent, onClick, last }) => (
  <button onClick={onClick} style={{
    width: "100%", padding: "14px 16px",
    display: "flex", alignItems: "center", gap: 14,
    borderBottom: last ? "none" : "1px solid var(--border)",
    textAlign: "left"
  }}>
    <div style={{
      width: 32, height: 32, borderRadius: 8,
      background: "var(--glass-strong)", border: "1px solid var(--border)",
      display: "grid", placeItems: "center", color: "var(--ink-1)"
    }}>
      <Icon name={icon} size={14} stroke={1.8} />
    </div>
    <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{label}</span>
    {right && <span className="small mono" style={{ color: rightAccent ? "var(--accent)" : "var(--ink-3)", fontSize: 11, fontWeight: 600 }}>{right}</span>}
    <Icon name="chevron" size={12} stroke={2} style={{ color: "var(--ink-3)" }} />
  </button>
);

/* =================================================
   CELEBRATION MODAL
   ================================================= */
const Celebration = ({ show, onClose }) => {
  if (!show) return null;
  return (
    <div className="screen-fade" style={{
      position: "absolute", inset: 0,
      background: "rgba(5, 7, 12, 0.85)",
      backdropFilter: "blur(20px)",
      display: "grid", placeItems: "center",
      zIndex: 50, padding: 24
    }}>
      {/* radial bursts */}
      <svg viewBox="0 0 400 400" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        {Array.from({length: 24}).map((_, i) => {
          const a = (i / 24) * Math.PI * 2;
          const len = 100 + (i % 3) * 40;
          return <line key={i}
            x1={200 + Math.cos(a) * 60} y1={200 + Math.sin(a) * 60}
            x2={200 + Math.cos(a) * (60 + len)} y2={200 + Math.sin(a) * (60 + len)}
            stroke="var(--accent)" strokeOpacity={0.1 + (i % 3) * 0.15}
            strokeWidth="1" strokeLinecap="round"/>;
        })}
      </svg>
      <div style={{ textAlign: "center", position: "relative" }}>
        <div className="pop" style={{
          width: 140, height: 140, borderRadius: "50%", margin: "0 auto 32px",
          background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
          display: "grid", placeItems: "center",
          boxShadow: "0 0 80px var(--accent-glow)"
        }}>
          <div style={{ width: 88, height: 88, borderRadius: "50%",
                        background: "var(--accent)", color: "var(--accent-ink)",
                        display: "grid", placeItems: "center",
                        boxShadow: "inset 0 -4px 12px rgba(0,0,0,0.15)" }}>
            <Icon name="check" size={44} stroke={3} />
          </div>
        </div>
        <div className="eyebrow" style={{ color: "var(--accent)", marginBottom: 10 }}>IMPULSO REGISTRADO</div>
        <h1 className="h1" style={{ marginBottom: 12 }}>
          Mais perto do <span className="neon">recorde</span>
        </h1>
        <p className="body" style={{ color: "var(--ink-1)", maxWidth: 280, margin: "0 auto 24px" }}>
          Você ganhou <span className="mono" style={{ color: "var(--accent)", fontWeight: 600 }}>+80 XP</span> e manteve sua sequência de <span className="mono" style={{ color: "var(--accent)" }}>28 dias</span>.
        </p>
        <button className="btn btn-primary" onClick={onClose} style={{ minWidth: 180 }}>
          Continuar
        </button>
      </div>
    </div>
  );
};

window.Profile = Profile;
window.Celebration = Celebration;
