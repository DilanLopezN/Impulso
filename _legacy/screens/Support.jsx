/* global React, Icon */
const { useState } = React;

/* =================================================
   SUPPORT / IMPULSO PRO
   ================================================= */
const Support = ({ onBack, onSubscribe, isPro }) => {
  const [plan, setPlan] = useState("yearly");

  const plans = {
    monthly: { price: "R$ 14,90", per: "/mês", sub: "Cobrado mensalmente", save: null },
    yearly:  { price: "R$ 89,90", per: "/ano",  sub: "R$ 7,49/mês — cobrado anualmente", save: "ECONOMIZA 50%" },
    lifetime:{ price: "R$ 249",   per: "vitalício", sub: "Pague uma vez, use para sempre", save: "MELHOR VALOR" },
  };

  const benefits = [
    { icon: "medal",   title: "Selo de Apoiador",          sub: "Distintivo neon exclusivo no seu perfil e no feed", featured: true },
    { icon: "zap",     title: "Sem anúncios",              sub: "Feed limpo, foco total na sua jornada" },
    { icon: "target",  title: "Metas ilimitadas",          sub: "Crie quantas metas quiser (gratuito: 5)" },
    { icon: "trend",   title: "Estatísticas avançadas",    sub: "Heatmaps anuais, exportação CSV e correlações" },
    { icon: "sparkle", title: "Temas e cores exclusivos",  sub: "Paletas neon premium e modo concentração" },
    { icon: "calendar",title: "Integração com Calendário", sub: "Sync com Google, Apple e Outlook" },
    { icon: "trophy",  title: "Conquistas Pro",            sub: "Linha de badges exclusiva para apoiadores" },
    { icon: "heart",   title: "Apoie o Impulso",           sub: "Ajuda a manter o app sem dependência de ads" },
  ];

  return (
    <div className="phone-inner">
      <StatusBar />
      <div className="screen" style={{ paddingBottom: 32 }}>
        {/* Header */}
        <div style={{ padding: "4px 20px 8px", display: "flex", justifyContent: "space-between" }}>
          <button onClick={onBack} style={{
            width: 40, height: 40, borderRadius: 12,
            background: "var(--glass-strong)", border: "1px solid var(--border)",
            display: "grid", placeItems: "center"
          }}>
            <Icon name="chevronL" size={18} stroke={2} />
          </button>
          <button onClick={onBack} style={{ color: "var(--ink-2)" }}>
            <Icon name="close" size={20} stroke={2} />
          </button>
        </div>

        {/* Hero */}
        <div className="grid-bg" style={{ padding: "8px 24px 28px", textAlign: "center", position: "relative" }}>
          {/* Halo */}
          <div style={{
            position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)",
            width: 240, height: 200,
            background: "radial-gradient(ellipse at 50% 0%, var(--accent-dim), transparent 70%)",
            pointerEvents: "none", zIndex: 0
          }}/>

          {/* Badge art */}
          <div style={{ position: "relative", display: "inline-block", marginBottom: 22 }}>
            <ProBadge />
          </div>

          <div className="eyebrow" style={{ color: "var(--accent)", marginBottom: 8 }}>
            IMPULSO PRO
          </div>
          <h1 className="h1" style={{ marginBottom: 12, textWrap: "balance" }}>
            Apoie o app que <span className="neon">apoia você</span>
          </h1>
          <p className="body" style={{ color: "var(--ink-1)", maxWidth: 320, margin: "0 auto", lineHeight: 1.55 }}>
            Receba um <b>selo exclusivo</b>, <b>sem anúncios</b> para sempre, e ajude a manter o Impulso independente e focado em você.
          </p>
        </div>

        {/* Plan selector */}
        <div style={{ padding: "0 20px 20px" }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>ESCOLHA SEU PLANO</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.entries(plans).map(([id, p]) => {
              const active = plan === id;
              return (
                <button key={id} onClick={() => setPlan(id)} className="card" style={{
                  padding: 16, display: "flex", alignItems: "center", gap: 14,
                  textAlign: "left",
                  borderColor: active ? "var(--accent)" : "var(--border)",
                  background: active ? "var(--accent-dim)" : "var(--glass-strong)",
                  boxShadow: active ? "0 0 20px var(--accent-dim)" : "none",
                  transition: "all 200ms"
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 999, flexShrink: 0,
                    border: `2px solid ${active ? "var(--accent)" : "var(--border-strong)"}`,
                    background: active ? "var(--accent)" : "transparent",
                    display: "grid", placeItems: "center"
                  }}>
                    {active && <div style={{ width: 8, height: 8, borderRadius: 999, background: "var(--accent-ink)" }}/>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, textTransform: "capitalize" }}>
                        {id === "monthly" ? "Mensal" : id === "yearly" ? "Anual" : "Vitalício"}
                      </span>
                      {p.save && (
                        <span className="chip mono" style={{
                          fontSize: 9, padding: "2px 7px",
                          background: "var(--accent)", color: "var(--accent-ink)",
                          border: "1px solid var(--accent)",
                          boxShadow: "0 0 8px var(--accent-glow)"
                        }}>{p.save}</span>
                      )}
                    </div>
                    <div className="small mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{p.sub}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="mono" style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", color: active ? "var(--accent)" : "var(--ink-0)" }}>
                      {p.price}
                    </div>
                    <div className="small mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{p.per}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Benefits */}
        <div style={{ padding: "0 20px 20px" }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>O QUE VOCÊ RECEBE</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {benefits.map((b, i) => (
              <div key={i} className="card" style={{
                padding: 14, display: "flex", alignItems: "center", gap: 12,
                background: b.featured ? "var(--accent-dim)" : "var(--glass-strong)",
                borderColor: b.featured ? "var(--accent)" : "var(--border)"
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: b.featured ? "var(--accent)" : "var(--glass-strong)",
                  border: b.featured ? "1px solid var(--accent)" : "1px solid var(--border-strong)",
                  color: b.featured ? "var(--accent-ink)" : "var(--accent)",
                  display: "grid", placeItems: "center",
                  boxShadow: b.featured ? "0 0 16px var(--accent-glow)" : "none"
                }}>
                  <Icon name={b.icon} size={18} stroke={1.8} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-0)" }}>{b.title}</div>
                  <div className="small" style={{ color: "var(--ink-2)", marginTop: 2, fontSize: 11 }}>{b.sub}</div>
                </div>
                <Icon name="check" size={16} stroke={2.4} style={{
                  color: b.featured ? "var(--accent)" : "var(--ink-3)"
                }}/>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div style={{ padding: "0 20px 20px" }}>
          <div className="card grid-bg" style={{ padding: 18 }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
              {[1,2,3,4,5].map(i => <Icon key={i} name="star" size={14} stroke={0} style={{ fill: "var(--accent)", filter: "drop-shadow(0 0 4px var(--accent-glow))" }}/>)}
            </div>
            <p className="body" style={{ fontSize: 13, color: "var(--ink-1)", marginBottom: 12, lineHeight: 1.5, fontStyle: "italic" }}>
              "Virei apoiadora há 4 meses. O selo é maravilhoso, mas o que mais me marcou foi saber que estou ajudando a manter um app que não vende meus dados."
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 999,
                background: "linear-gradient(135deg, var(--bg-3), var(--bg-2))",
                border: "1px solid var(--accent)",
                display: "grid", placeItems: "center",
                fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700,
                color: "var(--accent)"
              }}>S</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                  Sofia Martins
                  <span style={{
                    display: "inline-grid", placeItems: "center",
                    width: 13, height: 13, borderRadius: 999,
                    background: "var(--accent)", color: "var(--accent-ink)"
                  }}>
                    <Icon name="check" size={8} stroke={3.5} />
                  </span>
                </div>
                <div className="small mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>Apoiadora desde Dez/25</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: "0 20px 12px" }}>
          <button className="btn btn-primary btn-full" onClick={onSubscribe} style={{ padding: "16px 20px", fontSize: 15 }}>
            {isPro ? "Você já é Apoiador" : "Tornar-me Apoiador"}
            {!isPro && <Icon name="arrow" size={16} stroke={2.4} />}
          </button>
          <p className="small" style={{ textAlign: "center", color: "var(--ink-3)", marginTop: 12, fontSize: 10 }}>
            Cancele quando quiser · Pagamento seguro · Sem renovação automática surpresa
          </p>
        </div>

        {/* FAQ-ish trust strip */}
        <div style={{ padding: "12px 20px 0", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { i: "lock", l: "Seguro" },
            { i: "heart", l: "Sem ads" },
            { i: "sparkle", l: "Cancele\nquando quiser" },
          ].map((t, i) => (
            <div key={i} style={{
              padding: 12, borderRadius: 10,
              background: "var(--glass-strong)", border: "1px solid var(--border)",
              textAlign: "center"
            }}>
              <Icon name={t.i} size={14} stroke={2} style={{ color: "var(--accent)", marginBottom: 4 }}/>
              <div className="small" style={{ fontSize: 10, color: "var(--ink-2)", whiteSpace: "pre-line", lineHeight: 1.3 }}>{t.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ===== Pro Badge — hex shape with glow ===== */
const ProBadge = () => (
  <div style={{ position: "relative", width: 140, height: 154 }}>
    <svg viewBox="0 0 140 154" style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 0 30px var(--accent-glow))" }}>
      <defs>
        <linearGradient id="proG" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="1"/>
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.4"/>
        </linearGradient>
        <linearGradient id="proInner" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--bg-2)"/>
          <stop offset="100%" stopColor="var(--bg-0)"/>
        </linearGradient>
      </defs>
      <polygon points="70,4 130,38 130,116 70,150 10,116 10,38" fill="url(#proG)"/>
      <polygon points="70,12 122,42 122,112 70,142 18,112 18,42" fill="url(#proInner)"/>
      <polygon points="70,18 116,46 116,108 70,136 24,108 24,46" fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.4"/>
    </svg>
    <div style={{
      position: "absolute", inset: 0,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
    }}>
      <div className="mono" style={{
        fontSize: 32, fontWeight: 700,
        color: "var(--accent)", letterSpacing: "-0.04em",
        textShadow: "0 0 16px var(--accent-glow)"
      }}>PRO</div>
      <div className="eyebrow" style={{ fontSize: 8, color: "var(--accent)", marginTop: 2 }}>APOIADOR</div>
    </div>
  </div>
);

window.Support = Support;
