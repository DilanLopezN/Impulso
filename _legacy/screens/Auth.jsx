/* global React, Icon */
const { useState } = React;

/* =================================================
   AUTH — Login / Registro
   ================================================= */
const Auth = ({ onDone }) => {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loadingProvider, setLoadingProvider] = useState(null);

  const isLogin = mode === "login";
  const canSubmit = isLogin
    ? form.email.includes("@") && form.password.length >= 4
    : form.name.length > 1 && form.email.includes("@") && form.password.length >= 6;

  const socialLogin = (provider) => {
    setLoadingProvider(provider);
    setTimeout(() => { setLoadingProvider(null); onDone(); }, 900);
  };

  return (
    <div className="phone-inner">
      <StatusBar />
      <div className="screen grid-bg" style={{ padding: "0 24px", display: "flex", flexDirection: "column" }}>
        {/* Brand */}
        <div style={{ paddingTop: 24, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ position: "relative", width: 72, height: 72, marginBottom: 16 }}>
            <svg viewBox="0 0 72 72" style={{ position: "absolute", inset: 0 }}>
              <defs>
                <linearGradient id="brandG" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="1"/>
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.5"/>
                </linearGradient>
              </defs>
              <circle cx="36" cy="36" r="32" fill="none" stroke="url(#brandG)" strokeWidth="2" opacity="0.3"/>
              <circle cx="36" cy="36" r="24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray="113 30" style={{ filter: "drop-shadow(0 0 6px var(--accent-glow))" }}/>
              <path d="M 24 42 L 36 24 L 32 36 L 48 30 L 36 48 L 40 36 Z" fill="var(--accent)" style={{ filter: "drop-shadow(0 0 8px var(--accent-glow))" }}/>
            </svg>
          </div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>IMPULSO</div>
          <h1 className="h1" style={{ marginBottom: 8, textAlign: "center", textWrap: "balance" }}>
            {isLogin ? <>Bem-vindo de <span className="neon">volta</span></> : <>Comece sua <span className="neon">jornada</span></>}
          </h1>
          <p className="body" style={{ color: "var(--ink-2)", textAlign: "center", maxWidth: 280 }}>
            {isLogin ? "Entre para continuar construindo momentum" : "Crie sua conta em segundos e defina sua primeira meta"}
          </p>
        </div>

        {/* Mode toggle */}
        <div style={{ marginTop: 24, display: "flex", background: "var(--glass-strong)", border: "1px solid var(--border)", borderRadius: 12, padding: 3 }}>
          {[{id:"login", label:"Entrar"}, {id:"register", label:"Criar conta"}].map(o => (
            <button key={o.id} onClick={() => setMode(o.id)} style={{
              flex: 1, padding: "10px 12px", borderRadius: 9,
              background: mode === o.id ? "var(--accent)" : "transparent",
              color: mode === o.id ? "var(--accent-ink)" : "var(--ink-2)",
              fontSize: 13, fontWeight: 600,
              boxShadow: mode === o.id ? "0 0 14px var(--accent-glow)" : "none",
              transition: "all 160ms"
            }}>{o.label}</button>
          ))}
        </div>

        {/* Social */}
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
          <SocialButton provider="google" loading={loadingProvider === "google"}
                        onClick={() => socialLogin("google")}>
            Continuar com Google
          </SocialButton>
          <SocialButton provider="linkedin" loading={loadingProvider === "linkedin"}
                        onClick={() => socialLogin("linkedin")}>
            Continuar com LinkedIn
          </SocialButton>
          <SocialButton provider="github" loading={loadingProvider === "github"}
                        onClick={() => socialLogin("github")}>
            Continuar com GitHub
          </SocialButton>
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0 16px" }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }}/>
          <span className="eyebrow" style={{ fontSize: 9, color: "var(--ink-3)" }}>OU COM E-MAIL</span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }}/>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {!isLogin && (
            <Field label="NOME" placeholder="Seu nome"
                   value={form.name} onChange={v => setForm({ ...form, name: v })} />
          )}
          <Field label="E-MAIL" placeholder="voce@exemplo.com" type="email"
                 value={form.email} onChange={v => setForm({ ...form, email: v })} />
          <Field label="SENHA" placeholder="••••••••" type="password"
                 value={form.password} onChange={v => setForm({ ...form, password: v })} />
        </div>

        {isLogin && (
          <button style={{ alignSelf: "flex-end", marginTop: 10, fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>
            Esqueceu a senha?
          </button>
        )}

        <button
          className="btn btn-primary btn-full"
          disabled={!canSubmit}
          onClick={onDone}
          style={{ marginTop: 16, opacity: canSubmit ? 1 : 0.4 }}
        >
          {isLogin ? "Entrar" : "Criar conta"}
          <Icon name="arrow" size={16} stroke={2} />
        </button>

        <div style={{ marginTop: 14, textAlign: "center", paddingBottom: 28 }}>
          <span className="small" style={{ color: "var(--ink-3)" }}>
            {isLogin ? "Novo por aqui?" : "Já tem uma conta?"}{" "}
          </span>
          <button onClick={() => setMode(isLogin ? "register" : "login")}
                  className="small" style={{ color: "var(--accent)", fontWeight: 600 }}>
            {isLogin ? "Criar conta" : "Entrar"}
          </button>
        </div>

        {!isLogin && (
          <div style={{ textAlign: "center", paddingBottom: 20 }}>
            <p className="small" style={{ color: "var(--ink-3)", fontSize: 10, maxWidth: 280, margin: "0 auto", lineHeight: 1.5 }}>
              Ao criar conta você concorda com os <span style={{ color: "var(--ink-1)" }}>Termos</span> e <span style={{ color: "var(--ink-1)" }}>Política de Privacidade</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div>
    <div className="eyebrow" style={{ marginBottom: 6, fontSize: 9 }}>{label}</div>
    <input className="input" type={type} placeholder={placeholder}
           value={value} onChange={e => onChange(e.target.value)} />
  </div>
);

const SocialButton = ({ provider, children, onClick, loading }) => {
  const logos = {
    google: (
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      </svg>
    ),
    linkedin: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2">
        <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0z"/>
      </svg>
    ),
    github: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
        <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.58C20.57 22.3 24 17.8 24 12.5 24 5.87 18.63.5 12 .5z"/>
      </svg>
    ),
  };
  const bgs = {
    google:   "#fff",
    linkedin: "#fff",
    github:   "#24292f",
  };
  const inks = {
    google:   "#0a0e18",
    linkedin: "#0a0e18",
    github:   "#ffffff",
  };
  return (
    <button onClick={onClick} disabled={loading} style={{
      width: "100%", padding: "13px 16px",
      borderRadius: 12,
      background: bgs[provider], color: inks[provider],
      border: "1px solid var(--border-strong)",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
      fontSize: 14, fontWeight: 600,
      opacity: loading ? 0.6 : 1,
      transition: "transform 160ms",
      boxShadow: "0 1px 0 rgba(255,255,255,0.1) inset"
    }}>
      {loading ? (
        <div style={{
          width: 16, height: 16, borderRadius: 999,
          border: `2px solid ${inks[provider]}30`,
          borderTopColor: inks[provider],
          animation: "spin 0.8s linear infinite"
        }}/>
      ) : logos[provider]}
      <span>{children}</span>
    </button>
  );
};

/* spinner keyframes */
if (!document.getElementById("auth-kf")) {
  const s = document.createElement("style");
  s.id = "auth-kf";
  s.textContent = "@keyframes spin { to { transform: rotate(360deg); } }";
  document.head.appendChild(s);
}

window.Auth = Auth;
