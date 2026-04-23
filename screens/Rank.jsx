/* global React, Icon */
const { useState } = React;

/* =================================================
   RANK / LEADERBOARD
   ================================================= */
const Rank = ({ state }) => {
  const [scope, setScope] = useState("global");
  const [period, setPeriod] = useState("week");

  const leaders = [
    { id: 1, name: "Lucas Mendes",   handle: "lucasm",    xp: 8420, level: 14, streak: 62, avatar: "L", trend: "+340" },
    { id: 2, name: "Marina Ribeiro", handle: "marina",    xp: 7180, level: 12, streak: 28, avatar: "M", trend: "+280", you: true },
    { id: 3, name: "Rafael Costa",   handle: "rafac",     xp: 6940, level: 12, streak: 19, avatar: "R", trend: "+210" },
  ];

  const rest = [
    { id: 4, name: "Julia Santos",   handle: "juliaas",   xp: 5820, level: 10, streak: 14, avatar: "J", trend: "+160" },
    { id: 5, name: "André Oliveira", handle: "andreo",    xp: 5410, level: 10, streak: 22, avatar: "A", trend: "+140" },
    { id: 6, name: "Carla Duarte",   handle: "carlad",    xp: 4980, level: 9,  streak: 8,  avatar: "C", trend: "+120" },
    { id: 7, name: "Pedro Almeida",  handle: "pedroa",    xp: 4720, level: 9,  streak: 31, avatar: "P", trend: "+95"  },
    { id: 8, name: "Beatriz Lima",   handle: "bealima",   xp: 4510, level: 8,  streak: 11, avatar: "B", trend: "+80"  },
    { id: 9, name: "Felipe Rocha",   handle: "feliper",   xp: 4230, level: 8,  streak: 6,  avatar: "F", trend: "+65"  },
    { id: 10, name: "Sofia Martins", handle: "sofiam",    xp: 3980, level: 7,  streak: 17, avatar: "S", trend: "+50"  },
  ];

  return (
    <div className="phone-inner">
      <StatusBar />
      <div className="screen" style={{ paddingBottom: 120 }}>
        {/* Header */}
        <div style={{ padding: "4px 20px 16px" }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>RANK</div>
          <h1 className="h1">Liga do Impulso</h1>
          <p className="body" style={{ color: "var(--ink-2)", marginTop: 6 }}>
            Suba posições acumulando XP — a semana reinicia domingo
          </p>
        </div>

        {/* Filters */}
        <div style={{ padding: "0 20px 20px", display: "flex", gap: 8 }}>
          <div style={{
            display: "flex", background: "var(--glass-strong)",
            border: "1px solid var(--border)", borderRadius: 10, padding: 3, flex: 1
          }}>
            {[{id: "global", label: "Global"}, {id: "friends", label: "Amigos"}].map(o => (
              <button key={o.id} onClick={() => setScope(o.id)} style={{
                flex: 1, padding: "8px 10px", borderRadius: 7,
                background: scope === o.id ? "var(--accent)" : "transparent",
                color: scope === o.id ? "var(--accent-ink)" : "var(--ink-2)",
                fontSize: 12, fontWeight: 600,
                boxShadow: scope === o.id ? "0 0 14px var(--accent-glow)" : "none",
                transition: "all 160ms"
              }}>{o.label}</button>
            ))}
          </div>
          <div style={{
            display: "flex", background: "var(--glass-strong)",
            border: "1px solid var(--border)", borderRadius: 10, padding: 3, flex: 1
          }}>
            {[{id: "week", label: "Semana"}, {id: "month", label: "Mês"}, {id: "all", label: "Geral"}].map(o => (
              <button key={o.id} onClick={() => setPeriod(o.id)} style={{
                flex: 1, padding: "8px 6px", borderRadius: 7,
                background: period === o.id ? "var(--accent)" : "transparent",
                color: period === o.id ? "var(--accent-ink)" : "var(--ink-2)",
                fontSize: 11, fontWeight: 600,
                boxShadow: period === o.id ? "0 0 14px var(--accent-glow)" : "none",
                transition: "all 160ms"
              }}>{o.label}</button>
            ))}
          </div>
        </div>

        {/* Podium */}
        <div style={{ padding: "0 20px 24px" }}>
          <div className="card card-highlight grid-bg" style={{
            padding: "22px 18px 18px", position: "relative", overflow: "hidden"
          }}>
            {/* glow */}
            <div style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(ellipse at 50% 0%, var(--accent-dim), transparent 60%)",
              pointerEvents: "none"
            }}/>

            <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, alignItems: "flex-end" }}>
              {/* 2nd */}
              <PodiumSlot leader={leaders[1]} rank={2} height={108} color="oklch(0.80 0.05 240)" />
              {/* 1st */}
              <PodiumSlot leader={leaders[0]} rank={1} height={140} color="oklch(0.88 0.18 95)" crown />
              {/* 3rd */}
              <PodiumSlot leader={leaders[2]} rank={3} height={88} color="oklch(0.72 0.13 55)" />
            </div>
          </div>
        </div>

        {/* Your position card */}
        <div style={{ padding: "0 20px 20px" }}>
          <div className="card card-accent" style={{
            padding: 14, display: "flex", alignItems: "center", gap: 12,
            background: "var(--accent-dim)"
          }}>
            <div className="mono" style={{
              width: 40, height: 40, borderRadius: 10,
              background: "var(--accent)", color: "var(--accent-ink)",
              display: "grid", placeItems: "center",
              fontSize: 16, fontWeight: 700,
              boxShadow: "0 0 16px var(--accent-glow)"
            }}>#2</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-0)" }}>
                Você está a <span className="mono neon">1.240 XP</span> do topo
              </div>
              <div className="small" style={{ color: "var(--ink-2)", marginTop: 2 }}>
                Mantendo seu ritmo, você ultrapassa em <span className="mono">4 dias</span>
              </div>
            </div>
            <Icon name="trend" size={18} stroke={2} style={{ color: "var(--accent)" }} />
          </div>
        </div>

        {/* Rest of the list */}
        <div style={{ padding: "0 20px 12px" }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>RANKING COMPLETO</div>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {rest.map((p, i) => (
              <RankRow key={p.id} player={p} rank={i + 4} last={i === rest.length - 1}/>
            ))}
          </div>
        </div>

        {/* Season reward */}
        <div style={{ padding: "0 20px 12px" }}>
          <div className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "linear-gradient(135deg, oklch(0.88 0.18 95 / 0.3), oklch(0.88 0.18 95 / 0.1))",
              border: "1px solid oklch(0.88 0.18 95 / 0.5)",
              color: "oklch(0.88 0.18 95)",
              display: "grid", placeItems: "center"
            }}>
              <Icon name="medal" size={20} stroke={1.8} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Recompensa da temporada</div>
              <div className="small" style={{ color: "var(--ink-3)", marginTop: 2 }}>
                Termina em <span className="mono" style={{ color: "var(--accent)" }}>4d 11h</span> · Top 10 ganham badge exclusivo
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ===== Podium slot ===== */
const PodiumSlot = ({ leader, rank, height, color, crown }) => (
  <div style={{ textAlign: "center", position: "relative" }}>
    {crown && (
      <div style={{ fontSize: 20, marginBottom: 4, filter: `drop-shadow(0 0 10px ${color})` }}>
        👑
      </div>
    )}
    <div style={{ position: "relative", width: 56, height: 56, margin: "0 auto 8px" }}>
      <div style={{
        width: "100%", height: "100%", borderRadius: 999,
        background: `linear-gradient(135deg, ${color}, ${color}60)`,
        border: `2px solid ${color}`,
        display: "grid", placeItems: "center",
        fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700,
        color: "var(--bg-0)",
        boxShadow: `0 0 20px ${color}80`,
        outline: leader.you ? "2px solid var(--accent)" : "none",
        outlineOffset: 2
      }}>
        {leader.avatar}
      </div>
      <div className="mono" style={{
        position: "absolute", bottom: -4, right: -4,
        width: 22, height: 22, borderRadius: 999,
        background: color, color: "var(--bg-0)",
        fontSize: 11, fontWeight: 700,
        display: "grid", placeItems: "center",
        border: "2px solid var(--bg-1)"
      }}>{rank}</div>
    </div>
    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-0)", marginBottom: 2,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
      {leader.name.split(" ")[0]}
    </div>
    <div className="mono" style={{ fontSize: 11, color, fontWeight: 600, marginBottom: 10 }}>
      {leader.xp.toLocaleString("pt-BR")} XP
    </div>
    <div style={{
      height,
      background: `linear-gradient(to top, ${color}30, ${color}10)`,
      border: `1px solid ${color}80`,
      borderBottom: "none",
      borderRadius: "10px 10px 0 0",
      display: "grid", placeItems: "start center",
      paddingTop: 10
    }}>
      <div className="mono" style={{ fontSize: 22, fontWeight: 700, color, letterSpacing: "-0.04em",
                                      textShadow: `0 0 12px ${color}` }}>
        {rank}
      </div>
    </div>
  </div>
);

