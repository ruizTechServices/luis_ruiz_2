function PublicStatusPanel() {
  const panelStyles = {
    section: { background: "#020617", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBlock: 72 },
    head: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 32, flexWrap: "wrap" },
    h2: { fontSize: 36, lineHeight: 1.15, letterSpacing: "-0.02em", fontWeight: 600, margin: "8px 0 0", color: "#F8FAFC" },
    note: { maxWidth: 480, fontSize: 14, lineHeight: 1.7, color: "#CBD5E1" },
    grid: { marginTop: 36, display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 16 },
    card: {
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 20, padding: 20,
    },
    cardHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    iconWrap: {
      width: 32, height: 32, borderRadius: 8, display: "grid", placeItems: "center",
      background: "#0F172A", border: "1px solid rgba(255,255,255,0.08)", color: "#99F6E4",
    },
    statusPill: {
      padding: "4px 10px", borderRadius: 6,
      background: "rgba(94,234,212,0.10)", color: "#99F6E4",
      fontSize: 11, fontWeight: 600,
    },
    title: { fontSize: 15, fontWeight: 600, color: "#F8FAFC", margin: 0 },
    desc: { marginTop: 10, fontSize: 13, lineHeight: 1.55, color: "#CBD5E1" },
  };
  const icons = ["building-2", "gauge", "waypoints", "activity", "file-text"];
  return (
    <section style={panelStyles.section}>
      <Container>
        <div style={panelStyles.head}>
          <div>
            <Eyebrow>Public focus areas</Eyebrow>
            <h2 style={panelStyles.h2}>What this hub is organizing right now.</h2>
          </div>
          <p style={panelStyles.note}>
            This panel shows public-facing direction only: service areas, products, experiments, and writing.
          </p>
        </div>
        <div style={panelStyles.grid}>
          {window.PUBLIC_DATA.publicStatusItems.map((it, i) => (
            <article key={it.title} style={panelStyles.card}>
              <div style={panelStyles.cardHead}>
                <span style={panelStyles.iconWrap}><Icon name={icons[i]} size={15} color="#99F6E4" /></span>
                <span style={panelStyles.statusPill}>{it.status}</span>
              </div>
              <h3 style={panelStyles.title}>{it.title}</h3>
              <p style={panelStyles.desc}>{it.description}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

window.PublicStatusPanel = PublicStatusPanel;
