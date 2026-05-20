function DashboardHeader() {
  const hStyles = {
    wrap: {
      display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "end",
      padding: 24, borderRadius: 24,
      background: "linear-gradient(135deg, rgba(2,6,23,0.6) 0%, rgba(6,47,47,0.5) 100%)",
      border: "1px solid rgba(255,255,255,0.08)",
      position: "relative", overflow: "hidden",
    },
    bar: { position: "absolute", insetInline: 0, top: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(94,234,212,0.6),transparent)" },
    chip: {
      display: "inline-flex", alignItems: "center", gap: 8,
      padding: "6px 12px", borderRadius: 8,
      background: "rgba(52,211,153,0.10)", border: "1px solid rgba(52,211,153,0.20)",
      color: "#34D399", fontSize: 12, fontWeight: 600, marginBottom: 14,
    },
    h1:    { fontSize: 38, fontWeight: 600, letterSpacing: "-0.025em", margin: 0, color: "#F8FAFC" },
    sub:   { marginTop: 10, fontSize: 14, lineHeight: 1.7, color: "#CBD5E1", maxWidth: 640 },
    date:  { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "14px 16px" },
    dl:    { fontSize: 12, color: "#94A3B8", display: "flex", alignItems: "center", gap: 8, fontWeight: 600 },
    dv:    { marginTop: 4, fontSize: 14, fontWeight: 600, color: "#F8FAFC" },
  };
  const fmt = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(new Date());

  return (
    <header style={hStyles.wrap}>
      <span style={hStyles.bar} />
      <div>
        <div style={hStyles.chip}>
          <DashIcon name="check-circle-2" size={14} color="#34D399" />
          Owner-only command center
        </div>
        <h1 style={hStyles.h1}>Gio Command Center</h1>
        <p style={hStyles.sub}>
          Private operating shell for ruizTechServices, luis-ruiz.com, public content, client-facing systems, and AI product work.
        </p>
      </div>
      <div style={hStyles.date}>
        <div style={hStyles.dl}><DashIcon name="calendar-days" size={14} color="#99F6E4" /> Today</div>
        <div style={hStyles.dv}>{fmt}</div>
      </div>
    </header>
  );
}

window.DashboardHeader = DashboardHeader;
