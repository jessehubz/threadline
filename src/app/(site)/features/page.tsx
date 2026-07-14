"use client";

import { GitBranch, Users, Zap, Shield, BarChart3, Bell, Palette, Brain } from "lucide-react";

const features = [
  {
    icon: GitBranch,
    title: "Visual Dependency Graphs",
    description:
      "Organize tasks on an infinite canvas. Draw directed edges to define dependencies, detect cycles in real-time, and navigate nested sub-graphs with folder nodes.",
    color: "var(--accent)",
  },
  {
    icon: Users,
    title: "Real-Time Collaboration",
    description:
      "Work together seamlessly with live sync via WebSockets, presence indicators, role-based access control, and Google Docs–style sharing with view/edit links.",
    color: "#7C3AED",
  },
  {
    icon: Brain,
    title: "AI Assistant",
    description:
      "Describe your project in plain text and generate a full dependency graph. Choose from pre-built templates or let the intelligent parser create task structures for you.",
    color: "#A78BFA",
  },
  {
    icon: Zap,
    title: "Approval Workflows",
    description:
      "Built-in approval workflows let you submit tasks for review, with one-click approve/reject and dependency enforcement - tasks can't complete until upstream work is done.",
    color: "#6D28D9",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description:
      "Track completion rate over time, visualize status breakdowns, monitor workload per person, and surface overdue tasks with beautiful, interactive charts.",
    color: "#8B5CF6",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "In-app and email notifications for assignments, approvals, rejections, and due dates. Granular preferences let you control exactly what reaches you.",
    color: "#C4B5FD",
  },
  {
    icon: Shield,
    title: "Enterprise-Grade Security",
    description:
      "Role-based access control, input sanitization, rate limiting, file validation, CSRF protection, and private comments - security built into every layer.",
    color: "#4C1D95",
  },
  {
    icon: Palette,
    title: "Beautiful Design",
    description:
      "Dark and light themes, loading skeletons, toast notifications, responsive layouts from mobile to desktop, and polished interactions throughout.",
    color: "#8B5CF6",
  },
];

export default function FeaturesPage() {
  return (
    <div>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: "56px" }}>
        <h1
          style={{
            fontSize: "42px",
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            marginBottom: "16px",
          }}
        >
          Everything you need to ship faster
        </h1>
        <p
          style={{
            fontSize: "17px",
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            maxWidth: "640px",
            margin: "0 auto",
          }}
        >
          Threadline replaces flat to-do lists with visual dependency graphs, real-time collaboration,
          and intelligent automation - all in one place.
        </p>
      </div>

      {/* Features Grid */}
      <div
        className="features-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "24px",
        }}
      >
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-lg)",
                padding: "28px",
                transition: "transform .2s ease, box-shadow .2s ease, border-color .2s ease",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "translateY(-3px)";
                el.style.boxShadow = "var(--shadow-md)";
                el.style.borderColor = "rgba(139, 92, 246, 0.2)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "translateY(0)";
                el.style.boxShadow = "none";
                el.style.borderColor = "var(--border-default)";
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
                  marginBottom: "16px",
                }}
              >
                <Icon style={{ width: "22px", height: "22px", color: feature.color }} />
              </div>
              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: "8px",
                }}
              >
                {feature.title}
              </h3>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .features-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
