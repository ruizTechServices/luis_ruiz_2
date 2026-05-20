// Top row: Revenue snapshot, Open leads, Active projects.

function RevenueSnapshotCard() {
  const rev = {
    metric: {
      padding: 14, borderRadius: 14,
      background: "rgba(2,6,23,0.5)", border: "1px solid rgba(255,255,255,0.06)",
    },
    row: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
    label: { fontSize: 12, fontWeight: 500, color: "#CBD5E1" },
    delta: { padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600 },
    val: { marginTop: 10, fontSize: 30, lineHeight: 1.1, fontWeight: 600, letterSpacing: "-0.02em", color: "#F8FAFC" },
    detail: { marginTop: 4, fontSize: 11, color: "#64748B", lineHeight: 1.5 },
  };
  const tones = {
    emerald: { fg: "#34D399", bg: "rgba(52,211,153,0.12)" },
    blue:    { fg: "#7DD3FC", bg: "rgba(56,189,248,0.14)" },
    amber:   { fg: "#FBBF24", bg: "rgba(234,179,8,0.14)" },
  };
  return (
    <DashCard title="Revenue Snapshot" sub="Tracked across active engagements." icon="circle-dollar-sign">
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {window.DASH_DATA.metrics.map((m) => {
          const t = tones[m.tone];
          return (
            <div key={m.label} style={rev.metric}>
              <div style={rev.row}>
                <div style={rev.label}>{m.label}</div>
                <span style={{ ...rev.delta, background: t.bg, color: t.fg }}>{m.delta}</span>
              </div>
              <div style={rev.val}>{m.value}</div>
              <div style={rev.detail}>{m.detail}</div>
            </div>
          );
        })}
      </div>
    </DashCard>
  );
}

function OpenLeadsCard() {
  const lStyles = {
    row: { display: "grid", gridTemplateColumns: "1fr auto", gap: 10, padding: 12, borderRadius: 12, background: "rgba(2,6,23,0.5)", border: "1px solid rgba(255,255,255,0.06)" },
    name: { fontSize: 13, fontWeight: 600, color: "#F8FAFC" },
    note: { marginTop: 4, fontSize: 11, color: "#94A3B8", lineHeight: 1.5 },
    val:  { fontSize: 13, fontWeight: 600, color: "#F8FAFC", textAlign: "right" },
    val2: { fontSize: 11, color: "#64748B" },
  };
  return (
    <DashCard
      title="Open Leads"
      sub="3 active · $11.2k pipeline"
      icon="inbox"
      iconColor="#7DD3FC"
      iconBg="rgba(56,189,248,0.12)"
      action={<DashBtn variant="secondary" icon="plus-circle">Review public intake</DashBtn>}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {window.DASH_DATA.leads.map((l) => (
          <div key={l.name} style={lStyles.row}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={lStyles.name}>{l.name}</span>
                <StatusPill status={l.stage} />
              </div>
              <div style={lStyles.note}>{l.note}</div>
            </div>
            <div>
              <div style={lStyles.val}>{l.value}</div>
              <div style={lStyles.val2}>opp value</div>
            </div>
          </div>
        ))}
      </div>
    </DashCard>
  );
}

function ActiveProjectsCard() {
  const pStyles = {
    row: { padding: 12, borderRadius: 12, background: "rgba(2,6,23,0.5)", border: "1px solid rgba(255,255,255,0.06)" },
    head: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 },
    name: { fontSize: 13, fontWeight: 600, color: "#F8FAFC" },
    next: { marginTop: 6, fontSize: 11, color: "#94A3B8", lineHeight: 1.5 },
  };
  return (
    <DashCard title="Active Projects" sub="In motion across services and products." icon="folder-kanban">
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {window.DASH_DATA.activeProjects.map((p) => (
          <article key={p.name} style={pStyles.row}>
            <div style={pStyles.head}>
              <span style={pStyles.name}>{p.name}</span>
              <StatusPill status={p.status} />
            </div>
            <div style={pStyles.next}>Next: {p.next}</div>
          </article>
        ))}
      </div>
    </DashCard>
  );
}

Object.assign(window, { RevenueSnapshotCard, OpenLeadsCard, ActiveProjectsCard });
