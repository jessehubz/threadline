"use client";

import { BookOpen, Puzzle, MessageSquare, Zap, Shield, Settings, ChevronDown } from "lucide-react";
import { RevealOnScroll } from "@/components/reveal-on-scroll";

const sections = [
  {
    icon: BookOpen,
    title: "Getting Started",
    description: "Set up your account, create your first project, and learn the basics of the graph editor.",
    topics: [
      {
        title: "Create an account",
        body: "Sign up with Clerk using email or a supported social provider. Once you're in, you land on your dashboard, which starts empty until you create your first project.",
      },
      {
        title: "Your first project",
        body: "Create a project and you're automatically its owner with a blank graph canvas to build on. From here you can add task nodes, invite people, and share the project.",
      },
      {
        title: "Graph editor basics",
        body: "The graph editor is a pannable, zoomable infinite canvas. Add task nodes, draw directed edges between them to define dependencies, and use folder nodes to group related work into sub-graphs.",
      },
      {
        title: "Adding friends & teammates",
        body: "Search for people and send a friend request, then add friends directly to a project with a role. You can also invite by email or share a view/edit link, Google-Docs style.",
      },
    ],
  },
  {
    icon: Puzzle,
    title: "Core Concepts",
    description: "Understand how tasks, dependencies, folder nodes, and sub-graphs work together.",
    topics: [
      {
        title: "Task nodes & statuses",
        body: "Every task node carries a title, description, due date, assignees, attachments, and one of six statuses: Not Started, In Progress, Blocked, Awaiting Approval, Rejected, or Complete. Nodes are color-coded by status automatically, or you can override the color per node.",
      },
      {
        title: "Dependencies & edges",
        body: "Draw a directed edge between two nodes to say one depends on the other. A DFS-based cycle detector blocks circular dependencies in real time, and a task can't be marked complete until everything upstream of it is done.",
      },
      {
        title: "Folder nodes & sub-graphs",
        body: "Folder nodes contain their own nested sub-graph for breaking large projects into manageable pieces. Double-click a folder to enter its sub-graph, navigate back out with breadcrumbs, and the parent folder's status is derived automatically from its children's progress.",
      },
      {
        title: "Assignments & approvals",
        body: "Assign one or more people to a task and designate an approver. When dependency enforcement requires review, a task can be submitted for approval and the approver can approve it or reject it with a reason.",
      },
    ],
  },
  {
    icon: MessageSquare,
    title: "Comments, Files & Deadlines",
    description: "Discuss work on individual tasks, attach proof of completion, and keep track of what's due.",
    topics: [
      {
        title: "Task comments",
        body: "Every task node has a threaded comment section in its detail panel. Comments can be marked private, visible only to the author and the project owner, and comment authors can delete their own comments while project owners can moderate any comment.",
      },
      {
        title: "Read tracking",
        body: "Nodes with unread comments are flagged so you can tell at a glance which tasks have new discussion. Opening a node's comment panel marks its comments as read for you.",
      },
      {
        title: "Media attachments",
        body: "Attach images, PDFs, and documents to a task or comment as proof of completion, up to 10MB per file, via drag-and-drop. Files are stored in Vercel Blob and preview inline where possible.",
      },
      {
        title: "Deadlines",
        body: "The global My Tasks page lists everything assigned to you across every project, grouped by due date. Inside a graph, a collapsible deadlines panel shows upcoming due dates for that project, and clicking one selects and focuses the node on the canvas.",
      },
    ],
  },
  {
    icon: Zap,
    title: "Collaboration",
    description: "Learn about real-time sync, sharing, roles, and team messaging.",
    topics: [
      {
        title: "Real-time collaboration",
        body: "Changes made by collaborators sync live via Pusher, and presence indicators show who else is currently viewing the same graph.",
      },
      {
        title: "Sharing & permissions",
        body: "Share a project the way you'd share a Google Doc: copy a view or edit link, or invite someone by email. Public share links allow anonymous viewing without signing in; editing still requires authentication.",
      },
      {
        title: "Roles (Owner/Admin/Member)",
        body: "Every project member holds one of three permission levels — Owner, Admin, or Member — which determines what they can see and change.",
      },
      {
        title: "Direct messages & channels",
        body: "Each project has a group channel for team-wide discussion, and you can also start a 1-on-1 direct message with any teammate or friend. Channels and DMs live side by side in a tabbed messaging interface, with new messages delivered instantly via Pusher.",
      },
    ],
  },
  {
    icon: Shield,
    title: "Security",
    description: "Understand how access is controlled and how your input is protected.",
    topics: [
      {
        title: "Authentication",
        body: "Sign-in and sign-up are handled by Clerk. Every Server Action independently verifies the requesting user before touching any data, rather than relying solely on middleware.",
      },
      {
        title: "Role-based access",
        body: "Access to a project's data is checked against your membership role (Owner, Admin, or Member) on every read and write, so permissions can't be bypassed by calling an action directly.",
      },
      {
        title: "Rate limiting",
        body: "Sensitive and high-frequency actions are rate-limited using Upstash Redis in production, with an in-memory sliding-window fallback for development.",
      },
      {
        title: "Input sanitization",
        body: "Titles, messages, and comments are sanitized server-side before they're stored, stripping HTML tags and dangerous patterns as defense-in-depth against stored XSS.",
      },
    ],
  },
  {
    icon: Settings,
    title: "Account & Data",
    description: "Manage your profile, notification preferences, analytics, and deleted projects.",
    topics: [
      {
        title: "Profile settings",
        body: "Upload a profile picture via Vercel Blob with an instant preview, or rely on your initials as a fallback. You can also edit your display name and bio at any time.",
      },
      {
        title: "Notifications & theme",
        body: "Toggle email notifications per category in settings, and check the bell icon for in-app notifications with an unread count that updates in real time via Pusher. Pick a system, light, or dark theme to match how you like to work.",
      },
      {
        title: "Analytics dashboard",
        body: "Each project's analytics view includes a completion-rate line chart over time, a status-breakdown pie chart, a workload bar chart per person, and a list of tasks that are overdue.",
      },
      {
        title: "Trash & restore",
        body: "Deleting a project moves it to Trash instead of erasing it immediately. It stays recoverable for 15 days — restore it any time in that window before it's permanently removed.",
      },
    ],
  },
];

