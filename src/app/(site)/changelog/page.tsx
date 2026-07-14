import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog — Threadline",
  description: "See what's new in Threadline. Latest updates, improvements, and fixes.",
};

const entries = [
  {
    version: "v2.1.0",
    date: "July 10, 2026",
    highlights: [
      { type: "feature", text: "AI Assistant can now generate full dependency graphs from a text description" },
      { type: "feature", text: "New pre-built templates: Mobile App, Research Paper, Design Project" },
      { type: "improvement", text: "Dark mode overhaul — refined colors and better contrast throughout" },
      { type: "fix", text: "Fixed issue where real-time presence would disconnect after 30 minutes idle" },
    ],
  },
  {
    version: "v2.0.0",
    date: "June 20, 2026",
    highlights: [
      { type: "feature", text: "Direct messaging — 1-on-1 private conversations with any team member" },
      { type: "feature", text: "Comment attachments — attach images and PDFs directly to task comments" },
      { type: "feature", text: "Private comments — mark comments as visible only to you and the project owner" },
      { type: "improvement", text: "Redesigned notification system with granular per-category preferences" },
      { type: "improvement", text: "Project channels now support real-time message delivery" },
    ],
  },
  {
    version: "v1.8.0",
    date: "June 1, 2026",
    highlights: [
      { type: "feature", text: "Approval workflows — submit tasks for review, approve or reject with reason" },
      { type: "feature", text: "Analytics dashboard with completion rate, status breakdown, and workload charts" },
      { type: "improvement", text: "Better role-based access — clearer Owner/Editor/Viewer permission model" },
      { type: "fix", text: "Resolved file upload timeout for PDFs over 5 MB" },
    ],
  },
  {
    version: "v1.6.0",
    date: "May 12, 2026",
    highlights: [
      { type: "feature", text: "Folder nodes — organize large projects with nested sub-graphs" },
      { type: "feature", text: "Auto-derived parent status reflects sub-graph progress automatically" },
      { type: "improvement", text: "Smoother canvas performance with 200+ nodes" },
      { type: "fix", text: "Fixed cycle detection false positives in complex branching graphs" },
    ],
  },
  {
    version: "v1.4.0",
    date: "April 22, 2026",
    highlights: [
      { type: "feature", text: "Real-time collaboration — see live updates and presence indicators" },
      { type: "feature", text: "Google Docs–style sharing with view/edit links" },
      { type: "improvement", text: "Task detail panel redesigned for faster editing" },
      { type: "improvement", text: "Mobile-responsive sidebar and stacked layouts" },
    ],
  },
  {
    version: "v1.2.0",
    date: "March 30, 2026",
    highlights: [
      { type: "feature", text: "Email notifications via Resend for assignments, due dates, and approvals" },
      { type: "feature", text: "Profile picture upload with Vercel Blob storage" },
      { type: "improvement", text: "Loading skeletons on every page" },
      { type: "fix", text: "Fixed edge cases in graph edge deletion" },
    ],
  },
  {
    version: "v1.0.0",
    date: "March 1, 2026",
    highlights: [
      { type: "feature", text: "Initial release — infinite canvas, dependency connections, cycle detection" },
      { type: "feature", text: "Custom color-coded nodes with status, assignees, and due dates" },
      { type: "feature", text: "Team management with role-based access" },
      { type: "feature", text: "Dark and light theme support" },
    ],
  },
];

function TypeBadge({ type }: { type: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    feature: { bg: "var(--accent-soft)", color: "var(--accent)" },
    improvement: { bg: "rgba(139, 92, 246, 0.08)", color: "var(--text-secondary)" },
    fix: { bg: "var(--bg-muted)", color: "var(--text-muted)" },
  };
  const s = styles[type] || styles.fix;
  return (
    <span
      style={{
        fontSize: "10px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        padding: "3px 8px",
        borderRadius: "999px",
        background: s.bg,
        color: s.color,
        flexShrink: 0,
      }}
    >
      {type}
    </span>
  );
}

export default function ChangelogPage() {
  return (
    <div>
      {/* Hero */}
      <div style={{ marginBottom: "48px" }}>
        <h1
          style={{
            fontSize: "36px",
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            marginBottom: "12px",
          }}
        >
          Changelog
        </h1>
        <p style={{ fontSize: "16px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
          New features, improvements, and fixes — shipped regularly.
        </p>
      </div>

      {/* Entries */}
      <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
        {entries.map((entry) => (
          <div
            key={entry.version}
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-lg)",
              padding: "28px 32px",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "20px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  fontFamily: "'JetBrains Mono', monospace",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  background: "var(--accent-soft)",
                  color: "var(--accent)",
                }}
              >
                {entry.version}
              </span>
              <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{entry.date}</span>
            </div>

            {/* Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {entry.highlights.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <TypeBadge type={item.type} />
                  <span style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
