// Shared atoms used across the public site kit.
// IMPORTANT: scope style objects with unique names (publicAtomStyles) to avoid global collisions.

const publicAtomStyles = {
  eyebrow: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "var(--rt-teal-200)",
  },
  pageMaxW: { maxWidth: 1280, marginInline: "auto", paddingInline: 32 },
};

function Eyebrow({ children }) {
  return <p style={publicAtomStyles.eyebrow}>{children}</p>;
}

function Container({ children, style }) {
  return <div style={{ ...publicAtomStyles.pageMaxW, ...style }}>{children}</div>;
}

function Icon({ name, size = 16, color, stroke = 1.75 }) {
  // Lazy-init Lucide once the component mounts.
  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });
  return (
    <i
      data-lucide={name}
      style={{ width: size, height: size, color, strokeWidth: stroke, display: "inline-flex" }}
    />
  );
}

function Btn({ variant = "primary", children, icon, trailingIcon, onClick, href }) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    height: 44,
    padding: "0 18px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: 0,
    border: "1px solid transparent",
    cursor: "pointer",
    textDecoration: "none",
    transition: "background-color .15s ease, border-color .15s ease, transform .15s ease",
  };
  const variants = {
    primary: { background: "#FFFFFF", color: "#020617", borderColor: "#FFFFFF" },
    secondary: { background: "rgba(255,255,255,0.04)", color: "#F8FAFC", borderColor: "rgba(255,255,255,0.18)" },
    ghost: { background: "transparent", color: "#CBD5E1", borderColor: "transparent" },
    blue: { background: "#2563EB", color: "#FFFFFF", borderColor: "#2563EB" },
  };
  const props = { style: { ...base, ...variants[variant] }, onClick };
  const content = (
    <>
      {icon && <Icon name={icon} size={16} />}
      {children}
      {trailingIcon && <Icon name={trailingIcon} size={16} />}
    </>
  );
  return href ? <a href={href} {...props}>{content}</a> : <button {...props}>{content}</button>;
}

Object.assign(window, { Eyebrow, Container, Icon, Btn });
