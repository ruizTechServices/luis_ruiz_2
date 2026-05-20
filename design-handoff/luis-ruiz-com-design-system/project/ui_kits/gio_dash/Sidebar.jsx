function Sidebar({ active = "today" }) {
  const navStyles = {
    aside: {
      width: 232, flexShrink: 0, padding: 16, position: "sticky", top: 0,
      height: "100vh", background: "#020617", borderRight: "1px solid rgba(255,255,255,0.06)",
      display: "flex", flexDirection: "column", gap: 18,
    },
    brand: { display: "flex", alignItems: "center", gap: 10, paddingInline: 6, paddingBlock: 6 },
    mark:  { height: 32, width: 32, borderRadius: 8, background: "#FFFFFF", color: "#020617", display: "grid", placeItems: "center", fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 14 },
    name:  { fontSize: 14, fontWeight: 700, color: "#F8FAFC" },
    note:  { fontSize: 11, color: "#64748B" },
    eyebrow: { fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#5EEAD4", paddingInline: 8, fontWeight: 600 },
    list: { display: "flex", flexDirection: "column", gap: 2 },
    item: (act) => ({
      display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
      borderRadius: 8, fontSize: 13, fontWeight: act ? 600 : 500, textDecoration: "none",
      color: act ? "#F8FAFC" : "#CBD5E1",
      background: act ? "linear-gradient(90deg, rgba(37,99,235,0.18), rgba(56,189,248,0.05))" : "transparent",
      border: "1px solid " + (act ? "rgba(56,189,248,0.25)" : "transparent"),
    }),
    sep: { height: 1, background: "rgba(255,255,255,0.06)", marginBlock: 6 },
    profile: { marginTop: "auto", display: "flex", alignItems: "center", gap: 10, padding: 8, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" },
    avatar: { height: 32, width: 32, borderRadius: 8, background: "linear-gradient(135deg,#5EEAD4,#38BDF8)", color: "#020617", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 12 },
  };

  const sections = [
    { eyebrow: "Owner", items: [
      ["today", "target", "Today"],
      ["projects", "folder-kanban", "Projects"],
      ["leads", "inbox", "Leads"],
      ["revenue", "circle-dollar-sign", "Revenue"],
      ["clients", "users", "Clients"],
    ]},
    { eyebrow: "Build", items: [
      ["content", "newspaper", "Content"],
      ["decisions", "git-branch", "Decisions"],
      ["systems", "link-2", "System links"],
    ]},
    { eyebrow: "AI lab", items: [
      ["ollama", "bot", "Ollama"],
      ["round-robin", "git-pull-request", "Round-Robin"],
      ["nucleus", "atom", "Nucleus"],
    ]},
  ];

  return (
    <aside style={navStyles.aside}>
      <div style={navStyles.brand}>
        <span style={navStyles.mark}>LR</span>
        <div>
          <div style={navStyles.name}>Gio Command</div>
          <div style={navStyles.note}>Owner-only</div>
        </div>
      </div>

      {sections.map((s, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={navStyles.eyebrow}>{s.eyebrow}</div>
          <div style={navStyles.list}>
            {s.items.map(([id, icon, label]) => (
              <a key={id} href="#" style={navStyles.item(id === active)}>
                <DashIcon name={icon} size={15} color={id === active ? "#7DD3FC" : "#94A3B8"} />
                {label}
              </a>
            ))}
          </div>
          {i < sections.length - 1 && <div style={navStyles.sep} />}
        </div>
      ))}

      <div style={navStyles.profile}>
        <span style={navStyles.avatar}>G</span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600 }}>Luis "Gio" Ruiz</div>
          <div style={navStyles.note}>gio@ruiztechservices.com</div>
        </div>
      </div>
    </aside>
  );
}

window.Sidebar = Sidebar;
