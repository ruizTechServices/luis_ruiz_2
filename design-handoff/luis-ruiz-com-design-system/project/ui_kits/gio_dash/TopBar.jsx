function TopBar() {
  const topStyles = {
    bar: {
      position: "sticky", top: 0, zIndex: 30,
      height: 60, paddingInline: 24,
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24,
      background: "rgba(2,6,23,0.65)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    },
    left: { display: "flex", alignItems: "center", gap: 14 },
    bread: { fontSize: 13, color: "#94A3B8" },
    breadCurrent: { color: "#F8FAFC", fontWeight: 600 },
    cmd: {
      display: "flex", alignItems: "center", gap: 10, width: 360,
      height: 36, padding: "0 12px", borderRadius: 8,
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)",
      color: "#94A3B8", fontSize: 13,
    },
    kbd: { padding: "2px 6px", borderRadius: 4, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 10, fontFamily: "var(--font-mono)", color: "#CBD5E1", marginLeft: "auto" },
    right: { display: "flex", alignItems: "center", gap: 12 },
    env: {
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "5px 10px", borderRadius: 6,
      background: "rgba(52,211,153,0.10)", color: "#34D399",
      fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
    },
    iconBtn: {
      height: 36, width: 36, borderRadius: 8, display: "grid", placeItems: "center",
      background: "transparent", color: "#CBD5E1", border: "1px solid rgba(255,255,255,0.06)",
    },
  };
  return (
    <div style={topStyles.bar}>
      <div style={topStyles.left}>
        <div style={topStyles.bread}>
          gio_dash <span style={{ color: "#475569" }}>/</span> <span style={topStyles.breadCurrent}>Today</span>
        </div>
      </div>
      <div style={topStyles.cmd}>
        <DashIcon name="search" size={14} color="#64748B" />
        Search projects, leads, clients, decisions…
        <span style={topStyles.kbd}>⌘K</span>
      </div>
      <div style={topStyles.right}>
        <span style={topStyles.env}>
          <span style={{ width: 6, height: 6, borderRadius: 6, background: "#22C55E", boxShadow: "0 0 8px rgba(34,197,94,0.6)" }} />
          prod · main
        </span>
        <span style={topStyles.iconBtn}><DashIcon name="bell" size={15} /></span>
        <span style={topStyles.iconBtn}><DashIcon name="settings" size={15} /></span>
      </div>
    </div>
  );
}

window.TopBar = TopBar;
