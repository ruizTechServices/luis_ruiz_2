// Dashboard atoms — scoped style object name to avoid global collision with public-site atoms.

const dashAtomStyles = {
  card: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: 22,
    boxShadow: "0 2px 6px rgba(2,6,23,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
  },
  cardHead: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16,
  },
  title: { fontSize: 17, fontWeight: 600, color: "#F8FAFC", margin: 0 },
  sub:   { fontSize: 13, color: "#94A3B8", margin: "4px 0 0", lineHeight: 1.55 },
  eyebrow: { fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#94A3B8" },
  pill: (tone) => ({
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
    background: tone.bg, color: tone.fg,
  }),
  dot: (fg) => ({ width: 6, height: 6, borderRadius: 6, background: fg }),
};

function DashIcon({ name, size = 18, color = "#CBD5E1", stroke = 1.75 }) {
  React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); });
  return <i data-lucide={name} style={{ width: size, height: size, color, strokeWidth: stroke, display: "inline-flex" }} />;
}

function DashCard({ title, sub, icon, iconColor = "#5EEAD4", iconBg = "rgba(94,234,212,0.10)", children, action }) {
  return (
    <section style={dashAtomStyles.card}>
      <div style={dashAtomStyles.cardHead}>
        <div>
          <h2 style={dashAtomStyles.title}>{title}</h2>
          {sub && <p style={dashAtomStyles.sub}>{sub}</p>}
        </div>
        {icon && (
          <span style={{ height: 36, width: 36, borderRadius: 10, background: iconBg, color: iconColor, display: "grid", placeItems: "center" }}>
            <DashIcon name={icon} size={18} color={iconColor} />
          </span>
        )}
      </div>
      <div style={{ marginTop: 16 }}>{children}</div>
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </section>
  );
}

function StatusPill({ status }) {
  const tone = window.DASH_STATUS_TONE[status] || { fg: "#CBD5E1", bg: "rgba(255,255,255,0.06)" };
  return (
    <span style={dashAtomStyles.pill(tone)}>
      <span style={dashAtomStyles.dot(tone.fg)} />
      {status}
    </span>
  );
}

function DashBtn({ variant = "secondary", icon, children, href = "#", small }) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 8, height: small ? 32 : 38,
    padding: small ? "0 12px" : "0 14px", borderRadius: 8,
    fontSize: small ? 12 : 13, fontWeight: 600, textDecoration: "none",
    border: "1px solid transparent", transition: "background-color .15s, border-color .15s",
  };
  const variants = {
    primary:   { background: "#2563EB", color: "#FFFFFF", borderColor: "#2563EB" },
    secondary: { background: "rgba(255,255,255,0.04)", color: "#F8FAFC", borderColor: "rgba(255,255,255,0.18)" },
    ghost:     { background: "transparent", color: "#CBD5E1", borderColor: "transparent" },
  };
  return (
    <a href={href} style={{ ...base, ...variants[variant] }}>
      {icon && <DashIcon name={icon} size={14} color="currentColor" />}
      {children}
    </a>
  );
}

Object.assign(window, { dashAtomStyles, DashIcon, DashCard, StatusPill, DashBtn });
