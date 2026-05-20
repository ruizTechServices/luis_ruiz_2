// Today Focus + Quick Actions.

function TodayFocusCard() {
  const tStyles = {
    row: { padding: 14, borderRadius: 12, background: "rgba(2,6,23,0.5)", border: "1px solid rgba(255,255,255,0.06)" },
    label: { fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#94A3B8" },
    val:   { marginTop: 8, fontSize: 14, fontWeight: 600, color: "#F8FAFC", lineHeight: 1.45 },
  };
  const items = [
    { label: "Primary focus", value: "Refactor luis-ruiz.com into master hub" },
    { label: "Next action",   value: "Implement feature-spec loop" },
    { label: "Blockers",      value: "None recorded", muted: true },
  ];
  return (
    <DashCard title="Today Focus" sub="The current command-center priority." icon="target" iconColor="#C4B5FD" iconBg="rgba(167,139,250,0.10)">
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((it) => (
          <div key={it.label} style={tStyles.row}>
            <div style={tStyles.label}>{it.label}</div>
            <div style={{ ...tStyles.val, color: it.muted ? "#94A3B8" : "#F8FAFC" }}>{it.value}</div>
          </div>
        ))}
      </div>
    </DashCard>
  );
}

function QuickActionsPanel() {
  const qStyles = {
    grid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 },
    tile: {
      padding: 14, borderRadius: 12,
      background: "rgba(2,6,23,0.5)", border: "1px solid rgba(255,255,255,0.06)",
      textDecoration: "none", color: "inherit",
      transition: "border-color .15s, background .15s",
    },
    icon: { height: 36, width: 36, borderRadius: 10, display: "grid", placeItems: "center", background: "#FFFFFF", color: "#020617", marginBottom: 10 },
    name: { fontSize: 13, fontWeight: 600, color: "#F8FAFC" },
    desc: { marginTop: 4, fontSize: 11, color: "#94A3B8" },
  };
  const actions = [
    { label: "New Post",     icon: "file-plus-2", desc: "Draft a build-log update" },
    { label: "Edit Projects",icon: "folder-kanban", desc: "Public project records" },
    { label: "Upload Photos",icon: "image-plus",  desc: "Review media library" },
    { label: "Admin Chat",   icon: "message-square-text", desc: "Owner chat surface" },
  ];
  return (
    <DashCard title="Quick Actions" sub="Common owner workflows." icon="zap" iconColor="#FBBF24" iconBg="rgba(251,191,36,0.10)">
      <div style={qStyles.grid}>
        {actions.map((a) => (
          <a key={a.label} href="#" style={qStyles.tile}>
            <div style={qStyles.icon}><DashIcon name={a.icon} size={16} color="#020617" /></div>
            <div style={qStyles.name}>{a.label}</div>
            <div style={qStyles.desc}>{a.desc}</div>
          </a>
        ))}
      </div>
    </DashCard>
  );
}

Object.assign(window, { TodayFocusCard, QuickActionsPanel });
