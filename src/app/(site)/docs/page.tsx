"use client";

import { BookOpen, Code, Puzzle, Shield, Zap, Settings } from "lucide-react";

const sections = [
  {
    icon: BookOpen,
    title: "Getting Started",
    description: "Set up your account, create your first project, and learn the basics of the graph editor.",
    links: ["Create an account", "Your first project", "Graph editor basics", "Inviting teammates"],
  },
  {
    icon: Puzzle,
    title: "Core Concepts",
    description: "Understand how tasks, dependencies, folder nodes, and sub-graphs work together.",
    links: ["Task nodes", "Dependencies & edges", "Folder nodes & sub-graphs", "Status lifecycle"],
  },
  {
    icon: Code,
    title: "API Reference",
    description: "Integrate Threadline with your existing tools using our REST API.",
    links: ["Authentication", "Projects", "Tasks", "Webhooks"],
  },
  {
    icon: Zap,
    title: "Collaboration",
    description: "Learn about real-time sync, sharing, roles, and team management.",
    links: ["Real-time collaboration", "Sharing & permissions", "Roles (Owner/Editor/Viewer)", "Team management"],
  },
  {
    icon: Shield,
    title: "Security",
    description: "Understand how your data is protected and how to configure access controls.",
    links: ["Authentication & SSO", "Role-based access", "Data encryption", "Rate limiting"],
  },
  {
    icon: Settings,
    title: "Account & Settings",
    description: "Manage your profile, notification preferences, theme, and billing.",
    links: ["Profile settings", "Notification preferences", "Theme & appearance", "Billing & plans"],
  },
];

export default function DocsPage() {
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
          Documentation
        </h1>
        <p style={{ fontSize: "16px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
          Everything you need to know about Threadline, from getting started to advanced configuration.
        </p>
      </div>

      {/* Sections Grid */}
      <div
        className="docs-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "20px",
        }}
      >
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.title}
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-lg)",
                padding: "24px",
                transition: "border-color .18s ease, box-shadow .18s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "rgba(139, 92, 246, 0.2)";
                el.style.boxShadow = "var(--shadow-sm)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "var(--border-default)";
                el.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  background: "var(--accent-soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "14px",
                }}
              >
                <Icon style={{ width: "18px", height: "18px", color: "var(--accent)" }} />
              </div>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: "6px",
                }}
              >
                {section.title}
              </h3>
              <p
                style={{
                  fontSize: "13.5px",
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                  marginBottom: "14px",
                }}
              >
                {section.description}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {section.links.map((link) => (
                  <span
                    key={link}
                    style={{
                      fontSize: "13px",
                      color: "var(--accent)",
                      cursor: "pointer",
                      transition: "opacity .15s ease",
                    }}
                  >
                    → {link}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .docs-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
