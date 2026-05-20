function MasterHero() {
  const heroStyles = {
    section: {
      position: "relative",
      overflow: "hidden",
      background: "linear-gradient(135deg, #020617 0%, #0F172A 48%, #062f2f 100%)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      color: "#F8FAFC",
    },
    topLine: {
      position: "absolute", insetInline: 0, top: 0, height: 1,
      background: "linear-gradient(90deg, transparent, rgba(94,234,212,0.55), transparent)",
    },
    blueFlare: {
      position: "absolute", left: "50%", top: 60, width: 640, height: 320,
      transform: "translateX(-50%)", borderRadius: "50%",
      background: "rgba(56,189,248,0.10)", filter: "blur(80px)", pointerEvents: "none",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "1.08fr 0.92fr",
      gap: 48,
      alignItems: "center",
      maxWidth: 1280, marginInline: "auto", paddingInline: 32, paddingBlock: 96,
    },
    h1: {
      fontSize: 52, lineHeight: 1.08, letterSpacing: "-0.025em",
      fontWeight: 600, margin: 0, color: "#F8FAFC",
      textWrap: "balance", overflowWrap: "break-word",
    },
    leftCol: { minWidth: 0 },
    sub: {
      marginTop: 24, fontSize: 18, lineHeight: 1.7, color: "#CBD5E1",
      maxWidth: 600,
    },
    btnRow: { marginTop: 36, display: "flex", gap: 12, flexWrap: "wrap" },
    card: {
      background: "rgba(255,255,255,0.04)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 20,
      padding: 20,
      boxShadow: "0 24px 70px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04)",
    },
    cardHead: {
      display: "flex", justifyContent: "space-between", alignItems: "flex-end",
      gap: 16, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.08)",
    },
    cardTitle: { fontSize: 20, fontWeight: 600, color: "#F8FAFC", marginTop: 8 },
    pill: {
      borderRadius: 6, padding: "6px 10px",
      background: "rgba(52,211,153,0.10)", border: "1px solid rgba(52,211,153,0.20)",
      color: "#34D399", fontSize: 12, fontWeight: 600,
    },
    signalRow: {
      display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "center",
      padding: "12px 14px", borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.08)", background: "rgba(2,6,23,0.35)", marginTop: 10,
    },
    num: {
      width: 28, height: 28, borderRadius: 8, display: "grid", placeItems: "center",
      background: "#FFFFFF", color: "#020617", fontWeight: 600, fontSize: 12,
    },
    signalText: { fontSize: 13, fontWeight: 500, color: "#E2E8F0" },
    bar: { height: 8, width: 64, borderRadius: 999, background: "linear-gradient(90deg,#5EEAD4,#38BDF8,#FBBF24)" },
    foot: {
      marginTop: 18, padding: 14, borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)",
      fontSize: 13, lineHeight: 1.55, color: "#CBD5E1",
    },
  };

  return (
    <section style={heroStyles.section}>
      <div style={heroStyles.topLine} />
      <div style={heroStyles.blueFlare} />
      <div style={heroStyles.grid}>
        <div style={heroStyles.leftCol}>
          <h1 style={heroStyles.h1}>
            Luis Ruiz builds practical AI, web, and automation systems for small businesses, creators, and operators.
          </h1>
          <p style={heroStyles.sub}>
            Through ruizTechServices, Gio turns messy workflows into clean digital systems: dashboards, automations, AI assistants, websites, and internal tools.
          </p>
          <div style={heroStyles.btnRow}>
            <Btn variant="primary" icon="sparkles" trailingIcon="arrow-right">View Services</Btn>
            <Btn variant="secondary" icon="folder-kanban" trailingIcon="arrow-right">See Projects</Btn>
            <Btn variant="secondary" icon="mail" trailingIcon="arrow-right">Contact Gio</Btn>
          </div>
        </div>

        <div style={heroStyles.card}>
          <div style={heroStyles.cardHead}>
            <div>
              <Eyebrow>Public master hub</Eyebrow>
              <div style={heroStyles.cardTitle}>ruizTechServices operating surface</div>
            </div>
            <div style={heroStyles.pill}>Public-safe</div>
          </div>
          {window.PUBLIC_DATA.signals.map((s, i) => (
            <div key={s} style={heroStyles.signalRow}>
              <span style={heroStyles.num}>{i + 1}</span>
              <span style={heroStyles.signalText}>{s}</span>
              <span style={heroStyles.bar} />
            </div>
          ))}
          <div style={heroStyles.foot}>
            A public entry point for services, proof-of-work, build notes, and practical system design.
          </div>
        </div>
      </div>
    </section>
  );
}

window.MasterHero = MasterHero;
