"use client";

import { GitBranch, Users, Zap, Shield, BarChart3, Bell, Palette, Brain } from "lucide-react";
import { RevealOnScroll } from "@/components/reveal-on-scroll";

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
    color: "var(--violet-600)",
  },
  {
    icon: Brain,
    title: "Task Helper",
    description:
      "Describe your project in plain text and generate a full dependency graph. Choose from pre-built templates or let the intelligent parser create task structures for you.",
    color: "var(--violet-400)",
  },
  {
    icon: Zap,
    title: "Approval Workflows",
    description:
      "Built-in approval workflows let you submit tasks for review, with one-click approve/reject and dependency enforcement - tasks can't complete until upstream work is done.",
    color: "var(--violet-700)",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description:
      "Track completion rate over time, visualize status breakdowns, monitor workload per person, and surface overdue tasks with beautiful, interactive charts.",
    color: "var(--violet-500)",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "In-app and email notifications for assignments, approvals, rejections, and due dates. Granular preferences let you control exactly what reaches you.",
    color: "var(--violet-300)",
  },
  {
    icon: Shield,
    title: "Enterprise-Grade Security",
    description:
      "Role-based access control, input sanitization, rate limiting, file validation, CSRF protection, and private comments - security built into every layer.",
    color: "var(--violet-700)",
  },
  {
    icon: Palette,
    title: "Beautiful Design",
    description:
      "Dark and light themes, loading skeletons, toast notifications, responsive layouts from mobile to desktop, and polished interactions throughout.",
    color: "var(--violet-500)",
  },
];

export default function FeaturesPage() {
  return (
    <div>
      {/* Hero */}
      <RevealOnScroll>
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
      </RevealOnScroll>

      {/* Features Grid */}
      <div
        className="features-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "24px",
        }}
      >
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <RevealOnScroll key={feature.title} delay={Math.min(idx, 5) * 60}>
              <div
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
                  el.style.borderColor = "var(--ring-color)";
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
            </RevealOnScroll>
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
