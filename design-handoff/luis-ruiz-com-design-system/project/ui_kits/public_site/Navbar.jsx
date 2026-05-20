function Navbar() {
  const navStyles = {
    wrap: {
      position: "sticky", top: 0, zIndex: 40,
      backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
      background: "rgba(2,6,23,0.65)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    },
    inner: {
      display: "flex", alignItems: "center", justifyContent: "space-between",
      height: 64, maxWidth: 1280, marginInline: "auto", paddingInline: 32,
    },
    brand: { display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#F8FAFC" },
    mark: {
      height: 30, width: 30, borderRadius: 8, display: "grid", placeItems: "center",
      background: "#FFFFFF", color: "#020617", fontWeight: 700, fontSize: 13, fontFamily: "Georgia, serif",
    },
    name: { fontSize: 14, fontWeight: 600, color: "#F8FAFC" },
    nav: { display: "flex", alignItems: "center", gap: 26 },
    link: { fontSize: 13, color: "#CBD5E1", textDecoration: "none", fontWeight: 500 },
    cta: {
      display: "inline-flex", alignItems: "center", gap: 8, height: 36, padding: "0 14px",
      borderRadius: 8, background: "#FFFFFF", color: "#020617",
      fontSize: 13, fontWeight: 600, textDecoration: "none",
    },
  };
  const items = ["Services", "Projects", "Blog", "Round-Robin", "Nucleus"];
  return (
    <header style={navStyles.wrap}>
      <div style={navStyles.inner}>
        <a href="#" style={navStyles.brand}>
          <span style={navStyles.mark}>LR</span>
          <span style={navStyles.name}>luis-ruiz.com</span>
        </a>
        <nav style={navStyles.nav}>
          {items.map((it) => (
            <a key={it} href="#" style={navStyles.link}>{it}</a>
          ))}
        </nav>
        <a href="#" style={navStyles.cta}>
          <Icon name="mail" size={14} />
          Contact Gio
        </a>
      </div>
    </header>
  );
}

window.Navbar = Navbar;
