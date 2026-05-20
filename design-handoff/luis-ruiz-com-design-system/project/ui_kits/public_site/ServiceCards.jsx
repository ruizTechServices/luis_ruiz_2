function ServiceCards() {
  const serviceStyles = {
    section: { background: "#0F172A", paddingBlock: 80 },
    h2: { fontSize: 36, lineHeight: 1.15, letterSpacing: "-0.02em", fontWeight: 600, margin: "8px 0 0", color: "#F8FAFC" },
    intro: { marginTop: 16, maxWidth: 720, fontSize: 16, lineHeight: 1.7, color: "#CBD5E1" },
    grid: { marginTop: 36, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 },
    card: {
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 20, padding: 24, textDecoration: "none", color: "inherit",
      transition: "transform .2s ease, border-color .2s ease",
      display: "block", cursor: "pointer",
    },
    iconChip: {
      height: 44, width: 44, borderRadius: 12, display: "grid", placeItems: "center",
      background: "#FFFFFF", color: "#020617", marginBottom: 20,
    },
    title: { fontSize: 18, fontWeight: 600, color: "#F8FAFC", margin: 0 },
    desc: { marginTop: 12, fontSize: 14, lineHeight: 1.7, color: "#CBD5E1" },
    cta: { marginTop: 20, fontSize: 13, fontWeight: 600, color: "#99F6E4" },
  };
  return (
    <section style={serviceStyles.section}>
      <Container>
        <div style={{ maxWidth: 720 }}>
          <Eyebrow>Services</Eyebrow>
          <h2 style={serviceStyles.h2}>Practical builds for people who need the system to work.</h2>
          <p style={serviceStyles.intro}>
            ruizTechServices focuses on useful software, clear implementation, and technical support that helps operators move work forward.
          </p>
        </div>
        <div style={serviceStyles.grid}>
          {window.PUBLIC_DATA.services.map((svc) => (
            <a
              key={svc.title}
              href="#"
              style={serviceStyles.card}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = "rgba(94,234,212,0.30)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              }}
            >
              <div style={serviceStyles.iconChip}><Icon name={svc.icon} size={20} color="#020617" /></div>
              <h3 style={serviceStyles.title}>{svc.title}</h3>
              <p style={serviceStyles.desc}>{svc.description}</p>
              <p style={serviceStyles.cta}>Start with Gio →</p>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}

window.ServiceCards = ServiceCards;
