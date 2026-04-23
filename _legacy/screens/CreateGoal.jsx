/* global React, Icon */
const { useState } = React;

/* =================================================
   CREATE GOAL — 3 passos
   ================================================= */
const CreateGoal = ({ onClose, onCreate }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: "",
    category: null,
    type: null,
    target: 30,
    unit: "dias",
    deadline: "4 semanas",
    reminder: true,
  });

  const categories = [
    { id: "fitness",   label: "Fitness",        icon: "run",     color: "oklch(0.82 0.18 25)"  },
    { id: "learn",     label: "Aprendizado",    icon: "book",    color: "oklch(0.82 0.16 260)" },
    { id: "finance",   label: "Finanças",       icon: "wallet",  color: "oklch(0.82 0.18 150)" },
    { id: "mind",      label: "Mente",          icon: "sparkle", color: "oklch(0.82 0.18 310)" },
    { id: "project",   label: "Projeto",        icon: "target",  color: "oklch(0.82 0.15 80)"  },
    { id: "habit",     label: "Hábito",         icon: "flame",   color: "oklch(0.82 0.18 35)"  },
  ];
  const types = [
    { id: "habit",    label: "Hábito diário",    sub: "Consistência em streaks", icon: "flame" },
    { id: "deadline", label: "Meta com prazo",   sub: "Alcance até uma data",    icon: "calendar" },
    { id: "numeric",  label: "Meta numérica",    sub: "Ex: economizar R$ 5.000", icon: "trend" },
    { id: "project",  label: "Projeto",          sub: "Com sub-tarefas e marcos", icon: "target" },
  ];

  const canNext = [
    form.category,
    form.type && form.title.length > 2,
    true,
  ][step];

  return (
    <div className="phone-inner">
      <StatusBar />
      <div className="screen" style={{ paddingBottom: 24 }}>
        {/* Header */}
        <div style={{ padding: "4px 20px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={step === 0 ? onClose : () => setStep(step - 1)} style={{
            width: 40, height: 40, borderRadius: 12,
            background: "var(--glass-strong)", border: "1px solid var(--border)",
            display: "grid", placeItems: "center"
          }}>
            <Icon name={step === 0 ? "close" : "chevronL"} size={18} stroke={2} />
          </button>
          <div className="eyebrow">NOVA META · {step + 1}/3</div>
          <div style={{ width: 40 }}/>
        </div>

        {/* Progress */}
        <div style={{ padding: "0 20px 24px", display: "flex", gap: 6 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i <= step ? "var(--accent)" : "var(--border-strong)",
              boxShadow: i <= step ? "0 0 8px var(--accent-glow)" : "none",
              transition: "all 300ms"
            }}/>
          ))}
        </div>

        <div key={step} className="screen-fade" style={{ padding: "0 20px" }}>
          {step === 0 && (
            <>
              <h2 className="h2" style={{ marginBottom: 8 }}>O que você quer conquistar?</h2>
              <p className="body" style={{ color: "var(--ink-2)", marginBottom: 24 }}>
                Escolha uma categoria para começar
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {categories.map(c => {
                  const active = form.category === c.id;
                  return (
                    <button key={c.id} onClick={() => setForm({ ...form, category: c.id })}
                            className="card" style={{
                      padding: 16, textAlign: "left", display: "flex",
                      flexDirection: "column", gap: 10,
                      borderColor: active ? c.color : "var(--border)",
                      background: active ? `${c.color}15` : "var(--glass-strong)",
                      boxShadow: active ? `0 0 20px ${c.color}30` : "none",
                      transition: "all 200ms"
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: active ? c.color : `${c.color}20`,
                        color: active ? "var(--accent-ink)" : c.color,
                        display: "grid", placeItems: "center",
                        boxShadow: active ? `0 0 16px ${c.color}60` : "none"
                      }}>
                        <Icon name={c.icon} size={18} stroke={1.8} />
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="h2" style={{ marginBottom: 8 }}>Defina sua meta</h2>
              <p className="body" style={{ color: "var(--ink-2)", marginBottom: 24 }}>
                Seja específico — clareza acelera o progresso
              </p>

              <div style={{ marginBottom: 20 }}>
                <div className="eyebrow" style={{ marginBottom: 8 }}>TÍTULO</div>
                <input
                  className="input"
                  placeholder="Ex: Correr uma maratona"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  autoFocus
                />
              </div>

              <div className="eyebrow" style={{ marginBottom: 10 }}>TIPO DE META</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {types.map(t => {
                  const active = form.type === t.id;
                  return (
                    <button key={t.id} onClick={() => setForm({ ...form, type: t.id })}
                            className="card" style={{
                      padding: 14, display: "flex", alignItems: "center", gap: 12,
                      textAlign: "left",
                      borderColor: active ? "var(--accent)" : "var(--border)",
                      background: active ? "var(--accent-dim)" : "var(--glass-strong)",
                      transition: "all 160ms"
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: active ? "var(--accent)" : "var(--glass-strong)",
                        color: active ? "var(--accent-ink)" : "var(--ink-1)",
                        border: "1px solid var(--border-strong)",
                        display: "grid", placeItems: "center"
                      }}>
                        <Icon name={t.icon} size={16} stroke={1.8} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{t.label}</div>
                        <div className="small" style={{ color: "var(--ink-3)", marginTop: 1 }}>{t.sub}</div>
                      </div>
                      <div style={{
                        width: 18, height: 18, borderRadius: 999,
                        border: `2px solid ${active ? "var(--accent)" : "var(--border-strong)"}`,
                        background: active ? "var(--accent)" : "transparent",
                        display: "grid", placeItems: "center"
                      }}>
                        {active && <Icon name="check" size={10} stroke={3} style={{ color: "var(--accent-ink)" }} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="h2" style={{ marginBottom: 8 }}>Configure o ritmo</h2>
              <p className="body" style={{ color: "var(--ink-2)", marginBottom: 24 }}>
                Ajuste o alvo, prazo e lembretes
              </p>

              {/* Target */}
              <div className="card" style={{ padding: 18, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                  <div className="eyebrow">ALVO</div>
                  <div className="mono" style={{ fontSize: 22, fontWeight: 500, color: "var(--accent)" }}>
                    {form.target} <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{form.unit}</span>
                  </div>
                </div>
                <input type="range" min="1" max="365"
                  value={form.target}
                  onChange={e => setForm({ ...form, target: +e.target.value })}
                  style={{
                    width: "100%", appearance: "none", WebkitAppearance: "none",
                    height: 4, borderRadius: 4, outline: "none",
                    background: `linear-gradient(to right, var(--accent) ${form.target/365*100}%, var(--border-strong) ${form.target/365*100}%)`
                  }}
                />
                <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                  {["7 dias", "21 dias", "30 dias", "90 dias"].map(p => (
                    <button key={p} className="chip" onClick={() => setForm({ ...form, target: parseInt(p) })}
                            style={{ cursor: "pointer" }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deadline */}
              <div className="card" style={{ padding: 18, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "var(--glass-strong)", border: "1px solid var(--border)",
                    display: "grid", placeItems: "center", color: "var(--accent)"
                  }}>
                    <Icon name="calendar" size={16} stroke={2} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Prazo</div>
                    <div className="small" style={{ color: "var(--ink-3)" }}>21 de Maio, 2026</div>
                  </div>
                </div>
                <Icon name="chevron" size={14} stroke={2} style={{ color: "var(--ink-3)" }} />
              </div>

              {/* Reminders */}
              <div className="card" style={{ padding: 18, marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "var(--glass-strong)", border: "1px solid var(--border)",
                    display: "grid", placeItems: "center", color: "var(--accent)"
                  }}>
                    <Icon name="bell" size={16} stroke={2} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Lembretes diários</div>
                    <div className="small" style={{ color: "var(--ink-3)" }}>Todo dia às 08:00</div>
                  </div>
                </div>
                <button onClick={() => setForm({ ...form, reminder: !form.reminder })} style={{
                  width: 44, height: 26, borderRadius: 999,
                  background: form.reminder ? "var(--accent)" : "var(--border-strong)",
                  position: "relative", transition: "all 200ms",
                  boxShadow: form.reminder ? "0 0 12px var(--accent-glow)" : "none"
                }}>
                  <div style={{
                    position: "absolute", top: 2, left: form.reminder ? 20 : 2,
                    width: 22, height: 22, borderRadius: 999,
                    background: "#fff", transition: "all 200ms"
                  }}/>
                </button>
              </div>

              {/* Preview */}
              <div className="eyebrow" style={{ marginBottom: 8 }}>PREVIEW</div>
              <div className="card card-accent" style={{ padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "var(--accent-dim)", color: "var(--accent)",
                  display: "grid", placeItems: "center", border: "1px solid var(--accent)"
                }}>
                  <Icon name="target" size={18} stroke={1.8} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{form.title || "Sua meta"}</div>
                  <div className="small mono" style={{ color: "var(--ink-3)", marginTop: 2 }}>
                    {form.target} {form.unit} · até 21 Mai
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ padding: "16px 20px 28px" }}>
        <button
          className="btn btn-primary btn-full"
          disabled={!canNext}
          onClick={() => step === 2 ? onCreate(form) : setStep(step + 1)}
          style={{ opacity: canNext ? 1 : 0.4 }}
        >
          {step === 2 ? "Criar meta" : "Continuar"}
          <Icon name="arrow" size={16} stroke={2} />
        </button>
      </div>
    </div>
  );
};

window.CreateGoal = CreateGoal;
