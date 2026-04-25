/* global React, Icon */
const { useState } = React;

/* =================================================
   FEED — rede social do Impulso
   ================================================= */
const Feed = () => {
  const [filter, setFilter] = useState("seguindo");

  const posts = [
    {
      id: 1, type: "milestone",
      user: { name: "Lucas Mendes", handle: "lucasm", avatar: "L", level: 14, supporter: true },
      time: "2h",
      content: "Acabei de completar minha primeira meia-maratona! 21km em 1h54. Há 6 meses não conseguia correr 2km sem parar. Consistência > intensidade.",
      milestone: { title: "Meia-maratona", category: "Fitness", icon: "run", color: "oklch(0.82 0.18 25)", xp: "+500 XP" },
      likes: 142, comments: 18, supports: 24,
    },
    {
      id: 2, type: "streak",
      user: { name: "Julia Santos", handle: "juliaas", avatar: "J", level: 10, supporter: false },
      time: "4h",
      content: "30 dias meditando todo dia. Comecei achando que ia desistir na primeira semana. O segredo? Reduzir a meta — 5 minutos é melhor que 0.",
      streak: { days: 30, habit: "Meditar diariamente" },
      likes: 89, comments: 12, supports: 8,
    },
    {
      id: 3, type: "ad", sponsor: "Cursos Alura",
      content: "Domine React em 30 dias com mentoria 1:1.",
      cta: "Saber mais",
    },
    {
      id: 4, type: "goal_complete",
      user: { name: "Rafael Costa", handle: "rafac", avatar: "R", level: 12, supporter: true },
      time: "8h",
      content: "Curso de Design Systems FINALIZADO 🎯 4 meses, 38 aulas, 1 projeto final. Próxima parada: aplicar isso no trabalho.",
      goalCard: { title: "Curso Design Systems", progress: 1.0, color: "oklch(0.82 0.16 260)" },
      likes: 234, comments: 41, supports: 67,
    },
    {
      id: 5, type: "reflection",
      user: { name: "Carla Duarte", handle: "carlad", avatar: "C", level: 9, supporter: false },
      time: "1d",
      content: "Reflexão da semana: não consegui bater todas as metas, mas mantive 5 de 7 dias ativos. Antes eu desistiria. Hoje, sei que progresso é progresso.",
      likes: 67, comments: 9, supports: 4,
    },
  ];

  return (
    <div className="phone-inner">
      <StatusBar />
      <div className="screen" style={{ paddingBottom: 120 }}>
        {/* Header */}
        <div style={{ padding: "4px 20px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 4 }}>FEED</div>
            <h1 className="h2">Comunidade</h1>
          </div>
          <button style={{
            width: 40, height: 40, borderRadius: 12,
            background: "var(--glass-strong)", border: "1px solid var(--border)",
            display: "grid", placeItems: "center", position: "relative"
          }}>
            <Icon name="search" size={18} stroke={2} />
          </button>
        </div>

        {/* Filter pills */}
        <div style={{ padding: "0 20px 16px", display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none" }}>
          {[{id:"seguindo",label:"Seguindo"},{id:"todos",label:"Descobrir"},{id:"marcos",label:"Marcos"},{id:"reflexoes",label:"Reflexões"}].map(o => (
            <button key={o.id} onClick={() => setFilter(o.id)} className="chip" style={{
              background: filter === o.id ? "var(--accent)" : "var(--glass-strong)",
              color: filter === o.id ? "var(--accent-ink)" : "var(--ink-1)",
              border: filter === o.id ? "1px solid var(--accent)" : "1px solid var(--border)",
              boxShadow: filter === o.id ? "0 0 14px var(--accent-glow)" : "none",
              cursor: "pointer", whiteSpace: "nowrap", padding: "7px 12px"
            }}>{o.label}</button>
          ))}
        </div>

        {/* Compose */}
        <div style={{ padding: "0 20px 16px" }}>
          <button className="card" style={{
            width: "100%", padding: 14,
            display: "flex", alignItems: "center", gap: 12, textAlign: "left"
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 999,
              background: "linear-gradient(135deg, var(--bg-3), var(--bg-2))",
              border: "1px solid var(--border-strong)",
              display: "grid", placeItems: "center",
              fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700,
              color: "var(--accent)"
            }}>M</div>
            <span className="small" style={{ color: "var(--ink-3)", flex: 1 }}>
              Compartilhe sua jornada...
            </span>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "var(--accent-dim)", color: "var(--accent)",
              display: "grid", placeItems: "center"
            }}>
              <Icon name="sparkle" size={14} stroke={2} />
            </div>
          </button>
        </div>

        {/* Posts */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 20px" }}>
          {posts.map(p => p.type === "ad" ? <AdCard key={p.id} ad={p} /> : <PostCard key={p.id} post={p} />)}
        </div>
      </div>
    </div>
  );
};

const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [supported, setSupported] = useState(false);

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "14px 14px 10px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 999,
          background: "linear-gradient(135deg, var(--bg-3), var(--bg-2))",
          border: "1px solid var(--border-strong)",
          display: "grid", placeItems: "center",
          fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700,
          color: "var(--ink-1)", flexShrink: 0
        }}>{post.user.avatar}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{post.user.name}</span>
            {post.user.supporter && (
              <span title="Apoiador" style={{
                display: "inline-grid", placeItems: "center",
                width: 14, height: 14, borderRadius: 999,
                background: "var(--accent)", color: "var(--accent-ink)",
                boxShadow: "0 0 8px var(--accent-glow)"
              }}>
                <Icon name="check" size={9} stroke={3.5} />
              </span>
            )}
            <span className="chip mono" style={{ padding: "1px 6px", fontSize: 9 }}>LVL {post.user.level}</span>
          </div>
          <div className="small mono" style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 1 }}>
            @{post.user.handle} · há {post.time}
          </div>
        </div>
        <button style={{ color: "var(--ink-3)" }}>
          <Icon name="dots" size={16} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "0 14px 12px" }}>
        <p className="body" style={{ fontSize: 14, lineHeight: 1.5, color: "var(--ink-0)", textWrap: "pretty" }}>
          {post.content}
        </p>
      </div>

      {/* Attachment by type */}
      {post.type === "milestone" && post.milestone && (
        <div style={{ padding: "0 14px 12px" }}>
          <div style={{
            padding: 14, borderRadius: 12,
            background: `linear-gradient(135deg, ${post.milestone.color}20, ${post.milestone.color}05)`,
            border: `1px solid ${post.milestone.color}50`,
            display: "flex", alignItems: "center", gap: 12
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: post.milestone.color, color: "var(--bg-0)",
              display: "grid", placeItems: "center",
              boxShadow: `0 0 16px ${post.milestone.color}80`
            }}>
              <Icon name={post.milestone.icon} size={20} stroke={2} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="eyebrow" style={{ fontSize: 9, color: post.milestone.color, marginBottom: 2 }}>
                MARCO ATINGIDO · {post.milestone.category.toUpperCase()}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{post.milestone.title}</div>
            </div>
            <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: post.milestone.color }}>
              {post.milestone.xp}
            </span>
          </div>
        </div>
      )}

      {post.type === "streak" && post.streak && (
        <div style={{ padding: "0 14px 12px" }}>
          <div className="grid-bg" style={{
            padding: 18, borderRadius: 12,
            background: "linear-gradient(135deg, oklch(0.82 0.18 35 / 0.15), oklch(0.82 0.18 35 / 0.03))",
            border: "1px solid oklch(0.82 0.18 35 / 0.4)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: 36, marginBottom: 4 }} className="flame">🔥</div>
            <div className="mono" style={{ fontSize: 32, fontWeight: 600, color: "oklch(0.85 0.18 35)", lineHeight: 1, letterSpacing: "-0.04em" }}>
              {post.streak.days} dias
            </div>
            <div className="small" style={{ color: "var(--ink-2)", marginTop: 4 }}>{post.streak.habit}</div>
          </div>
        </div>
      )}

      {post.type === "goal_complete" && post.goalCard && (
        <div style={{ padding: "0 14px 12px" }}>
          <div className="card-accent card" style={{
            padding: 14, position: "relative", overflow: "hidden",
            background: `linear-gradient(135deg, ${post.goalCard.color}25, ${post.goalCard.color}05)`,
            border: `1px solid ${post.goalCard.color}`
          }}>
            <div className="eyebrow" style={{ color: post.goalCard.color, marginBottom: 8 }}>META CONCLUÍDA</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>{post.goalCard.title}</div>
            <div className="bar" style={{ height: 4 }}>
              <div className="bar-fill" style={{ width: "100%", background: post.goalCard.color, boxShadow: `0 0 12px ${post.goalCard.color}80` }}/>
            </div>
            <div className="mono" style={{ fontSize: 11, color: post.goalCard.color, marginTop: 8, fontWeight: 600 }}>
              100% · CONCLUÍDA EM 4 MESES
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{
        padding: "10px 14px",
        borderTop: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 4
      }}>
        <ActionBtn icon="heart" label={post.likes + (liked ? 1 : 0)} active={liked}
                   onClick={() => setLiked(!liked)} color="oklch(0.72 0.22 25)"/>
        <ActionBtn icon="edit" label={post.comments} />
        <ActionBtn icon="zap"  label={post.supports + (supported ? 1 : 0)} active={supported}
                   onClick={() => setSupported(!supported)} color="var(--accent)" />
        <div style={{ flex: 1 }}/>
        <button style={{
          padding: 8, borderRadius: 8,
          color: "var(--ink-3)"
        }}>
          <Icon name="share" size={15} stroke={2} />
        </button>
      </div>
    </div>
  );
};

const ActionBtn = ({ icon, label, active, onClick, color = "var(--ink-2)" }) => (
  <button onClick={onClick} style={{
    display: "flex", alignItems: "center", gap: 6,
    padding: "6px 10px", borderRadius: 8,
    color: active ? color : "var(--ink-2)",
    background: active ? `color-mix(in srgb, ${color} 12%, transparent)` : "transparent",
    transition: "all 160ms"
  }}>
    <Icon name={icon} size={15} stroke={active ? 2.4 : 1.8}
          style={{ fill: active && icon === "heart" ? color : "none",
                   filter: active ? `drop-shadow(0 0 6px ${color})` : "none" }}/>
    <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
  </button>
);

const AdCard = ({ ad }) => (
  <div className="card" style={{ padding: 14, position: "relative" }}>
    <div className="eyebrow" style={{ fontSize: 9, color: "var(--ink-3)", marginBottom: 8 }}>
      ANÚNCIO · {ad.sponsor}
    </div>
    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{ad.content}</div>
    <button className="small" style={{ color: "var(--accent)", fontWeight: 600 }}>
      {ad.cta} →
    </button>
  </div>
);

window.Feed = Feed;