/* ===== Row for list ===== */
const RankRow = ({ player, rank, last }) => (
  <div style={{
    padding: "12px 14px",
    display: "flex", alignItems: "center", gap: 12,
    borderBottom: last ? "none" : "1px solid var(--border)"
  }}>
    <div className="mono" style={{
      width: 28, textAlign: "center",
      fontSize: 13, fontWeight: 600,
      color: "var(--ink-3)"
    }}>
      {rank}
    </div>
    <div style={{
      width: 36, height: 36, borderRadius: 999,
      background: "linear-gradient(135deg, var(--bg-3), var(--bg-2))",
      border: "1px solid var(--border-strong)",
      display: "grid", placeItems: "center",
      fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700,
      color: "var(--ink-1)"
    }}>
      {player.avatar}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-0)" }}>{player.name}</div>
      <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
        <span className="small mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>LVL {player.level}</span>
        <span className="small mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>🔥 {player.streak}d</span>
      </div>
    </div>
    <div style={{ textAlign: "right" }}>
      <div className="mono" style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-0)" }}>
        {player.xp.toLocaleString("pt-BR")}
      </div>
      <div className="mono small" style={{ fontSize: 10, color: "var(--accent)", marginTop: 2 }}>
        {player.trend} XP
      </div>
    </div>
  </div>
);

window.Rank = Rank;
