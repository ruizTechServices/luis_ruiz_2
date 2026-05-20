function FeaturedProjects() {
  const fpStyles = {
    section: { background: "#0F172A", paddingBlock: 80 },
    head: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 32, flexWrap: "wrap" },
    h2: { fontSize: 36, lineHeight: 1.15, letterSpacing: "-0.02em", fontWeight: 600, margin: "8px 0 0" },
    seeAll: { fontSize: 13, fontWeight: 600, color: "#99F6E4", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 },
    grid: { marginTop: 36, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 },
    card: {
      background: "#020617", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 20, overflow: "hidden", textDecoration: "none", color: "inherit",
      display: "flex", flexDirection: "column",
    },
    thumbWrap: { aspectRatio: "16/10", overflow: "hidden", borderBottom: "1px solid rgba(255,255,255,0.06)" },
    thumb: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
    body: { padding: 20, flex: 1, display: "flex", flexDirection: "column" },
    meta: { fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#5EEAD4", fontWeight: 600 },
    title: { marginTop: 8, fontSize: 18, fontWeight: 600, color: "#F8FAFC" },
    desc: { marginTop: 10, fontSize: 13, lineHeight: 1.6, color: "#CBD5E1", flex: 1 },
    cta: { marginTop: 16, fontSize: 13, fontWeight: 600, color: "#F8FAFC", display: "inline-flex", alignItems: "center", gap: 6 },
  };
  return (
    <section style={fpStyles.section}>
      <Container>
        <div style={fpStyles.head}>
          <div>
            <Eyebrow>Featured projects</Eyebrow>
            <h2 style={fpStyles.h2}>Proof of work, in motion.</h2>
          </div>
          <a href="#" style={fpStyles.seeAll}>All projects <Icon name="arrow-right" size={14} /></a>
        </div>
        <div style={fpStyles.grid}>
          {window.PUBLIC_DATA.featuredProjects.map((p) => (
            <a key={p.title} href="#" style={fpStyles.card}>
              <div style={fpStyles.thumbWrap}>
                <img src={p.thumb} alt="" style={fpStyles.thumb} />
              </div>
              <div style={fpStyles.body}>
                <div style={fpStyles.meta}>{p.meta}</div>
                <div style={fpStyles.title}>{p.title}</div>
                <p style={fpStyles.desc}>{p.description}</p>
                <div style={fpStyles.cta}>Read the build → </div>
              </div>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}

window.FeaturedProjects = FeaturedProjects;
