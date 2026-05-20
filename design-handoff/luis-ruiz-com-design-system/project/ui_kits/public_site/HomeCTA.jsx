function HomeCTA() {
  const ctaStyles = {
    section: { background: "#0F172A", paddingBlock: 96, borderTop: "1px solid rgba(255,255,255,0.06)" },
    card: {
      maxWidth: 1100, marginInline: "auto",
      borderRadius: 28, padding: 56, position: "relative", overflow: "hidden",
      background: "linear-gradient(135deg,#020617 0%,#062f2f 100%)",
      border: "1px solid rgba(94,234,212,0.18)",
      boxShadow: "0 24px 70px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
    },
    bar: { position: "absolute", insetInline: 0, top: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(94,234,212,0.6),transparent)" },
    flare: { position: "absolute", right: -120, top: -120, width: 360, height: 360, borderRadius: "50%", background: "rgba(56,189,248,0.12)", filter: "blur(60px)" },
    grid: { position: "relative", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 48, alignItems: "center" },
    h2: { fontSize: 44, lineHeight: 1.1, letterSpacing: "-0.025em", fontWeight: 600, margin: 0 },
    sub: { marginTop: 16, fontSize: 16, lineHeight: 1.7, color: "#CBD5E1", maxWidth: 480 },
    actions: { marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" },
    side: { display: "flex", flexDirection: "column", gap: 12 },
    line: { display: "flex", gap: 12, alignItems: "center", color: "#CBD5E1", fontSize: 13 },
    dot: { width: 8, height: 8, borderRadius: 4, background: "#22C55E", boxShadow: "0 0 12px rgba(34,197,94,0.6)" },
  };
  return (
    <section style={ctaStyles.section}>
      <div style={ctaStyles.card}>
        <span style={ctaStyles.bar} />
        <span style={ctaStyles.flare} />
        <div style={ctaStyles.grid}>
          <div>
            <Eyebrow>Start a project</Eyebrow>
            <h2 style={ctaStyles.h2}>Need a system built? Tell Gio what you're trying to ship.</h2>
            <p style={ctaStyles.sub}>
              One conversation, scoped honestly. Free to discuss; quoted once we agree on the system we're building.
            </p>
            <div style={ctaStyles.actions}>
              <Btn variant="primary" icon="mail" trailingIcon="arrow-right">Contact Gio</Btn>
              <Btn variant="secondary" icon="folder-kanban" trailingIcon="arrow-right">View Projects</Btn>
            </div>
          </div>
          <div style={ctaStyles.side}>
            <div style={ctaStyles.line}><span style={ctaStyles.dot} /> Currently taking on 2 new builds this quarter.</div>
            <div style={ctaStyles.line}><span style={{ ...ctaStyles.dot, background: "#38BDF8", boxShadow: "0 0 12px rgba(56,189,248,0.6)" }} /> Based in NYC · remote globally.</div>
            <div style={ctaStyles.line}><span style={{ ...ctaStyles.dot, background: "#FBBF24", boxShadow: "0 0 12px rgba(251,191,36,0.6)" }} /> Reply within 1 business day.</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const footStyles = {
    foot: { background: "#020617", borderTop: "1px solid rgba(255,255,255,0.06)", paddingBlock: 32 },
    row: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, flexWrap: "wrap" },
    brand: { display: "flex", alignItems: "center", gap: 10 },
    mark: { height: 28, width: 28, borderRadius: 8, display: "grid", placeItems: "center", background: "#FFFFFF", color: "#020617", fontWeight: 700, fontFamily: "Georgia, serif", fontSize: 12 },
    small: { fontSize: 12, color: "#64748B" },
    links: { display: "flex", gap: 18 },
    a: { fontSize: 13, color: "#CBD5E1", textDecoration: "none" },
  };
  return (
    <footer style={footStyles.foot}>
      <Container>
        <div style={footStyles.row}>
          <div style={footStyles.brand}>
            <span style={footStyles.mark}>LR</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>ruizTechServices LLC</div>
              <div style={footStyles.small}>© 2025 Luis Giovanni Ruiz · NYC</div>
            </div>
          </div>
          <div style={footStyles.links}>
            <a href="#" style={footStyles.a}>Services</a>
            <a href="#" style={footStyles.a}>Projects</a>
            <a href="#" style={footStyles.a}>Blog</a>
            <a href="#" style={footStyles.a}>Contact</a>
            <a href="#" style={footStyles.a}>GitHub</a>
          </div>
        </div>
      </Container>
    </footer>
  );
}

Object.assign(window, { HomeCTA, Footer });
