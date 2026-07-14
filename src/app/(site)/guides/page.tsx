"use client";

import { Lightbulb, GitBranch, Users, BarChart3, Brain, FolderTree } from "lucide-react";

const guides = [
  {
    icon: GitBranch,
    title: "Building Your First Dependency Graph",
    description: "Learn how to create task nodes, connect them with dependencies, and use the infinite canvas to organize your project visually.",
    readTime: "5 min read",
    difficulty: "Beginner",
  },
  {
    icon: Users,
    title: "Collaborating with Your Team",
    description: "Set up your team, assign roles, share projects with view/edit links, and collaborate in real-time.",
    readTime: "7 min read",
    difficulty: "Beginner",
  },
  {
    icon: FolderTree,
    title: "Organizing Large Projects with Sub-Graphs",
    description: "Use folder nodes to break complex projects into manageable sub-graphs. Navigate with breadcrumbs and auto-derived status.",
    readTime: "6 min read",
    difficulty: "Intermediate",
  },
  {
    icon: Brain,
    title: "Using the AI Assistant",
    description: "Describe your project in plain text and let the AI generate a complete dependency graph with tasks and connections.",
    readTime: "4 min read",
    difficulty: "Beginner",
  },
  {
    icon: BarChart3,
    title: "Tracking Progress with Analytics",
    description: "Read completion charts, interpret workload distribution, and use deadline views to keep your team on track.",
    readTime: "5 min read",
    difficulty: "Intermediate",
  },
  {
    icon: Lightbulb,
    title: "Approval Workflows Best Practices",
    description: "Set up approval chains, designate reviewers, and use dependency enforcement to maintain quality gates.",
    readTime: "8 min read",
    difficulty: "Advanced",
  },
];

function DifficultyBadge({ level }: { level: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    Beginner: { bg: "var(--accent-soft)", color: "var(--accent)" },
    Intermediate: { bg: "rgba(139, 92, 246, 0.08)", color: "var(--text-secondary)" },
    Advanced: { bg: "var(--bg-muted)", color: "var(--text-muted)" },
  };
  const s = styles[level] || styles.Beginner;
  return (
    <span
      style={{
        fontSize: "10.5px",
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: "999px",
        background: s.bg,
        color: s.color,
      }}
    >
      {level}
    </span>
  );
}

export default function GuidesPage() {
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
          Guides
        </h1>
        <p style={{ fontSize: "16px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
          Step-by-step tutorials to help you get the most out of Threadline.
        </p>
      </div>

      {/* Guides List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {guides.map((guide) => {
          const Icon = guide.icon;
          return (
            <div
              key={guide.title}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-lg)",
                padding: "22px 26px",
                transition: "border-color .18s ease, transform .18s ease, box-shadow .18s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "rgba(139, 92, 246, 0.2)";
                el.style.transform = "translateX(4px)";
                el.style.boxShadow = "var(--shadow-sm)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "var(--border-default)";
                el.style.transform = "translateX(0)";
                el.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "var(--accent-soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon style={{ width: "20px", height: "20px", color: "var(--accent)" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    marginBottom: "4px",
                  }}
                >
                  {guide.title}
                </h3>
                <p
                  style={{
                    fontSize: "13.5px",
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                  }}
                >
                  {guide.description}
                </p>
              </div>
              <div
                className="guide-meta"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  flexShrink: 0,
                }}
              >
                <DifficultyBadge level={guide.difficulty} />
                <span style={{ fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                  {guide.readTime}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 640px) {
          .guide-meta {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
