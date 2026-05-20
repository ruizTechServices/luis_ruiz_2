function CaseStudyPreview() {
  const csStyles = {
    section: { background: "#020617", paddingBlock: 80 },
    h2: { fontSize: 36, lineHeight: 1.15, letterSpacing: "-0.02em", fontWeight: 600, margin: "8px 0 0" },
    intro: { marginTop: 14, fontSize: 14, lineHeight: 1.7, color: "#CBD5E1", maxWidth: 660 },
    card: {
      marginTop: 36, background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, overflow: "hidden",
      display: "grid", gridTemplateColumns: "1.2fr 1fr",
    },
    rows: { padding: 32, display: "flex", flexDirection: "column", gap: 16 },
    row: { display: "grid", gridTemplateColumns: "160px 1fr", gap: 16, paddingBottom: 16, borderBottom: "1px dashed rgba(255,255,255,0.08)" },
    label: { fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "#99F6E4", fontWeight: 600, paddingTop: 2 },
    value: { fontSize: 14, lineHeight: 1.7, color: "#E2E8F0" },
    visual: {
      background: "linear-gradient(135deg,#0F172A 0%,#062f2f 100%)",
      borderLeft: "1px solid rgba(255,255,255,0.06)",
      padding: 28, display: "flex", flexDirection: "column", justifyContent: "space-between",
    },
    thumb: { width: "100%", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", aspectRatio: "1.4/1", objectFit: "cover" },
    cap: { fontSize: 12, color: "#94A3B8", marginTop: 14, lineHeight: 1.6 },
  };
  return (
    <section style={csStyles.section}>
      <Container>
        <Eyebrow>Latest case study</Eyebrow>
        <h2 style={csStyles.h2}>From portfolio to operating hub.</h2>
        <p style={csStyles.intro}>
          A walk-through of how the new master hub replaces the legacy portfolio shell with a sharper public-facing surface.
        </p>
        <div style={csStyles.card}>
          <div style={csStyles.rows}>
            {window.PUBLIC_DATA.caseStudyRows.map((r, i) => (
              <div key={r.label} style={{ ...csStyles.row, borderBottom: i === window.PUBLIC_DATA.caseStudyRows.length - 1 ? "none" : csStyles.row.borderBottom }}>
                <div style={csStyles.label}>{r.label}</div>
                <div style={csStyles.value}>{r.value}</div>
              </div>
            ))}
          </div>
          <div style={csStyles.visual}>
            <img src="../../assets/bg-circuit-blue.jpg" alt="" style={csStyles.thumb} />
            <p style={csStyles.cap}>Public hub · Next.js App Router · Supabase-backed projects · shipped Nov 2025.</p>
          </div>
        </div>
      </Container>
    </section>
  );
}

window.CaseStudyPreview = CaseStudyPreview;
