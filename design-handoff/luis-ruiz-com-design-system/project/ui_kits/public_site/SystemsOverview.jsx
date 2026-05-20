function SystemsOverview() {
  const sysStyles = {
    section: { background: "#020617", paddingBlock: 80, borderTop: "1px solid rgba(255,255,255,0.04)" },
    head: { maxWidth: 720 },
    h2: { fontSize: 36, lineHeight: 1.15, letterSpacing: "-0.02em", fontWeight: 600, margin: "8px 0 0" },
    intro: { marginTop: 16, fontSize: 16, lineHeight: 1.7, color: "#CBD5E1" },
    grid: { marginTop: 36, display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14 },
    card: {
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16, padding: 18, position: "relative", overflow: "hidden",
    },
    n: { fontSize: 11, fontFamily: "var(--font-mono)", color: "#5EEAD4", letterSpacing: "0.18em" },
    title: { marginTop: 6, fontSize: 15, fontWeight: 600 },
    desc: { marginTop: 8, fontSize: 12, lineHeight: 1.55, color: "#94A3B8" },
    bar: { position: "absolute", left: 0, right: 0, bottom: 0, height: 2, background: "linear-gradient(90deg,#5EEAD4,#38BDF8,#FBBF24)" },
  };
  return (
    <section style={sysStyles.section}>
      <Container>
        <div style={sysStyles.head}>
          <Eyebrow>Master hub systems</Eyebrow>
          <h2 style={sysStyles.h2}>One site, five operating layers.</h2>
          <p style={sysStyles.intro}>
            The hub coordinates project records, client work, AI experiments, content, and revenue — instead of scattering them across separate tools.
          </p>
        </div>
        <div style={sysStyles.grid}>
          {window.PUBLIC_DATA.systems.map((sys, i) => (
            <article key={sys.title} style={sysStyles.card}>
              <div style={sysStyles.n}>SYS · 0{i + 1}</div>
              <h3 style={sysStyles.title}>{sys.title}</h3>
              <p style={sysStyles.desc}>{sys.description}</p>
              <span style={sysStyles.bar} />
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

window.SystemsOverview = SystemsOverview;
