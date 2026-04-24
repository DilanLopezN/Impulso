/* global React, ReactDOM, Onboarding, Home, GoalDetail, CreateGoal, Habits, Achievements, Profile, Celebration, TabBar, useTweaks, TweaksPanel, TweakSection, TweakColor, TweakToggle, TweakRadio */
const { useState, useEffect, useMemo } = React;

const DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentHue": 180,
  "theme": "dark",
  "showOnboarding": false,
  "showAuth": true
}/*EDITMODE-END*/;

const ACCENTS = [
  { id: 180, label: "Ciano",   css: "oklch(0.85 0.18 180)" },
  { id: 150, label: "Verde",   css: "oklch(0.85 0.18 150)" },
  { id: 260, label: "Roxo",    css: "oklch(0.78 0.20 290)" },
  { id: 25,  label: "Coral",   css: "oklch(0.78 0.20 25)"  },
  { id: 85,  label: "Âmbar",   css: "oklch(0.88 0.17 85)"  },
  { id: 330, label: "Magenta", css: "oklch(0.78 0.22 330)" },
];

/* ===== seed data ===== */
const seedGoals = [
  {
    id: "g1",
    title: "Correr uma maratona",
    description: "Completar meus primeiros 42km até junho, construindo resistência gradualmente.",
    category: "Fitness",
    icon: "run",
    color: "oklch(0.82 0.18 25)",
    progress: 0.62,
    deadline: "15 Jun",
    daysLeft: 53,
    next: "Próximo: Corrida de 15km",
    streak: 12,
    xp: 840, xpTotal: 1200,
    milestones: [
      { title: "Correr 5km sem parar",       date: "15 Jan",  done: true,  xp: 100 },
      { title: "Completar 10km",             date: "22 Fev",  done: true,  xp: 150 },
      { title: "Corrida de 21km (meia)",     date: "18 Abr",  done: true,  xp: 250 },
      { title: "Treino longo de 30km",       date: "10 Mai",  done: false, xp: 300 },
      { title: "Maratona completa — 42km",   date: "15 Jun",  done: false, xp: 500 },
    ],
  },
  {
    id: "g2",
    title: "Curso de React Avançado",
    description: "Dominar hooks avançados, performance e arquitetura de apps React em produção.",
    category: "Aprendizado",
    icon: "book",
    color: "oklch(0.82 0.16 260)",
    progress: 0.78,
    deadline: "30 Abr",
    daysLeft: 7,
    next: "Próxima aula: Context otimizado",
    streak: 8,
    xp: 1560, xpTotal: 2000,
    milestones: [
      { title: "Módulo 1 — Fundamentos",   date: "05 Fev", done: true,  xp: 200 },
      { title: "Módulo 2 — Hooks",         date: "01 Mar", done: true,  xp: 300 },
      { title: "Módulo 3 — Performance",   date: "20 Mar", done: true,  xp: 400 },
      { title: "Módulo 4 — Arquitetura",   date: "25 Abr", done: false, xp: 500 },
      { title: "Projeto final",            date: "30 Abr", done: false, xp: 600 },
    ],
  },
  {
    id: "g3",
    title: "Economizar R$ 15.000",
    description: "Reserva de emergência para 6 meses de gastos essenciais.",
    category: "Finanças",
    icon: "wallet",
    color: "oklch(0.82 0.18 150)",
    progress: 0.41,
    deadline: "31 Dez",
    daysLeft: 252,
    next: "Depósito mensal: R$ 1.200",
    xp: 410, xpTotal: 1000,
    milestones: [
      { title: "Primeiros R$ 3.000",   date: "28 Fev", done: true,  xp: 150 },
      { title: "R$ 6.000 guardados",   date: "15 Abr", done: true,  xp: 200 },
      { title: "R$ 10.000",            date: "30 Jul", done: false, xp: 300 },
      { title: "R$ 15.000 completos",  date: "31 Dez", done: false, xp: 500 },
    ],
  },
  {
    id: "g4",
    title: "Meditar diariamente",
    description: "Construir prática consistente de mindfulness — 15 minutos por dia.",
    category: "Mente",
    icon: "sparkle",
    color: "oklch(0.82 0.18 310)",
    progress: 0.55,
    deadline: "Contínuo",
    daysLeft: 0,
    next: "Meditação de hoje: 15min",
    streak: 28,
    xp: 550, xpTotal: 1000,
    milestones: [
      { title: "7 dias consecutivos",   date: "10 Jan",  done: true,  xp: 50  },
      { title: "21 dias (hábito)",      date: "24 Jan",  done: true,  xp: 150 },
      { title: "50 dias de prática",    date: "22 Fev",  done: true,  xp: 300 },
      { title: "100 dias",              date: "05 Mai",  done: false, xp: 500 },
    ],
  },
];

