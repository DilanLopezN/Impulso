/* global React, Icon, ProgressRing */
const { useState, useEffect } = React;

/* =================================================
   ONBOARDING — 3 passos sensoriais
   ================================================= */
const Onboarding = ({ onDone }) => {
  const [step, setStep] = useState(0);

  const slides = [
    {
      eyebrow: "BEM-VINDO AO IMPULSO",
      title: "Suas metas merecem momentum.",
      body: "Transforme intenções em progresso real. Cada pequena ação, registrada e celebrada.",
      art: <OnbGrid />,
    },
    {
      eyebrow: "COMO FUNCIONA",
      title: "Projete, execute, evolua.",
      body: "Defina metas, acompanhe hábitos diários, ganhe XP e veja sua jornada se desenhar em tempo real.",
      art: <OnbRings />,
    },
    {
      eyebrow: "VAMOS COMEÇAR",
      title: "Sua primeira vitória está próxima.",
      body: "Crie sua primeira meta agora. Pode ser um curso, um hábito, um projeto — qualquer coisa que importe.",
      art: <OnbSpark />,
    }
  ];

  const s = slides[step];
  const isLast = step === slides.length - 1;

  return (
    <div className="phone-inner" style={{ background: "var(--bg-0)" }}>
      <StatusBar />
      <div className="screen grid-bg" style={{ padding: "20px 28px 0" }}>
        {/* Progress dots */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
          {slides.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i <= step ? "var(--accent)" : "var(--border-strong)",
              boxShadow: i <= step ? "0 0 8px var(--accent-glow)" : "none",
              transition: "all 300ms"
            }}/>
          ))}
        </div>

        <div key={step} className="screen-fade" style={{
          display: "flex", flexDirection: "column", alignItems: "stretch",
          minHeight: 620, paddingTop: 8
        }}>
          {/* Art */}
          <div style={{ display: "grid", placeItems: "center", height: 300, marginBottom: 36 }}>
            {s.art}
          </div>

          <div className="eyebrow" style={{ marginBottom: 12 }}>{s.eyebrow}</div>
          <h1 className="h1" style={{ marginBottom: 16, textWrap: "balance" }}>
            {s.title}
          </h1>
          <p className="body" style={{ color: "var(--ink-1)", maxWidth: 320 }}>
            {s.body}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "0 20px 32px", display: "flex", gap: 10 }}>
        {!isLast && (
          <button className="btn btn-ghost" onClick={onDone} style={{ flex: 1 }}>
            Pular
          </button>
        )}
        <button
          className="btn btn-primary"
          onClick={() => isLast ? onDone() : setStep(step + 1)}
          style={{ flex: isLast ? 1 : 1.5 }}
        >
          {isLast ? "Criar minha primeira meta" : "Continuar"}
          <Icon name="arrow" size={16} stroke={2} />
        </button>
      </div>
    </div>
  );
};

/* ===== Onboarding art pieces ===== */
const OnbGrid = () => (
  <div style={{ position: "relative", width: 260, height: 260 }}>
    <svg viewBox="0 0 260 260" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id="og1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="130" cy="130" r="120" fill="url(#og1)"/>
      {[40, 70, 100, 130].map(r => (
        <circle key={r} cx="130" cy="130" r={r} fill="none" stroke="var(--accent)" strokeOpacity={0.15 + 0.1 * (130/r - 1)} strokeWidth="1"/>
      ))}
      {/* axis */}
      <line x1="10" y1="130" x2="250" y2="130" stroke="var(--border-strong)" strokeDasharray="2 4"/>
      <line x1="130" y1="10" x2="130" y2="250" stroke="var(--border-strong)" strokeDasharray="2 4"/>
      {/* trajectory */}
      <path d="M 40 200 Q 90 180 130 130 T 220 50" stroke="var(--accent)" strokeWidth="2" fill="none" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 8px var(--accent-glow))" }}/>
      {/* nodes */}
      {[[40,200],[80,180],[130,130],[180,90],[220,50]].map(([x,y], i) => (
        <circle key={i} cx={x} cy={y} r={i === 2 ? 6 : 3} fill="var(--accent)" style={{ filter: "drop-shadow(0 0 4px var(--accent-glow))" }}/>
      ))}
    </svg>
  </div>
);

const OnbRings = () => (
  <div style={{ position: "relative", width: 260, height: 260 }}>
    <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
      <ProgressRing value={0.72} size={220} stroke={3} />
    </div>
    <div style={{ position: "absolute", inset: 36, display: "grid", placeItems: "center" }}>
      <ProgressRing value={0.45} size={148} stroke={3} />
    </div>
    <div style={{ position: "absolute", inset: 76, display: "grid", placeItems: "center" }}>
      <ProgressRing value={0.88} size={108} stroke={5} />
    </div>
    <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div className="eyebrow" style={{ color: "var(--accent)", marginBottom: 4 }}>MOMENTUM</div>
        <div className="mono" style={{ fontSize: 36, fontWeight: 500, color: "var(--ink-0)" }}>68<span style={{ color: "var(--ink-3)", fontSize: 18 }}>%</span></div>
      </div>
    </div>
  </div>
);

const OnbSpark = () => (
  <div style={{ position: "relative", width: 260, height: 260 }}>
    <svg viewBox="0 0 260 260" style={{ position: "absolute", inset: 0 }}>
      {/* radiating lines */}
      {Array.from({length: 16}).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const x2 = 130 + Math.cos(angle) * 120;
        const y2 = 130 + Math.sin(angle) * 120;
        const x1 = 130 + Math.cos(angle) * 60;
        const y1 = 130 + Math.sin(angle) * 60;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--accent)" strokeOpacity="0.25" strokeWidth="1"/>;
      })}
      <circle cx="130" cy="130" r="58" fill="var(--bg-2)" stroke="var(--accent)" strokeWidth="2" style={{ filter: "drop-shadow(0 0 16px var(--accent-glow))" }}/>
      <path d="M 118 108 L 146 128 L 130 132 L 142 152 L 114 132 L 130 128 Z"
            fill="var(--accent)" style={{ filter: "drop-shadow(0 0 6px var(--accent-glow))" }}/>
    </svg>
  </div>
);

window.Onboarding = Onboarding;
