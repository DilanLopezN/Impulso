/* global React */
const { useState, useEffect, useRef, useMemo } = React;

/* ===================== ICONS ===================== */
const Icon = ({ name, size = 22, stroke = 1.6, ...rest }) => {
  const props = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor",
    strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round",
    ...rest
  };
  const paths = {
    home:     <><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></>,
    target:   <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></>,
    flame:    <><path d="M12 3s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4-1 3 1 4 1 4S8 9 12 3z"/></>,
    trophy:   <><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/></>,
    user:     <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    plus:     <><path d="M12 5v14M5 12h14"/></>,
    chevron:  <><path d="m9 6 6 6-6 6"/></>,
    chevronL: <><path d="m15 6-6 6 6 6"/></>,
    close:    <><path d="M6 6l12 12M18 6 6 18"/></>,
    check:    <><path d="m4 12 5 5L20 6"/></>,
    bell:     <><path d="M6 8a6 6 0 0 1 12 0c0 6 3 6 3 9H3c0-3 3-3 3-9M10 21h4"/></>,
    sparkle:  <><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></>,
    book:     <><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5"/></>,
    run:      <><circle cx="13" cy="4" r="2"/><path d="M4 20l4-6 3 2-2 4M8 14l-1-4 4-2 3 3 3 1M14 11l2 3-3 3"/></>,
    wallet:   <><path d="M3 7h18v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M3 7V5a1 1 0 0 1 1-1h12v3M17 13h2"/></>,
    zap:      <><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></>,
    moon:     <><path d="M20 14A8 8 0 1 1 10 4a7 7 0 0 0 10 10z"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.2.4.6.8 1 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></>,
    share:    <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></>,
    dots:     <><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></>,
    clock:    <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    edit:     <><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></>,
    search:   <><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></>,
    arrow:    <><path d="M5 12h14M13 5l7 7-7 7"/></>,
    trend:    <><path d="m3 17 6-6 4 4 8-8"/><path d="M14 7h7v7"/></>,
    lock:     <><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></>,
    medal:    <><circle cx="12" cy="15" r="6"/><path d="M8.5 10 6 3h12l-2.5 7"/><path d="M12 12v3M10 15h4"/></>,
    heart:    <><path d="M12 21s-8-4.5-8-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.5-8 11-8 11z"/></>,
    filter:   <><path d="M3 5h18l-7 9v6l-4-2v-4z"/></>,
    star:     <><path d="m12 3 3 6 6 1-4 5 1 6-6-3-6 3 1-6-4-5 6-1z"/></>,
  };
  return <svg {...props}>{paths[name]}</svg>;
};

/* ===================== STATUS BAR ===================== */
const StatusBar = () => (
  <div className="status-bar">
    <span className="mono">9:41</span>
    <div className="status-icons">
      <svg viewBox="0 0 20 12" fill="currentColor"><rect x="0" y="7" width="3" height="5" rx="0.5"/><rect x="5" y="5" width="3" height="7" rx="0.5"/><rect x="10" y="2" width="3" height="10" rx="0.5"/><rect x="15" y="0" width="3" height="12" rx="0.5"/></svg>
      <svg viewBox="0 0 16 12" fill="currentColor"><path d="M8 3c2 0 4 1 5 2l-1 1c-1-1-2-2-4-2s-3 1-4 2L3 5c1-1 3-2 5-2zm0-3c3 0 6 1 8 3l-1 1c-2-2-4-2-7-2S4 3 2 5L1 3c2-2 5-3 7-3z"/><circle cx="8" cy="9" r="1.5"/></svg>
      <svg viewBox="0 0 26 11" fill="none"><rect x="0.5" y="0.5" width="22" height="10" rx="2.5" stroke="currentColor" opacity="0.6"/><rect x="24" y="4" width="1.5" height="3" rx="0.5" fill="currentColor" opacity="0.6"/><rect x="2" y="2" width="18" height="7" rx="1.5" fill="currentColor"/></svg>
    </div>
  </div>
);

/* ===================== TAB BAR ===================== */
const TabBar = ({ active, onChange }) => {
  const tabs = [
    { id: "home",         icon: "home",   label: "Home" },
    { id: "habits",       icon: "flame",  label: "Hábitos" },
    { id: "rank",         icon: "medal",  label: "Rank" },
    { id: "achievements", icon: "trophy", label: "Conquistas" },
    { id: "profile",      icon: "user",   label: "Perfil" },
  ];
  return (
    <div className="tabbar">
      {tabs.map(t => (
        <button key={t.id}
                className={`tab ${active === t.id ? "active" : ""}`}
                onClick={() => onChange(t.id)}>
          <Icon name={t.icon} size={22} stroke={active === t.id ? 2 : 1.6} />
          <span className="tab-label">{t.label}</span>
        </button>
      ))}
    </div>
  );
};

/* ===================== PROGRESS RING ===================== */
const ProgressRing = ({ value, size = 120, stroke = 8, children, colorVar = "var(--accent)" }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - value);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg className="ring" width={size} height={size}>
        <circle className="ring-track" cx={size/2} cy={size/2} r={r} strokeWidth={stroke} />
        <circle className="ring-fill"
                cx={size/2} cy={size/2} r={r} strokeWidth={stroke}
                strokeDasharray={`${c - offset} ${c}`}
                style={{ stroke: colorVar, filter: `drop-shadow(0 0 8px ${colorVar})` }} />
      </svg>
      {children && (
        <div style={{
          position: "absolute", inset: 0,
          display: "grid", placeItems: "center", textAlign: "center"
        }}>{children}</div>
      )}
    </div>
  );
};

/* ===================== SPARKLINE / WEEKLY BARS ===================== */
const WeekBars = ({ days, height = 44 }) => {
  // days: array of {label, value 0..1, done: bool}
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height }}>
      {days.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{
            width: "100%",
            height: `${Math.max(8, d.value * height)}px`,
            minHeight: 6,
          }} className={`spark-bar ${d.done ? "on" : "dim"}`} />
          <span className="mono" style={{ fontSize: 9, color: d.today ? "var(--accent)" : "var(--ink-3)", letterSpacing: "0.05em" }}>
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ===================== HEAP / SECTION HEADERS ===================== */
const SectionHead = ({ eyebrow, title, action }) => (
  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 14 }}>
    <div>
      {eyebrow && <div className="eyebrow" style={{ marginBottom: 4 }}>{eyebrow}</div>}
      <div className="h3">{title}</div>
    </div>
    {action && <button className="small" style={{ color: "var(--accent)", fontWeight: 600 }}>{action}</button>}
  </div>
);

/* expose */
Object.assign(window, { Icon, StatusBar, TabBar, ProgressRing, WeekBars, SectionHead });