const seedHabits = [
  { id: "h1", title: "Meditar 15min",        short: "Meditar",   icon: "sparkle", color: "oklch(0.82 0.18 310)", time: "07:00 · manhã",    streak: 28, weekDone: 6, todayDone: true,  week: [1,1,1,1,1,1,0] },
  { id: "h2", title: "Correr ou caminhar",   short: "Correr",    icon: "run",     color: "oklch(0.82 0.18 25)",  time: "18:00 · fim do dia", streak: 12, weekDone: 5, todayDone: false, week: [1,0,1,1,1,1,0] },
  { id: "h3", title: "Ler 30 minutos",       short: "Leitura",   icon: "book",    color: "oklch(0.82 0.16 260)", time: "22:00 · antes de dormir", streak: 41, weekDone: 7, todayDone: true,  week: [1,1,1,1,1,1,1] },
  { id: "h4", title: "Beber 2L de água",     short: "Água",      icon: "zap",     color: "oklch(0.82 0.18 195)", time: "ao longo do dia", streak: 9, weekDone: 4, todayDone: false, week: [1,1,0,1,1,0,0] },
  { id: "h5", title: "Journal da noite",     short: "Journal",   icon: "edit",    color: "oklch(0.82 0.15 80)",  time: "22:30 · reflexão", streak: 19, weekDone: 6, todayDone: false, week: [1,1,1,0,1,1,1] },
];

const initialState = {
  name: "Marina",
  level: 8,
  xp: 1240,
  xpToNext: 2000,
  streak: 28,
  todayDone: 1,
  todayTotal: 3,
  weekDays: [
    { label: "D", value: 0.8, done: true },
    { label: "S", value: 0.9, done: true },
    { label: "T", value: 1.0, done: true, today: true },
    { label: "Q", value: 0.0, done: false },
    { label: "Q", value: 0.0, done: false },
    { label: "S", value: 0.0, done: false },
    { label: "S", value: 0.0, done: false },
  ],
  goals: seedGoals,
  habits: seedHabits,
};

