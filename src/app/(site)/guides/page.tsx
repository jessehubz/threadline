"use client";

import { Lightbulb, GitBranch, Users, BarChart3, Brain, FolderTree, ChevronDown } from "lucide-react";
import { RevealOnScroll } from "@/components/reveal-on-scroll";

const guides = [
  {
    icon: GitBranch,
    title: "Building Your First Dependency Graph",
    description: "Learn how to create task nodes, connect them with dependencies, and use the infinite canvas to organize your project visually.",
    readTime: "5 min read",
    difficulty: "Beginner",
    steps: [
      "Open a project and start from its empty graph canvas.",
      "Add a task node for each piece of work, giving it a title and description.",
      "Draw an edge from one node to another to mark a dependency between them.",
      "Open a node's detail panel to set its status, due date, and assignees.",
      "Pan and zoom the infinite canvas to arrange nodes so the flow of work is easy to follow.",
    ],
  },
  {
    icon: Users,
    title: "Collaborating with Your Team",
    description: "Set up your team, assign roles, share projects with view/edit links, and collaborate in real-time.",
    readTime: "7 min read",
    difficulty: "Beginner",
    steps: [
      "Open the Share button on a project — it works like sharing a Google Doc.",
      "Copy a view or edit link, or invite someone by email and choose their role.",
      "Members join as Admin or Member depending on the role you assigned; the project creator remains the Owner.",
      "As people edit, presence indicators show who's viewing the graph and changes sync instantly.",
      "Add someone as a friend once, then add them straight into future projects without re-inviting.",
    ],
  },
  {
    icon: FolderTree,
    title: "Organizing Large Projects with Sub-Graphs",
    description: "Use folder nodes to break complex projects into manageable sub-graphs. Navigate with breadcrumbs and auto-derived status.",
    readTime: "6 min read",
    difficulty: "Intermediate",
    steps: [
      "Add a folder node for any chunk of work that has its own internal steps.",
      "Double-click the folder node to enter its nested sub-graph.",
      "Build task nodes and dependencies inside the sub-graph the same way you would at the top level.",
      "Use the breadcrumb trail to navigate back out to the parent graph at any time.",
      "The folder's status on the parent graph updates automatically as work inside it progresses.",
    ],
  },
  {
    icon: Brain,
    title: "Using the AI Assistant",
    description: "Describe your project in plain text and let the AI generate a complete dependency graph with tasks and connections.",
    readTime: "4 min read",
    difficulty: "Beginner",
    steps: [
      "Open the AI assistant from the graph editor.",
      "Describe your project in plain text, or start from a pre-built template like Web App or Product Launch.",
      "The assistant splits your description into tasks and adds sensible dependencies between them.",
      "Review the generated graph and adjust titles, statuses, or connections as needed.",
      "No API key is required — generation runs entirely on template and heuristic logic.",
    ],
  },
  {
    icon: BarChart3,
    title: "Tracking Progress with Analytics",
    description: "Read completion charts, interpret workload distribution, and use deadline views to keep your team on track.",
    readTime: "5 min read",
    difficulty: "Intermediate",
    steps: [
      "Open a project's analytics view.",
      "Check the completion-rate line chart to see progress over time.",
      "Use the status-breakdown pie chart to see how work is distributed across statuses.",
      "Review the workload bar chart to spot who's overloaded or underassigned.",
      "Check the overdue list for tasks that have passed their due date.",
    ],
  },
  {
    icon: Lightbulb,
    title: "Approval Workflows Best Practices",
    description: "Set up approval chains, designate reviewers, and use dependency enforcement to maintain quality gates.",
    readTime: "8 min read",
    difficulty: "Advanced",
    steps: [
      "Move a task to Awaiting Approval once the work is ready for review.",
      "Designate an approver when assigning the task.",
      "The approver reviews the task and either approves it or rejects it with a reason.",
      "A rejected task goes back to the assignee so they can address the feedback and resubmit.",
      "Dependency enforcement keeps downstream tasks blocked until the ones they depend on are actually Complete, not just submitted.",
    ],
  },
];

function DifficultyBadge({ level }: { level: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    Beginner: { bg: "var(--accent-soft)", color: "var(--accent)" },
    Intermediate: { bg: "color-mix(in srgb, var(--text-secondary) 10%, transparent)", color: "var(--text-secondary)" },
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
      <RevealOnScroll>
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
      </RevealOnScroll>

      {/* Guides List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {guides.map((guide, idx) => {
          const Icon = guide.icon;
          return (
            <RevealOnScroll key={guide.title} delay={Math.min(idx, 5) * 60}>
            <details
              className="guide-card"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-lg)",
                padding: "22px 26px",
                transition: "border-color .18s ease, box-shadow .18s ease",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "var(--ring-color)";
                el.style.boxShadow = "var(--shadow-sm)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "var(--border-default)";
                el.style.boxShadow = "none";
              }}
            >
              <summary
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                  cursor: "pointer",
                  listStyle: "none",
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
                  <ChevronDown
                    className="guide-chevron"
                    style={{ width: "16px", height: "16px", color: "var(--text-muted)", transition: "transform .15s ease" }}
                  />
                </div>
              </summary>

              <ol
                style={{
                  margin: "18px 0 2px",
                  paddingLeft: "20px",
                  paddingTop: "18px",
                  borderTop: "1px solid var(--border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {guide.steps.map((step, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: "13.5px",
                      color: "var(--text-secondary)",
                      lineHeight: 1.6,
                    }}
                  >
                    {step}
                  </li>
                ))}
              </ol>
            </details>
            </RevealOnScroll>
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
        .guide-card summary::-webkit-details-marker {
          display: none;
        }
        .guide-card[open] .guide-chevron {
          transform: rotate(180deg);
        }
        .guide-card summary:focus-visible {
          outline: 2px solid var(--ring-color);
          outline-offset: 3px;
          border-radius: var(--radius-sm);
        }
      `}</style>
    </div>
  );
}
