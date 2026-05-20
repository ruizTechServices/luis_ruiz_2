// System links, Decisions log, Content queue, AI tools, System health.

function SystemLinksCard() {
  const sStyles = {
    grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
    item: { padding: 12, borderRadius: 10, background: "rgba(2,6,23,0.5)", border: "1px solid rgba(255,255,255,0.06)", textDecoration: "none", color: "inherit" },
    head: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
    label: { fontSize: 13, fontWeight: 600, color: "#F8FAFC" },
    desc: { marginTop: 4, fontSize: 11, color: "#94A3B8", lineHeight: 1.55 },
  };
  return (
    <DashCard title="System Links" sub="Public systems, product surfaces, and operating dashboards." icon="link-2">
      <div style={sStyles.grid}>
        {window.DASH_DATA.systemLinks.map((it) => (
          <a key={it.label} href={it.href} style={sStyles.item}>
            <div style={sStyles.head}>
              <span style={sStyles.label}>{it.label}</span>
              <DashIcon name={it.external ? "arrow-up-right" : "arrow-right"} size={14} color="#64748B" />
            </div>
            <div style={sStyles.desc}>{it.description}</div>
          </a>
        ))}
      </div>
    </DashCard>
  );
}

function DecisionsLogCard() {
  const dStyles = {
    row: { padding: 12, borderRadius: 12, background: "rgba(2,6,23,0.5)", border: "1px solid rgba(255,255,255,0.06)" },
    head: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
    title: { fontSize: 13, fontWeight: 600, color: "#F8FAFC", lineHeight: 1.4 },
    note: { marginTop: 6, fontSize: 11, color: "#94A3B8", lineHeight: 1.55 },
  };
  return (
    <DashCard
      title="Decision Log"
      sub="Latest operating decisions, with status."
      icon="git-branch"
      iconColor="#A78BFA"
      iconBg="rgba(167,139,250,0.12)"
      action={<DashBtn variant="ghost" icon="plus" small>Log a decision</DashBtn>}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {window.DASH_DATA.decisions.map((d) => (
          <article key={d.title} style={dStyles.row}>
            <div style={dStyles.head}>
              <div style={dStyles.title}>{d.title}</div>
              <StatusPill status={d.status} />
            </div>
            <div style={dStyles.note}>{d.note}</div>
          </article>
        ))}
      </div>
    </DashCard>
  );
}

function ContentQueueCard() {
  const cStyles = {
    row: { display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "center", padding: 12, borderRadius: 12, background: "rgba(2,6,23,0.5)", border: "1px solid rgba(255,255,255,0.06)" },
    num:  { width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600, color: "#CBD5E1" },
    title: { fontSize: 13, fontWeight: 600, color: "#F8FAFC" },
    sub: { fontSize: 11, color: "#94A3B8", marginTop: 2 },
  };
  return (
    <DashCard
      title="Content Queue"
      sub="Build-log posts in the writing pipeline."
      icon="newspaper"
      iconColor="#7DD3FC"
      iconBg="rgba(56,189,248,0.12)"
      action={<DashBtn variant="secondary" icon="file-plus-2">New post</DashBtn>}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {window.DASH_DATA.contentQueue.map((p, i) => (
          <div key={p.title} style={cStyles.row}>
            <div style={cStyles.num}>{i + 1}</div>
            <div>
              <div style={cStyles.title}>{p.title}</div>
              <div style={cStyles.sub}>target · {p.target}</div>
            </div>
            <StatusPill status={p.state} />
          </div>
        ))}
      </div>
    </DashCard>
  );
}

function AiToolsCard() {
  const aStyles = {
    row: { display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "center", padding: 12, borderRadius: 12, background: "rgba(2,6,23,0.5)", border: "1px solid rgba(255,255,255,0.06)", textDecoration: "none", color: "inherit" },
    chip: { height: 32, width: 32, borderRadius: 8, background: "linear-gradient(135deg,#2563EB,#4F46E5)", color: "#FFFFFF", display: "grid", placeItems: "center" },
    name: { fontSize: 13, fontWeight: 600, color: "#F8FAFC" },
    desc: { fontSize: 11, color: "#94A3B8", marginTop: 2, lineHeight: 1.5 },
  };
  const icons = { "Ollama Chat": "bot", "Round-Robin": "git-pull-request", "Nucleus API": "atom", "GitHub Snapshot": "git-branch" };
  return (
    <DashCard title="AI Tools" sub="Internal AI surfaces and product endpoints." icon="bot" iconColor="#C4B5FD" iconBg="rgba(167,139,250,0.12)">
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {window.DASH_DATA.aiTools.map((t) => (
          <a key={t.name} href={t.href} style={aStyles.row}>
            <div style={aStyles.chip}><DashIcon name={icons[t.name] || "sparkles"} size={16} color="#FFFFFF" /></div>
            <div>
              <div style={aStyles.name}>{t.name}</div>
              <div style={aStyles.desc}>{t.description}</div>
            </div>
            <StatusPill status={t.status} />
          </a>
        ))}
      </div>
    </DashCard>
  );
}

function SystemHealthCard() {
  const hStyles = {
    row: { display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, alignItems: "center", padding: "10px 12px", borderRadius: 10, background: "rgba(2,6,23,0.5)", border: "1px solid rgba(255,255,255,0.06)" },
    name: { fontSize: 13, fontWeight: 600, color: "#F8FAFC" },
    lat:  { fontFamily: "var(--font-mono)", fontSize: 11, color: "#94A3B8" },
  };
  return (
    <DashCard title="System Health" sub="External providers, last checked just now." icon="heart-pulse" iconColor="#34D399" iconBg="rgba(52,211,153,0.10)">
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {window.DASH_DATA.health.map((h) => (
          <div key={h.name} style={hStyles.row}>
            <div style={hStyles.name}>{h.name}</div>
            <div style={hStyles.lat}>{h.latency}</div>
            <StatusPill status={h.status} />
          </div>
        ))}
      </div>
    </DashCard>
  );
}

Object.assign(window, { SystemLinksCard, DecisionsLogCard, ContentQueueCard, AiToolsCard, SystemHealthCard });