/* ===================== APP ===================== */
const App = () => {
  const [tweaks, setTweak] = useTweaks(DEFAULTS);
  const [route, setRoute] = useState(tweaks.showAuth ? "auth" : (tweaks.showOnboarding ? "onboarding" : "home"));
  const [tab, setTab] = useState("home");
  const [state, setState] = useState(initialState);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [celebrate, setCelebrate] = useState(false);

  // apply theme + accent as CSS vars
  useEffect(() => {
    const accent = ACCENTS.find(a => a.id === tweaks.accentHue) || ACCENTS[0];
    const { id: hue } = accent;
    const css = `oklch(0.85 0.18 ${hue})`;
    const glow = `oklch(0.85 0.18 ${hue} / 0.35)`;
    const dim = `oklch(0.85 0.18 ${hue} / 0.12)`;
    document.documentElement.style.setProperty("--accent", css);
    document.documentElement.style.setProperty("--accent-glow", glow);
    document.documentElement.style.setProperty("--accent-dim", dim);
    document.documentElement.dataset.theme = tweaks.theme;
  }, [tweaks.accentHue, tweaks.theme]);

  const dispatch = (action) => {
    if (action.type === "toggle") {
      setState(s => ({ ...s, todayDone: Math.min(s.todayTotal, s.todayDone + 1) }));
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 2400);
    }
  };
  const toggleHabit = (id) => {
    setState(s => ({
      ...s,
      habits: s.habits.map(h => h.id === id ? { ...h, todayDone: !h.todayDone } : h)
    }));
  };
  const toggleMilestone = (idx) => {
    setState(s => ({
      ...s,
      goals: s.goals.map(g => g.id !== selectedGoalId ? g : {
        ...g,
        milestones: g.milestones.map((m, i) => i === idx ? { ...m, done: !m.done } : m)
      })
    }));
  };

  const openGoal = (id) => {
    setSelectedGoalId(id);
    setRoute("goal");
  };
  const currentGoal = state.goals.find(g => g.id === selectedGoalId);

  // route switching
  const handleTab = (t) => {
    if (t === "create") { setRoute("create"); return; }
    setTab(t);
    setRoute(t);
  };

  const renderScreen = () => {
    if (route === "auth")       return <Auth onDone={() => { setRoute("onboarding"); }} />;
    if (route === "onboarding") return <Onboarding onDone={() => { setRoute("home"); setTab("home"); }} />;
    if (route === "goal")       return <GoalDetail goal={currentGoal} onBack={() => setRoute("home")} onToggleMilestone={toggleMilestone}/>;
    if (route === "create")     return <CreateGoal onClose={() => setRoute(tab)} onCreate={() => { setCelebrate(true); setTimeout(() => setCelebrate(false), 2400); setRoute(tab); }}/>;
    if (route === "home")       return <Home state={state} dispatch={dispatch} openGoal={openGoal}/>;
    if (route === "habits")     return <Habits habits={state.habits} toggleHabit={toggleHabit} />;
    if (route === "achievements") return <Achievements />;
    if (route === "rank")       return <Rank state={state} />;
    if (route === "profile")    return <Profile state={state} onOpenOnboarding={() => setRoute("onboarding")} onReset={() => { setState(initialState); }} />;
    return null;
  };

  const showTabs = ["home", "habits", "rank", "achievements", "profile"].includes(route);

  return (
    <>
      <div className="stage">
        <div className="phone">
          <div key={route} className="screen-fade" style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
            {renderScreen()}
            {showTabs && (
              <button
                onClick={() => setRoute("create")}
                className="fab"
                aria-label="Criar nova meta"
                style={{ bottom: 104 }}
              >
                <Icon name="plus" size={24} stroke={2.4} />
              </button>
            )}
            {showTabs && <TabBar active={tab} onChange={handleTab} />}
          </div>
          <Celebration show={celebrate} onClose={() => setCelebrate(false)} />
        </div>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection title="Tema">
          <TweakRadio label="Aparência" value={tweaks.theme}
            onChange={(v) => setTweak("theme", v)}
            options={[{ value: "dark", label: "Escuro" }, { value: "light", label: "Claro" }]}/>
        </TweakSection>
        <TweakSection title="Cor de destaque">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {ACCENTS.map(a => (
              <button key={a.id} onClick={() => setTweak("accentHue", a.id)}
                      style={{
                        padding: "10px 8px", borderRadius: 10,
                        background: tweaks.accentHue === a.id ? `${a.css}20` : "rgba(255,255,255,0.04)",
                        border: `1px solid ${tweaks.accentHue === a.id ? a.css : "rgba(255,255,255,0.08)"}`,
                        color: "#fff", fontSize: 11, fontWeight: 600,
                        display: "flex", alignItems: "center", gap: 8, cursor: "pointer"
                      }}>
                <span style={{ width: 12, height: 12, borderRadius: 999, background: a.css,
                               boxShadow: `0 0 8px ${a.css}` }}/>
                {a.label}
              </button>
            ))}
          </div>
        </TweakSection>
        <TweakSection title="Navegação">
          <div style={{ display: "grid", gap: 8 }}>
            <button onClick={() => setRoute("auth")} style={{
              width: "100%", padding: 10, borderRadius: 10,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer"
            }}>Ver login / registro</button>
            <button onClick={() => setRoute("onboarding")} style={{
              width: "100%", padding: 10, borderRadius: 10,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer"
            }}>Ver onboarding</button>
          </div>
        </TweakSection>
      </TweaksPanel>
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