export default function DocsPage() {
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
            Documentation
          </h1>
          <p style={{ fontSize: "16px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Everything you need to know about Threadline, from getting started to advanced configuration.
          </p>
        </div>
      </RevealOnScroll>

      {/* Sections Grid */}
      <div
        className="docs-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "20px",
        }}
      >
        {sections.map((section, idx) => {
          const Icon = section.icon;
          return (
            <RevealOnScroll key={section.title} delay={Math.min(idx, 5) * 60}>
              <div
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-lg)",
                  padding: "24px",
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
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {section.topics.map((topic) => (
                    <details key={topic.title} className="docs-topic">
                      <summary
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "8px",
                          fontSize: "13px",
                          color: "var(--accent)",
                          fontWeight: 500,
                          cursor: "pointer",
                          listStyle: "none",
                          padding: "6px 0",
                        }}
                      >
                        <span>{topic.title}</span>
                        <ChevronDown className="docs-topic-chevron" style={{ width: "13px", height: "13px", flexShrink: 0, transition: "transform .15s ease" }} />
                      </summary>
                      <p
                        style={{
                          fontSize: "12.5px",
                          color: "var(--text-secondary)",
                          lineHeight: 1.6,
                          margin: "0 0 8px",
                          padding: "0 0 0 2px",
                        }}
                      >
                        {topic.body}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            </RevealOnScroll>
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
        .docs-topic summary::-webkit-details-marker {
          display: none;
        }
        .docs-topic[open] .docs-topic-chevron {
          transform: rotate(180deg);
        }
        .docs-topic + .docs-topic {
          border-top: 1px solid var(--border-subtle);
        }
        .docs-topic summary:focus-visible {
          outline: 2px solid var(--ring-color);
          outline-offset: 2px;
          border-radius: var(--radius-sm);
        }
      `}</style>
    </div>
  );
}
