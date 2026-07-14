"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Sparkles,
  Search,
  Clock,
  CheckCircle2,
  Calendar,
  Circle,
  ArrowRight,
  ChevronDown,
  Pencil,
  X,
  UserPlus,
  Trash2,
  Users,
} from "lucide-react";
import { CreateProjectButton } from "@/components/create-project-button";
import { TagChip } from "@/components/ui/tag-chip";
import { TagScrollContainer } from "@/components/ui/tag-scroll-container";
import { ProjectTagManager } from "@/components/project-tag-manager";
import { updateProject, deleteProject } from "@/actions/project-actions";
import { getProjectMembers } from "@/actions/assignment-actions";
import { removeMember } from "@/actions/team-actions";
import { getFriends, addFriendToProject } from "@/actions/friend-actions";
import { getTeams } from "@/actions/team-group-actions";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DashboardContentProps {
  user: { id: string; name: string | null; email: string; imageUrl: string | null };
  greeting: string;
  firstName: string;
  healthScore: number;
  activeTasks: number;
  completionRate: number;
  insights: Array<{ text: string; color: string }>;
  projects: Array<{
    id: string;
    name: string;
    totalTasks: number;
    completedTasks: number;
    memberCount: number;
    lastOpenedAt: string | null;
    displayOrder: number;
    labels: Array<{ id: string; name: string; color: string }>;
    tags: Array<{ id: string; name: string; color: string; isSystem: boolean }>;
  }>;
  needsAttention: Array<{
    id: string;
    title: string;
    status: string;
    dueDate: string | null;
    projectId: string;
    projectName: string;
    assigneeName: string | null;
    assigneeInitials: string;
    daysOverdue?: number;
  }>;
  dueToday: Array<{
    id: string;
    title: string;
    status: string;
    dueDate: string | null;
    projectId: string;
    projectName: string;
    assigneeName: string | null;
    assigneeInitials: string;
  }>;
  dueThisWeek: Array<{
    id: string;
    title: string;
    status: string;
    dueDate: string | null;
    projectId: string;
    projectName: string;
    assigneeName: string | null;
    assigneeInitials: string;
  }>;
  dueLater: Array<{
    id: string;
    title: string;
    status: string;
    dueDate: string | null;
    projectId: string;
    projectName: string;
    assigneeName: string | null;
    assigneeInitials: string;
  }>;
  overdue: Array<{
    id: string;
    title: string;
    status: string;
    dueDate: string | null;
    projectId: string;
    projectName: string;
    assigneeName: string | null;
    assigneeInitials: string;
    daysOverdue?: number;
  }>;
  workload: Array<{
    id: string;
    name: string;
    initials: string;
    notStarted: number;
    inProgress: number;
    blocked: number;
    awaitingApproval: number;
    total: number;
  }>;
  workloadByProject: Record<string, Array<{ id: string; name: string; initials: string; total: number }>>;
  pendingReminderCount: number;
  totalProjects: number;
  needsAttentionCount: number;
  inProgressTasks: number;
  blockedTasksCount: number;
  availableTags: Array<{ id: string; name: string; color: string; isSystem: boolean }>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PROJECT_ICONS = ["📋", "🚀", "💡", "🎯", "📦", "🔧", "🌐", "📊"];
const PROJECT_COLORS = [
  "rgba(139,92,246,0.12)",
  "rgba(99,102,241,0.12)",
  "rgba(168,85,247,0.12)",
  "rgba(124,58,237,0.12)",
  "rgba(109,40,217,0.12)",
  "rgba(139,92,246,0.08)",
];

function getProjectIcon(index: number) {
  return PROJECT_ICONS[index % PROJECT_ICONS.length];
}
function getProjectColor(index: number) {
  return PROJECT_COLORS[index % PROJECT_COLORS.length];
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "No date";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatRelativeTime(dateStr: string) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Opened just now";
  if (diffMin < 60) return `Opened ${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `Opened ${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `Opened ${diffDay}d ago`;
  return `Opened ${new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function DashboardContent(props: DashboardContentProps) {
  const {
    user,
    greeting,
    firstName,
    healthScore,
    activeTasks,
    completionRate,
    insights,
    projects,
    needsAttention,
    dueToday,
    dueThisWeek,
    dueLater,
    overdue,
    workload,
    workloadByProject,
    pendingReminderCount,
    totalProjects,
    needsAttentionCount,
    inProgressTasks,
    blockedTasksCount,
    availableTags,
  } = props;

  // Use Clerk's live user data so display name updates reactively
  // without needing a page reload after the user edits their profile.
  const { user: clerkUser } = useUser();
  const liveFirstName = clerkUser?.firstName || firstName;
  const router = useRouter();

  // State
  const [showLauncher, setShowLauncher] = useState(false);
  const [projectTab, setProjectTab] = useState("all");
  const [projectSearch, setProjectSearch] = useState("");
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [deadlineTab, setDeadlineTab] = useState<"today" | "week" | "later" | "overdue">("today");
  const [healthRingOffset, setHealthRingOffset] = useState(251.2);
  const [friendRingOffsets, setFriendRingOffsets] = useState<number[]>([]);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    variant: "danger" | "default";
    onConfirm: () => void;
  }>({ open: false, title: "", description: "", confirmLabel: "", variant: "default", onConfirm: () => {} });

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDialog({
      open: true,
      title: "Delete project?",
      description: "This project will be moved to Recently Deleted. You can restore it from the Trash page within 15 days.",
      confirmLabel: "Delete",
      variant: "danger",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        const result = await deleteProject(projectId);
        if (result && "error" in result) {
          setConfirmDialog({ open: true, title: "Error", description: result.error as string, confirmLabel: "OK", variant: "default", onConfirm: () => setConfirmDialog((p) => ({ ...p, open: false })) });
          return;
        }
        router.refresh();
      },
    });
  };

  // Helper to open the AI chat (single instance lives in DashboardNavbar)
  const openAiChat = () => {
    window.dispatchEvent(new CustomEvent("open-ai-chat"));
  };

  // Scroll-triggered launcher: appears after 200px scroll, stays visible
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowLauncher(true);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    // Check initial scroll position (e.g. page restored with scroll)
    if (window.scrollY > 200) setShowLauncher(true);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll-reveal: IntersectionObserver triggers once per section
  const revealContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = revealContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target); // trigger once only
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    const sections = container.querySelectorAll(".dash-reveal");
    sections.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Health ring animation
  const circumference = 251.2; // 2 * PI * 40
  const smallCircumference = 100.5; // 2 * PI * 16

  useEffect(() => {
    const target = circumference - (healthScore / 100) * circumference;
    const timer = setTimeout(() => setHealthRingOffset(target), 100);
    return () => clearTimeout(timer);
  }, [healthScore, circumference]);

  // Friend ring animations
  useEffect(() => {
    if (workload.length > 0) {
      const maxTotal = Math.max(...workload.map((w) => w.total), 1);
      const targets = workload.map((w) => {
        const pct = Math.min((w.total / maxTotal) * 100, 100);
        return smallCircumference - (pct / 100) * smallCircumference;
      });
      const timer = setTimeout(() => setFriendRingOffsets(targets), 200);
      return () => clearTimeout(timer);
    }
  }, [workload, smallCircumference]);

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
      p.tags.some((t) => t.name.toLowerCase().includes(projectSearch.toLowerCase()));
    if (!matchesSearch) return false;
    if (projectTab === "all") return true;
    if (projectTab === "ongoing") return p.completedTasks > 0 && p.completedTasks < p.totalTasks;
    if (projectTab === "not_started") return p.completedTasks === 0 && p.totalTasks > 0;
    if (projectTab === "draft") return p.totalTasks === 0;
    // Custom tag filter: tab id starts with "tag:"
    if (projectTab.startsWith("tag:")) {
      const tagId = projectTab.slice(4);
      return p.tags.some((t) => t.id === tagId);
    }
    return true;
  });

  const visibleProjects = showAllProjects ? filteredProjects : filteredProjects.slice(0, 8);

  const deadlineItems =
    deadlineTab === "today" ? dueToday : deadlineTab === "week" ? dueThisWeek : deadlineTab === "overdue" ? overdue : dueLater;

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes liveDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        /* Scroll-reveal: sections start invisible and slide up on viewport entry */
        .dash-reveal {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 380ms ease-out, transform 380ms ease-out;
        }
        .dash-reveal.revealed {
          opacity: 1;
          transform: translateY(0);
        }
        /* Section separator - subtle hairline between major blocks */
        .dash-separator {
          height: 1px;
          margin: 24px 0 28px;
          background: var(--border-subtle);
          border: none;
        }
        /* Filter tab bar container */
        .dash-filter-tabs {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          background: var(--bg-muted);
          border: 1px solid var(--border-default);
          border-radius: 999px;
          padding: 4px;
          max-width: 100%;
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .dash-filter-tabs::-webkit-scrollbar { display: none; }

        /* ─── My Projects Section ─── */
        .my-projects-section {
          margin-bottom: 20px;
        }

        /* Header */
        .my-projects-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          gap: 16px;
          flex-wrap: wrap;
        }
        .my-projects-header__left {}
        .my-projects-title {
          font-size: 22px;
          font-weight: 600;
          letter-spacing: -0.015em;
          color: var(--text-primary);
          margin-bottom: 4px;
        }
        .my-projects-subtitle {
          font-size: 13px;
          color: var(--text-secondary);
        }
        .my-projects-header__right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .my-projects-search {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-muted);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-sm);
          padding: 8px 16px;
          min-width: 350px;
          transition: border-color .18s ease;
        }
        .my-projects-search:focus-within {
          border-color: var(--accent);
        }
        .my-projects-search__icon {
          width: 14px;
          height: 14px;
          color: var(--text-muted);
          flex-shrink: 0;
        }
        .my-projects-search__input {
          background: transparent;
          border: none;
          outline: none;
          font-size: 13px;
          color: var(--text-primary);
          width: 100%;
          font-family: inherit;
        }
        .my-projects-search__input::placeholder {
          color: var(--text-muted);
        }

        /* ─── Merged Filter Bar (rounded rectangle, NOT full pill) ─── */
        .my-projects-filter-bar {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 2px;
          background: var(--bg-elevated);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          padding: 4px;
          box-shadow: var(--shadow-sm);
          margin-bottom: 24px;
          flex-wrap: nowrap;
          max-width: 100%;
          overflow: visible;
        }

        /* Sliding pill indicator */
        .my-projects-pill-indicator {
          position: absolute;
          top: 4px;
          bottom: 4px;
          left: 0;
          width: 0;
          background: var(--accent);
          border-radius: 999px;
          z-index: 0;
          pointer-events: none;
        }

        /* Individual tab pill */
        .my-projects-tab {
          position: relative;
          z-index: 1;
          padding: 8px 16px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
          transition: color .18s ease;
          outline: none;
        }
        .my-projects-tab:hover {
          color: var(--text-primary);
        }
        .my-projects-tab:focus-visible {
          box-shadow: 0 0 0 2px var(--accent), 0 0 0 4px var(--ring-color);
          border-radius: 999px;
        }
        .my-projects-tab--active {
          color: #fff;
        }
        .my-projects-tab--active:hover {
          color: #fff;
        }

        /* Tab divider */
        .my-projects-tab-divider {
          width: 1px;
          height: 20px;
          background: var(--border-default);
          margin: 0 4px;
          flex-shrink: 0;
        }

        /* Tag row overflow wrapper */
        .my-projects-tag-row-wrap {
          position: relative;
          display: flex;
          align-items: center;
          min-width: 0;
          flex: 1;
          overflow: hidden;
        }
        .my-projects-tag-row {
          display: flex;
          align-items: center;
          gap: 2px;
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          padding: 0 4px;
        }
        .my-projects-tag-row::-webkit-scrollbar { display: none; }

        /* Overflow fade masks */
        .my-projects-tag-fade {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 32px;
          pointer-events: none;
          z-index: 2;
        }
        .my-projects-tag-fade--left {
          left: 0;
          background: linear-gradient(to right, var(--bg-elevated), transparent);
        }
        .my-projects-tag-fade--right {
          right: 0;
          background: linear-gradient(to left, var(--bg-elevated), transparent);
        }

        /* ─── Project Grid ─── */
        .my-projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        /* Staggered card entrance animation */
        .my-projects-card-entrance {
          animation: fadeInUp 0.35s ease-out both;
        }
        .my-projects-card-entrance--0 { animation-delay: 0ms; }
        .my-projects-card-entrance--1 { animation-delay: 50ms; }
        .my-projects-card-entrance--2 { animation-delay: 100ms; }
        .my-projects-card-entrance--3 { animation-delay: 150ms; }
        .my-projects-card-entrance--4 { animation-delay: 200ms; }
        .my-projects-card-entrance--5 { animation-delay: 250ms; }
        .my-projects-card-entrance--6 { animation-delay: 300ms; }
        .my-projects-card-entrance--7 { animation-delay: 350ms; }

        /* Empty state */
        .my-projects-empty {
          text-align: center;
          padding: 48px 20px;
          color: var(--text-muted);
          font-size: 14px;
        }

        /* ─── Show All Bar (rounded rectangle, NOT full pill) ─── */
        .my-projects-show-all {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          margin-top: 20px;
          padding: 12px 24px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-default);
          background: var(--bg-elevated);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all .18s ease;
          outline: none;
        }
        .my-projects-show-all:hover {
          border-color: var(--accent);
          color: var(--accent);
          background: var(--accent-soft);
        }
        .my-projects-show-all:focus-visible {
          box-shadow: 0 0 0 2px var(--accent), 0 0 0 4px var(--ring-color);
        }
        .my-projects-show-all__chevron {
          width: 14px;
          height: 14px;
          transition: transform .25s ease;
        }
        .my-projects-show-all--expanded .my-projects-show-all__chevron {
          transform: rotate(180deg);
        }
        @media (prefers-reduced-motion: reduce) {
          .dash-reveal {
            opacity: 1;
            transform: none;
            transition: none;
          }
          .my-projects-card-entrance,
          .my-projects-card-entrance--0,
          .my-projects-card-entrance--1,
          .my-projects-card-entrance--2,
          .my-projects-card-entrance--3,
          .my-projects-card-entrance--4,
          .my-projects-card-entrance--5,
          .my-projects-card-entrance--6,
          .my-projects-card-entrance--7 {
            animation: none !important;
          }
          .my-projects-pill-indicator {
            transition: none !important;
          }
          .my-projects-show-all__chevron {
            transition: none !important;
          }
        }
        @media (max-width: 1100px) {
          .my-projects-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 900px) {
          .dash-hero { grid-template-columns: 1fr !important; }
          .dash-second-row { grid-template-columns: 1fr !important; }
          .my-projects-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .dash-hero { padding: 24px 20px !important; }
          .dash-hero h1 { font-size: 32px !important; }
          .dash-search-box { display: none !important; }
          .my-projects-grid { grid-template-columns: 1fr !important; }
          .my-projects-header {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .my-projects-header__right {
            flex-direction: column !important;
            width: 100% !important;
          }
          .my-projects-search {
            min-width: 0 !important;
            width: 100% !important;
          }
          .my-projects-filter-bar {
            flex-wrap: wrap !important;
            border-radius: var(--radius-sm) !important;
          }
          .my-projects-show-all {
            border-radius: var(--radius-sm) !important;
          }
        }
        @media (max-width: 640px) {
          .deadlines-tabbar {
            flex-direction: column !important;
            border-radius: var(--radius-md) !important;
          }
          .deadlines-tabbar button {
            border-radius: var(--radius-sm) !important;
          }
          .deadlines-panel-outer {
            padding: 18px !important;
          }
        }
        @media (max-width: 900px) {
          .deadlines-tabbar {
            flex-wrap: wrap !important;
          }
        }
      `}</style>

      <div ref={revealContainerRef}>

      {/* ═══ 1. HERO SECTION ═══ */}
      <div className="dash-reveal">
      <HeroSection
        greeting={greeting}
        firstName={liveFirstName}
        healthScore={healthScore}
        activeTasks={activeTasks}
        totalProjects={totalProjects}
        needsAttentionCount={needsAttentionCount}
        dueToday={dueToday}
        dueThisWeek={dueThisWeek}
        dueLater={dueLater}
        overdue={overdue}
        healthRingOffset={healthRingOffset}
        circumference={circumference}
      />
      </div>

      {/* ═══ 2. AI BANNER ═══ */}
      <div className="dash-reveal">
      <div
        onClick={openAiChat}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-sm)",
          padding: "16px 22px",
          marginBottom: "20px",
          cursor: "pointer",
          transition: "transform .18s ease, box-shadow .18s ease, border-color .18s ease",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.transform = "translateY(-2px)";
          el.style.boxShadow = "var(--shadow-md)";
          el.style.borderColor = "rgba(139,92,246,0.28)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.transform = "translateY(0)";
          el.style.boxShadow = "var(--shadow-sm)";
          el.style.borderColor = "var(--border-default)";
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(139,92,246,0.1)",
            borderRadius: "999px",
            padding: "5px 12px",
            fontSize: "11px",
            fontWeight: 600,
            color: "#8B5CF6",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            flexShrink: 0,
          }}
        >
          <Sparkles style={{ width: "13px", height: "13px" }} />
          AI ASSISTANT
        </span>
        <span style={{ fontSize: "14px", color: "var(--text-secondary)", flex: 1 }}>
          {insights[0]?.text || "Ask AI Assistant anything about your projects..."}
        </span>
        <ArrowRight style={{ width: "16px", height: "16px", color: "var(--text-muted)", flexShrink: 0 }} />
      </div>
      </div>

      {/* Separator: after AI Banner / before Projects */}
      <div className="dash-separator" />

      {/* ═══ 3. PROJECTS SECTION ═══ */}
      <div className="dash-reveal">
      <ProjectsSection
        projects={filteredProjects}
        visibleProjects={visibleProjects}
        projectTab={projectTab}
        setProjectTab={setProjectTab}
        projectSearch={projectSearch}
        setProjectSearch={setProjectSearch}
        showAllProjects={showAllProjects}
        setShowAllProjects={setShowAllProjects}
        availableTags={availableTags}
        onDeleteProject={handleDeleteProject}
      />
      </div>

      {/* Separator: after Projects / before Needs Attention + Friends */}
      <div className="dash-separator" />

      {/* ═══ 4. SECOND ROW ═══ */}
      <div className="dash-reveal">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }} className="dash-second-row">
        {/* Needs Attention */}
        <NeedsAttentionPanel items={needsAttention} />
        {/* Friends / Team */}
        <FriendsPanel workload={workload} friendRingOffsets={friendRingOffsets} smallCircumference={smallCircumference} />
      </div>
      </div>

      {/* Separator: after Second Row / before Deadlines */}
      <div className="dash-separator" />

      {/* ═══ 5. DEADLINES PANEL ═══ */}
      <div className="dash-reveal">
      <DeadlinesPanel
        deadlineTab={deadlineTab}
        setDeadlineTab={setDeadlineTab}
        dueToday={dueToday}
        dueThisWeek={dueThisWeek}
        dueLater={dueLater}
        overdue={overdue}
        deadlineItems={deadlineItems}
      />
      </div>

      </div>{/* end revealContainerRef */}

      {/* AI Assistant Launcher - slides in after 200px scroll */}
      {showLauncher && (
        <button
          onClick={openAiChat}
          className="ai-launcher-visible fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-[var(--shadow-md)] transition-all duration-150 hover:scale-110 hover:shadow-[var(--elevation-3)] active:scale-95 cursor-pointer"
          aria-label="Open AI Assistant"
          title="AI Assistant"
        >
          <Sparkles className="h-5 w-5" />
        </button>
      )}

      {/* ═══ CONFIRM DIALOG ═══ */}
      {confirmDialog.open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10001,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            animation: "fadeIn .15s ease",
          }}
          onClick={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
        >
          <div
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-lg, 0 25px 50px rgba(0,0,0,0.25))",
              padding: "28px",
              width: "100%",
              maxWidth: "380px",
              margin: "0 16px",
              animation: "fadeSlideUp .2s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: confirmDialog.variant === "danger" ? "rgba(239,68,68,0.08)" : "var(--accent-soft)",
                marginBottom: "16px",
              }}
            >
              {confirmDialog.variant === "danger" ? (
                <Trash2 style={{ width: "20px", height: "20px", color: "var(--error, #ef4444)" }} />
              ) : (
                <CheckCircle2 style={{ width: "20px", height: "20px", color: "var(--accent)" }} />
              )}
            </div>

            {/* Title */}
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px", letterSpacing: "-0.01em" }}>
              {confirmDialog.title}
            </h3>

            {/* Description */}
            <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "24px" }}>
              {confirmDialog.description}
            </p>

            {/* Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
                style={{
                  padding: "9px 18px",
                  fontSize: "13px",
                  fontWeight: 600,
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-default)",
                  background: "var(--bg-elevated)",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  transition: "all .15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--text-muted)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-default)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                style={{
                  padding: "9px 18px",
                  fontSize: "13px",
                  fontWeight: 600,
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: confirmDialog.variant === "danger" ? "var(--error, #ef4444)" : "var(--accent)",
                  color: "#fff",
                  cursor: "pointer",
                  transition: "all .15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.85";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


// ─── Sub-Components ──────────────────────────────────────────────────────────

function HeroSection({
  greeting,
  firstName,
  healthScore,
  activeTasks,
  totalProjects,
  needsAttentionCount,
  dueToday,
  dueThisWeek,
  dueLater,
  overdue,
  healthRingOffset,
  circumference,
}: {
  greeting: string;
  firstName: string;
  healthScore: number;
  activeTasks: number;
  totalProjects: number;
  needsAttentionCount: number;
  dueToday: Array<unknown>;
  dueThisWeek: Array<unknown>;
  dueLater: Array<unknown>;
  overdue: Array<unknown>;
  healthRingOffset: number;
  circumference: number;
}) {
  return (
    <div
      className="dash-hero"
      style={{
        display: "grid",
        gridTemplateColumns: "1.4fr 1fr",
        gap: "36px",
        alignItems: "center",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-md)",
        padding: "42px 46px",
        marginBottom: "20px",
        animation: "fadeSlideUp .5s ease",
      }}
    >
      {/* LEFT */}
      <div>
        {/* Badges */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "var(--bg-muted)",
              borderRadius: "999px",
              padding: "5px 12px",
              fontSize: "11px",
              fontWeight: 500,
              color: "var(--text-secondary)",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "var(--accent)",
                boxShadow: "0 0 0 3px rgba(139,92,246,0.18)",
                animation: "liveDot 2s infinite ease-in-out",
              }}
            />
            Synced just now
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "var(--bg-muted)",
              borderRadius: "999px",
              padding: "5px 12px",
              fontSize: "11px",
              fontWeight: 500,
              color: "var(--text-secondary)",
            }}
          >
            {totalProjects} projects · {needsAttentionCount} need attention
          </span>
        </div>

        {/* H1 */}
        <h1
          style={{
            fontSize: "52px",
            fontWeight: 200,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            color: "var(--text-primary)",
            marginBottom: "12px",
          }}
        >
          {greeting},{" "}
          <b
            style={{
              fontFamily: '"Outfit", "Inter", sans-serif',
              fontWeight: 700,
              background: "linear-gradient(135deg, var(--accent-hover), #4c1d95)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {firstName}.
          </b>
        </h1>

        {/* Subtitle */}
        <p style={{ fontSize: "16.5px", color: "var(--text-secondary)", marginBottom: "24px", lineHeight: 1.5 }}>
          Here&apos;s a snapshot of your workspace. Stay on top of deadlines and keep your projects moving forward.
        </p>

        {/* New Project Button */}
        <CreateProjectButton />
      </div>

      {/* RIGHT - Snapshot Card */}
      <div
        style={{
          background: "var(--bg-base)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-md)",
          padding: "28px",
          transition: "transform .18s ease, box-shadow .18s ease, border-color .18s ease",
          cursor: "default",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.transform = "translateY(-4px)";
          el.style.boxShadow = "var(--elevation-3)";
          el.style.borderColor = "rgba(139,92,246,0.28)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.transform = "translateY(0)";
          el.style.boxShadow = "var(--shadow-md)";
          el.style.borderColor = "var(--border-default)";
        }}
      >
        {/* Health ring row */}
        <div style={{ display: "flex", alignItems: "center", gap: "18px", marginBottom: "20px" }}>
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="var(--border-default)" strokeWidth="5" />
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={2 * Math.PI * 34 - (healthScore / 100) * 2 * Math.PI * 34}
              transform="rotate(-90 40 40)"
              style={{ transition: "stroke-dashoffset 1s ease" }}
            />
          </svg>
          <div>
            <div style={{ fontSize: "44px", fontWeight: 200, letterSpacing: "-0.02em", color: "var(--text-primary)", lineHeight: 1 }}>
              {healthScore}
            </div>
            <span
              style={{
                display: "inline-block",
                marginTop: "6px",
                background: healthScore >= 70 ? "var(--accent-soft)" : "var(--danger-soft)",
                color: healthScore >= 70 ? "var(--accent)" : "var(--danger)",
                borderRadius: "999px",
                padding: "3px 10px",
                fontSize: "11px",
                fontWeight: 500,
              }}
            >
              {healthScore >= 70 ? "On track" : "Needs attention"}
            </span>
          </div>
        </div>

        {/* Tasks remaining */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "28px", fontWeight: 300, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            {activeTasks}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            tasks remaining across {totalProjects} projects
          </div>
        </div>

        {/* Breakdown grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px" }}>
          <div
            style={{ textAlign: "center", padding: "10px 0", background: "var(--bg-muted)", borderRadius: "var(--radius-sm)", border: "1px solid transparent", transition: "transform .18s ease, box-shadow .18s ease, border-color .18s ease", cursor: "default" }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.transform = "translateY(-4px)";
              el.style.boxShadow = "var(--elevation-2)";
              el.style.borderColor = "rgba(139,92,246,0.28)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.transform = "translateY(0)";
              el.style.boxShadow = "none";
              el.style.borderColor = "transparent";
            }}
          >
            <div style={{ fontSize: "18px", fontWeight: 600, color: overdue.length > 0 ? "var(--danger)" : "var(--text-primary)" }}>{overdue.length}</div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Overdue</div>
          </div>
          <div
            style={{ textAlign: "center", padding: "10px 0", background: "var(--bg-muted)", borderRadius: "var(--radius-sm)", border: "1px solid transparent", transition: "transform .18s ease, box-shadow .18s ease, border-color .18s ease", cursor: "default" }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.transform = "translateY(-4px)";
              el.style.boxShadow = "var(--elevation-2)";
              el.style.borderColor = "rgba(139,92,246,0.28)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.transform = "translateY(0)";
              el.style.boxShadow = "none";
              el.style.borderColor = "transparent";
            }}
          >
            <div style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-primary)" }}>{dueToday.length}</div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Today</div>
          </div>
          <div
            style={{ textAlign: "center", padding: "10px 0", background: "var(--bg-muted)", borderRadius: "var(--radius-sm)", border: "1px solid transparent", transition: "transform .18s ease, box-shadow .18s ease, border-color .18s ease", cursor: "default" }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.transform = "translateY(-4px)";
              el.style.boxShadow = "var(--elevation-2)";
              el.style.borderColor = "rgba(139,92,246,0.28)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.transform = "translateY(0)";
              el.style.boxShadow = "none";
              el.style.borderColor = "transparent";
            }}
          >
            <div style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-primary)" }}>{dueThisWeek.length}</div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>This Week</div>
          </div>
          <div
            style={{ textAlign: "center", padding: "10px 0", background: "var(--bg-muted)", borderRadius: "var(--radius-sm)", border: "1px solid transparent", transition: "transform .18s ease, box-shadow .18s ease, border-color .18s ease", cursor: "default" }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.transform = "translateY(-4px)";
              el.style.boxShadow = "var(--elevation-2)";
              el.style.borderColor = "rgba(139,92,246,0.28)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.transform = "translateY(0)";
              el.style.boxShadow = "none";
              el.style.borderColor = "transparent";
            }}
          >
            <div style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-primary)" }}>{dueLater.length}</div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Later</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Projects Section ────────────────────────────────────────────────────────

function ProjectsSection({
  projects,
  visibleProjects,
  projectTab,
  setProjectTab,
  projectSearch,
  setProjectSearch,
  showAllProjects,
  setShowAllProjects,
  availableTags,
  onDeleteProject,
}: {
  projects: DashboardContentProps["projects"];
  visibleProjects: DashboardContentProps["projects"];
  projectTab: string;
  setProjectTab: (t: string) => void;
  projectSearch: string;
  setProjectSearch: (s: string) => void;
  showAllProjects: boolean;
  setShowAllProjects: (b: boolean) => void;
  availableTags: DashboardContentProps["availableTags"];
  onDeleteProject: (projectId: string, e: React.MouseEvent) => void;
}) {
  // System view filters + custom user tags as filter tabs
  const systemTabs = [
    { id: "all", label: "All Projects" },
    { id: "not_started", label: "Not Started" },
    { id: "ongoing", label: "Ongoing" },
    { id: "draft", label: "Draft" },
  ];
  const tagTabs = availableTags
    .filter((t) => !t.isSystem)
    .map((t) => ({ id: `tag:${t.id}`, label: t.name, color: t.color }));
  const allTabs = [...systemTabs, ...tagTabs];

  // Sliding pill indicator refs
  const tabBarRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Tag row overflow fade refs
  const tagRowRef = useRef<HTMLDivElement>(null);
  const [tagFadeLeft, setTagFadeLeft] = useState(false);
  const [tagFadeRight, setTagFadeRight] = useState(false);

  // Reduced motion check
  const prefersReducedMotion = useRef(false);
  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // ─── Sliding pill indicator logic ───────────────────────────────────────
  useEffect(() => {
    const activeBtn = tabRefs.current.get(projectTab);
    const pill = pillRef.current;
    const bar = tabBarRef.current;
    if (!activeBtn || !pill || !bar) return;

    const barRect = bar.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    const left = btnRect.left - barRect.left;
    const width = btnRect.width;

    if (prefersReducedMotion.current) {
      pill.style.transition = "none";
    } else {
      pill.style.transition = "left .25s cubic-bezier(.4,0,.2,1), width .25s cubic-bezier(.4,0,.2,1)";
    }
    pill.style.left = `${left}px`;
    pill.style.width = `${width}px`;
  }, [projectTab, allTabs.length]);

  // Recheck pill on resize
  useEffect(() => {
    const handler = () => {
      const activeBtn = tabRefs.current.get(projectTab);
      const pill = pillRef.current;
      const bar = tabBarRef.current;
      if (!activeBtn || !pill || !bar) return;
      const barRect = bar.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      pill.style.transition = "none";
      pill.style.left = `${btnRect.left - barRect.left}px`;
      pill.style.width = `${btnRect.width}px`;
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [projectTab]);

  // ─── Tag row overflow fade logic ───────────────────────────────────────
  const checkTagOverflowFn = () => {
    const el = tagRowRef.current;
    if (!el) { setTagFadeLeft(false); setTagFadeRight(false); return; }
    setTagFadeLeft(el.scrollLeft > 4);
    setTagFadeRight(el.scrollWidth - el.clientWidth - el.scrollLeft > 4);
  };

  useEffect(() => {
    checkTagOverflowFn();
    const el = tagRowRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => checkTagOverflowFn());
    obs.observe(el);
    return () => obs.disconnect();
  }, [allTabs.length]);

  // Count projects needing attention
  const needsAttentionCount = projects.filter(
    (p) => p.totalTasks === 0 || (p.completedTasks === 0 && p.totalTasks > 0)
  ).length;

  return (
    <section data-testid="projects-section-v2" className="my-projects-section">
      {/* ═══ Header: title + subtitle + search ═══ */}
      <div className="my-projects-header">
        <div className="my-projects-header__left">
          <h2 className="my-projects-title">My Projects</h2>
          <p className="my-projects-subtitle">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
            {needsAttentionCount > 0 && ` · ${needsAttentionCount} need your attention`}
          </p>
        </div>
        <div className="my-projects-header__right">
          <div className="my-projects-search">
            <Search className="my-projects-search__icon" />
            <input
              type="text"
              placeholder="Search projects..."
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              className="my-projects-search__input"
              aria-label="Search projects"
            />
          </div>
          <div className="my-projects-create">
            <CreateProjectButton />
          </div>
        </div>
      </div>

      {/* ═══ Merged Filter Bar (rounded rectangle, pills inside) ═══ */}
      <div className="my-projects-filter-bar" ref={tabBarRef} role="tablist" aria-label="Filter projects by status">
        {/* Sliding pill indicator (behind active tab) */}
        <div className="my-projects-pill-indicator" ref={pillRef} aria-hidden="true" />

        {/* Status tabs */}
        {systemTabs.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => { if (el) tabRefs.current.set(tab.id, el); }}
            role="tab"
            aria-selected={projectTab === tab.id}
            tabIndex={projectTab === tab.id ? 0 : -1}
            className={`my-projects-tab${projectTab === tab.id ? " my-projects-tab--active" : ""}`}
            onClick={() => setProjectTab(tab.id)}
            onKeyDown={(e) => {
              const tabIds = allTabs.map((t) => t.id);
              const idx = tabIds.indexOf(tab.id);
              if (e.key === "ArrowRight") {
                e.preventDefault();
                const next = tabIds[(idx + 1) % tabIds.length];
                setProjectTab(next);
                tabRefs.current.get(next)?.focus();
              } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                const prev = tabIds[(idx - 1 + tabIds.length) % tabIds.length];
                setProjectTab(prev);
                tabRefs.current.get(prev)?.focus();
              }
            }}
          >
            {tab.label}
          </button>
        ))}

        {/* Tag overflow row (if custom tags exist) */}
        {tagTabs.length > 0 && (
          <>
            <div className="my-projects-tab-divider" aria-hidden="true" />
            <div className="my-projects-tag-row-wrap">
              {tagFadeLeft && <div className="my-projects-tag-fade my-projects-tag-fade--left" aria-hidden="true" />}
              <div
                className="my-projects-tag-row"
                ref={tagRowRef}
                onScroll={() => checkTagOverflowFn()}
              >
                {tagTabs.map((tag) => (
                  <button
                    key={tag.id}
                    ref={(el) => { if (el) tabRefs.current.set(tag.id, el); }}
                    role="tab"
                    aria-selected={projectTab === tag.id}
                    tabIndex={projectTab === tag.id ? 0 : -1}
                    className={`my-projects-tab my-projects-tab--tag${projectTab === tag.id ? " my-projects-tab--active" : ""}`}
                    onClick={() => setProjectTab(tag.id)}
                    onKeyDown={(e) => {
                      const tabIds = allTabs.map((t) => t.id);
                      const idx = tabIds.indexOf(tag.id);
                      if (e.key === "ArrowRight") {
                        e.preventDefault();
                        const next = tabIds[(idx + 1) % tabIds.length];
                        setProjectTab(next);
                        tabRefs.current.get(next)?.focus();
                      } else if (e.key === "ArrowLeft") {
                        e.preventDefault();
                        const prev = tabIds[(idx - 1 + tabIds.length) % tabIds.length];
                        setProjectTab(prev);
                        tabRefs.current.get(prev)?.focus();
                      }
                    }}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
              {tagFadeRight && <div className="my-projects-tag-fade my-projects-tag-fade--right" aria-hidden="true" />}
            </div>
          </>
        )}
      </div>

      {/* ═══ Project Grid ═══ */}
      <div
        className="my-projects-grid"
        id="projects-grid"
      >
        {visibleProjects.map((project, idx) => (
          <div
            key={project.id}
            className={`my-projects-card-entrance my-projects-card-entrance--${Math.min(idx, 7)}`}
            style={{
              position: "relative",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <ProjectCard project={project} index={idx} availableTags={availableTags} onDeleteProject={onDeleteProject} />
          </div>
        ))}
      </div>

      {/* Empty state */}
      {visibleProjects.length === 0 && (
        <div className="my-projects-empty">
          <Circle style={{ width: "32px", height: "32px", margin: "0 auto 12px", opacity: 0.4 }} />
          <p>No projects match your filter</p>
        </div>
      )}

      {/* ═══ Show All Expand/Collapse Bar ═══ */}
      {projectTab === "all" && projects.length > 8 && (
        <button
          className={`my-projects-show-all${showAllProjects ? " my-projects-show-all--expanded" : ""}`}
          onClick={() => setShowAllProjects(!showAllProjects)}
          aria-expanded={showAllProjects}
          aria-controls="projects-grid"
        >
          <span className="my-projects-show-all__label">
            {showAllProjects ? "Show fewer" : `Show all ${projects.length} projects`}
          </span>
          <ChevronDown className="my-projects-show-all__chevron" />
        </button>
      )}
    </section>
  );
}



// ─── Project Card ────────────────────────────────────────────────────────────

function ProjectCard({ project, index, availableTags, onDeleteProject }: { project: DashboardContentProps["projects"][number]; index: number; availableTags: DashboardContentProps["availableTags"]; onDeleteProject: (projectId: string, e: React.MouseEvent) => void }) {
  const progress = project.totalTasks > 0 ? Math.round((project.completedTasks / project.totalTasks) * 100) : 0;
  const statusLabel = project.totalTasks === 0 ? "Draft" : project.completedTasks === project.totalTasks ? "Complete" : progress > 0 ? "Ongoing" : "Not Started";

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => { window.location.href = `/graph/${project.id}`; }}
      onKeyDown={(e) => { if (e.key === "Enter") window.location.href = `/graph/${project.id}`; }}
      style={{ textDecoration: "none", cursor: "pointer" }}
    >
      <div
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-sm)",
          padding: "26px",
          transition: "transform .22s ease, box-shadow .22s ease, border-color .22s ease",
          cursor: "pointer",
          height: "100%",
          position: "relative",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.transform = "translateY(-4px)";
          el.style.boxShadow = "var(--shadow-md)";
          el.style.borderColor = "rgba(139,92,246,0.28)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.transform = "translateY(0)";
          el.style.boxShadow = "var(--shadow-sm)";
          el.style.borderColor = "var(--border-default)";
        }}
      >
        {/* Tag manager button - top right */}
        {/* Top-right actions - edit + delete + tag manager */}
        <div
          style={{ position: "absolute", top: "14px", right: "14px", zIndex: 2, display: "flex", alignItems: "center", gap: "4px" }}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <EditProjectButton projectId={project.id} projectName={project.name} />
          <button
            onClick={(e) => onDeleteProject(project.id, e)}
            title="Delete project"
            aria-label="Delete project"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              border: "none",
              background: "transparent",
              color: "var(--text-muted)",
              cursor: "pointer",
              transition: "background .15s ease, color .15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.08)";
              e.currentTarget.style.color = "var(--error, #ef4444)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            <Trash2 style={{ width: "14px", height: "14px" }} />
          </button>
          <ProjectTagManager
            projectId={project.id}
            projectName={project.name}
            currentTags={project.tags}
            availableTags={availableTags}
          />
        </div>

        {/* Top row - status badge */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "flex-start", marginBottom: "14px" }}>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              padding: "3px 8px",
              borderRadius: "999px",
              background: statusLabel === "Ongoing" ? "var(--accent-soft)" : "var(--bg-muted)",
              color: statusLabel === "Ongoing" ? "var(--accent)" : statusLabel === "Complete" ? "var(--accent)" : "var(--text-muted)",
            }}
          >
            {statusLabel}
          </span>
        </div>

        {/* Name */}
        <h3 style={{ fontSize: "17px", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--text-primary)", marginBottom: "6px" }}>
          {project.name}
        </h3>

        {/* Meta */}
        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
          {project.totalTasks} tasks · {project.memberCount} member{project.memberCount !== 1 ? "s" : ""}
        </p>

        {/* Progress bar */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ height: "4px", borderRadius: "2px", background: "var(--bg-muted)", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                borderRadius: "2px",
                background: "var(--accent)",
                transition: "width .6s ease",
              }}
            />
          </div>
        </div>

        {/* Tags */}
        <div style={{ marginBottom: "14px", minHeight: "26px" }}>
          {project.tags.length > 0 && (
            <TagScrollContainer>
              {project.tags.map((tag) => (
                <TagChip key={tag.id} name={tag.name} color={tag.color} isSystem={tag.isSystem} />
              ))}
            </TagScrollContainer>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "var(--border-subtle)", marginBottom: "14px" }} />

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "var(--text-muted)" }}>
            <Clock style={{ width: "12px", height: "12px" }} />
            {project.lastOpenedAt ? formatRelativeTime(project.lastOpenedAt) : `${project.completedTasks}/${project.totalTasks} complete`}
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "transparent",
              color: "var(--text-muted)",
              transition: "background .15s ease, color .15s ease, transform .15s ease",
              cursor: "pointer",
            }}
            title="Open project"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--accent-soft)";
              e.currentTarget.style.color = "var(--accent)";
              e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Project Button ─────────────────────────────────────────────────────

function EditProjectButton({ projectId, projectName }: { projectId: string; projectName: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(projectName);
  const [members, setMembers] = useState<Array<{ id: string; userId: string; role: string; user: { name: string | null; email: string } }>>([]);
  const [friends, setFriends] = useState<Array<{ friendId: string; name: string | null; email: string }>>([]);
  const [teams, setTeams] = useState<Array<{ id: string; name: string; members: Array<{ id: string; email: string }> }>>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"friends" | "teams">("friends");
  const dialogRef = useRef<HTMLDialogElement>(null);

  const openDialog = async () => {
    setOpen(true);
    setName(projectName);
    setError("");
    setAddError("");
    setTab("friends");
    setLoading(true);
    try {
      const [membersData, friendsData, teamsData] = await Promise.all([
        getProjectMembers(projectId),
        getFriends(),
        getTeams(),
      ]);
      setMembers(membersData.map((m: { id: string; userId: string; role: string; user: { name: string | null; email: string } }) => ({
        id: m.id, userId: m.userId, role: m.role, user: { name: m.user.name, email: m.user.email },
      })));
      setFriends(friendsData.map((f: { friendId: string; name: string | null; email: string }) => ({
        friendId: f.friendId, name: f.name, email: f.email,
      })));
      setTeams(teamsData.map((t: { id: string; name: string; members: Array<{ id: string; email: string }> }) => ({
        id: t.id, name: t.name, members: t.members,
      })));
    } catch {
      setMembers([]);
      setFriends([]);
      setTeams([]);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!name.trim()) { setError("Project name is required"); return; }
    setSaving(true);
    setError("");
    const formData = new FormData();
    formData.set("id", projectId);
    formData.set("name", name.trim());
    const result = await updateProject(formData);
    setSaving(false);
    if (result && "error" in result) { setError(result.error as string); }
    else { setOpen(false); }
  };

  const handleAddFriend = async (friendId: string) => {
    setAddError("");
    try {
      await addFriendToProject(friendId, projectId);
      // Refresh members
      const data = await getProjectMembers(projectId);
      setMembers(data.map((m: { id: string; userId: string; role: string; user: { name: string | null; email: string } }) => ({
        id: m.id, userId: m.userId, role: m.role, user: { name: m.user.name, email: m.user.email },
      })));
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to add friend");
    }
  };

  const handleAddTeam = async (team: { id: string; name: string; members: Array<{ id: string; email: string }> }) => {
    setAddError("");
    try {
      for (const member of team.members) {
        const { inviteMember } = await import("@/actions/team-actions");
        await inviteMember(projectId, member.email, "MEMBER");
      }
      // Refresh members
      const data = await getProjectMembers(projectId);
      setMembers(data.map((m: { id: string; userId: string; role: string; user: { name: string | null; email: string } }) => ({
        id: m.id, userId: m.userId, role: m.role, user: { name: m.user.name, email: m.user.email },
      })));
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to add team");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const result = await removeMember(projectId, memberId);
    if (result && "error" in result) { setAddError(result.error as string); }
    else { setMembers((prev) => prev.filter((m) => m.id !== memberId)); }
  };

  // Friends not already in the project
  const availableFriends = friends.filter((f) => !members.some((m) => m.userId === f.friendId));

  useEffect(() => {
    if (open) { dialogRef.current?.showModal(); }
    else { dialogRef.current?.close(); }
  }, [open]);

  return (
    <>
      <button
        onClick={() => openDialog()}
        title="Edit project"
        aria-label="Edit project"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "28px",
          height: "28px",
          borderRadius: "6px",
          border: "none",
          background: "transparent",
          color: "var(--text-muted)",
          cursor: "pointer",
          transition: "background .15s ease, color .15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--bg-muted)";
          e.currentTarget.style.color = "var(--accent)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--text-muted)";
        }}
      >
        <Pencil style={{ width: "14px", height: "14px" }} />
      </button>

      {open && (
        <dialog
          ref={dialogRef}
          onClose={() => setOpen(false)}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.5)",
            border: "none",
            padding: 0,
            width: "100vw",
            height: "100vh",
            maxWidth: "100vw",
            maxHeight: "100vh",
          }}
        >
          <div
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-lg)",
              padding: "28px",
              width: "100%",
              maxWidth: "440px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Edit Project</h3>
              <button
                onClick={() => setOpen(false)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  border: "none",
                  background: "transparent",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                }}
                aria-label="Close"
              >
                <X style={{ width: "16px", height: "16px" }} />
              </button>
            </div>

            {/* Project name input */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Project Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: "14px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-default)",
                  background: "var(--bg-primary)",
                  color: "var(--text-primary)",
                  outline: "none",
                  transition: "border-color .15s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-default)"; }}
              />
              {error && <p style={{ fontSize: "12px", color: "var(--error)", marginTop: "6px" }}>{error}</p>}
            </div>

            {/* Members section */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Members
              </label>

              {loading ? (
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Loading members...</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                  {members.map((member) => (
                    <div
                      key={member.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        background: "var(--bg-muted)",
                        fontSize: "13px",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                        <span style={{ color: "var(--text-primary)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {member.user.name || member.user.email}
                        </span>
                        {member.user.name && (
                          <span style={{ fontSize: "11px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {member.user.email}
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                        <span style={{
                          fontSize: "10px",
                          fontWeight: 500,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: member.role === "HEAD" ? "var(--accent-soft)" : "transparent",
                          color: member.role === "HEAD" ? "var(--accent)" : "var(--text-muted)",
                        }}>
                          {member.role === "HEAD" ? "Owner" : member.role === "ADMIN" ? "Admin" : "Member"}
                        </span>
                        {member.role !== "HEAD" && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            title="Remove member"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "22px",
                              height: "22px",
                              borderRadius: "4px",
                              border: "none",
                              background: "transparent",
                              color: "var(--text-muted)",
                              cursor: "pointer",
                              transition: "color .15s ease, background .15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = "var(--error, #ef4444)";
                              e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = "var(--text-muted)";
                              e.currentTarget.style.background = "transparent";
                            }}
                          >
                            <Trash2 style={{ width: "12px", height: "12px" }} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add from friends or teams */}
              <div style={{ marginTop: "4px" }}>
                <div style={{ display: "flex", gap: "4px", marginBottom: "10px" }}>
                  <button
                    onClick={() => setTab("friends")}
                    style={{
                      padding: "5px 12px",
                      fontSize: "12px",
                      fontWeight: 600,
                      borderRadius: "6px",
                      border: "1px solid " + (tab === "friends" ? "var(--accent)" : "var(--border-default)"),
                      background: tab === "friends" ? "var(--accent-soft)" : "transparent",
                      color: tab === "friends" ? "var(--accent)" : "var(--text-secondary)",
                      cursor: "pointer",
                      transition: "all .15s ease",
                    }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <UserPlus style={{ width: "12px", height: "12px" }} /> Friends
                    </span>
                  </button>
                  <button
                    onClick={() => setTab("teams")}
                    style={{
                      padding: "5px 12px",
                      fontSize: "12px",
                      fontWeight: 600,
                      borderRadius: "6px",
                      border: "1px solid " + (tab === "teams" ? "var(--accent)" : "var(--border-default)"),
                      background: tab === "teams" ? "var(--accent-soft)" : "transparent",
                      color: tab === "teams" ? "var(--accent)" : "var(--text-secondary)",
                      cursor: "pointer",
                      transition: "all .15s ease",
                    }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <Users style={{ width: "12px", height: "12px" }} /> Teams
                    </span>
                  </button>
                </div>

                {tab === "friends" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "150px", overflowY: "auto" }}>
                    {availableFriends.length === 0 ? (
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", padding: "8px 0" }}>
                        {friends.length === 0 ? "No friends yet" : "All friends are already members"}
                      </p>
                    ) : (
                      availableFriends.map((friend) => (
                        <div
                          key={friend.friendId}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "7px 10px",
                            borderRadius: "6px",
                            border: "1px solid var(--border-default)",
                            fontSize: "13px",
                          }}
                        >
                          <span style={{ color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {friend.name || friend.email}
                          </span>
                          <button
                            onClick={() => handleAddFriend(friend.friendId)}
                            style={{
                              padding: "3px 8px",
                              fontSize: "11px",
                              fontWeight: 600,
                              borderRadius: "4px",
                              border: "none",
                              background: "var(--accent)",
                              color: "#fff",
                              cursor: "pointer",
                              flexShrink: 0,
                            }}
                          >
                            Add
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {tab === "teams" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "150px", overflowY: "auto" }}>
                    {teams.length === 0 ? (
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", padding: "8px 0" }}>No teams yet</p>
                    ) : (
                      teams.map((team) => (
                        <div
                          key={team.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "7px 10px",
                            borderRadius: "6px",
                            border: "1px solid var(--border-default)",
                            fontSize: "13px",
                          }}
                        >
                          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                            <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{team.name}</span>
                            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                              {team.members.length} member{team.members.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <button
                            onClick={() => handleAddTeam(team)}
                            style={{
                              padding: "3px 8px",
                              fontSize: "11px",
                              fontWeight: 600,
                              borderRadius: "4px",
                              border: "none",
                              background: "var(--accent)",
                              color: "#fff",
                              cursor: "pointer",
                              flexShrink: 0,
                            }}
                          >
                            Add All
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              {addError && <p style={{ fontSize: "12px", color: "var(--error, #ef4444)", marginTop: "6px" }}>{addError}</p>}
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                width: "100%",
                padding: "10px 16px",
                fontSize: "14px",
                fontWeight: 600,
                borderRadius: "8px",
                border: "none",
                background: "var(--accent)",
                color: "#fff",
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1,
                transition: "opacity .15s ease",
              }}
              onMouseEnter={(e) => { if (!saving) e.currentTarget.style.opacity = "0.85"; }}
              onMouseLeave={(e) => { if (!saving) e.currentTarget.style.opacity = "1"; }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </dialog>
      )}
    </>
  );
}

// ─── Needs Attention Panel ───────────────────────────────────────────────────

function NeedsAttentionPanel({ items }: { items: DashboardContentProps["needsAttention"] }) {
  return (
    <div
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-sm)",
        padding: "26px",
        transition: "transform .18s ease, box-shadow .18s ease",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.transform = "translateY(-2px)";
        el.style.boxShadow = "var(--shadow-md)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "var(--shadow-sm)";
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Needs Attention
        </h3>
        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
          Surfaced automatically
        </div>
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)" }}>
          <CheckCircle2 style={{ width: "28px", height: "28px", margin: "0 auto 10px", opacity: 0.4 }} />
          <p style={{ fontSize: "13px" }}>All clear - nothing needs attention</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {items.slice(0, 6).map((item) => (
            <Link
              key={item.id}
              href={`/graph/${item.projectId}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  borderLeft: `3px solid ${item.daysOverdue && item.daysOverdue > 3 ? "#6d28d9" : "#8B5CF6"}`,
                  paddingLeft: "16px",
                  padding: "10px 12px 10px 16px",
                  borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                  transition: "background .15s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--bg-muted)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                      {item.projectName}
                      {item.daysOverdue && item.daysOverdue > 0 ? ` · ${item.daysOverdue}d overdue` : ""}
                      {item.status === "BLOCKED" ? " · Blocked" : ""}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 500,
                      padding: "2px 7px",
                      borderRadius: "999px",
                      background: item.status === "BLOCKED" ? "var(--danger-soft)" : "rgba(139,92,246,0.08)",
                      color: item.status === "BLOCKED" ? "var(--danger)" : "var(--accent)",
                      flexShrink: 0,
                    }}
                  >
                    {item.status === "BLOCKED" ? "Blocked" : "Overdue"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Friends (Team Workload) Panel ───────────────────────────────────────────

function FriendsPanel({
  workload,
  friendRingOffsets,
  smallCircumference,
}: {
  workload: DashboardContentProps["workload"];
  friendRingOffsets: number[];
  smallCircumference: number;
}) {
  return (
    <div
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-sm)",
        padding: "26px",
        transition: "transform .18s ease, box-shadow .18s ease",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.transform = "translateY(-2px)";
        el.style.boxShadow = "var(--shadow-md)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "var(--shadow-sm)";
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Friends
        </h3>
        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
          Who&apos;s around right now
        </div>
      </div>

      {workload.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)" }}>
          <Circle style={{ width: "28px", height: "28px", margin: "0 auto 10px", opacity: 0.4 }} />
          <p style={{ fontSize: "13px" }}>No team members with active tasks</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {workload.slice(0, 6).map((member, idx) => {
            const maxTotal = Math.max(...workload.map((w) => w.total), 1);
            const healthPct = Math.min(Math.round((member.total / maxTotal) * 100), 100);
            const isOnline = member.inProgress > 0;
            const statusText = isOnline ? "Active now" : "Offline";
            const healthLabel = healthPct < 40 ? "Light load" : healthPct <= 75 ? "Busy" : "Stacked";

            return (
              <div
                key={member.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "8px 10px",
                  borderRadius: "var(--radius-sm)",
                  transition: "background .15s ease",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--bg-muted)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                {/* Avatar with status dot */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "var(--accent-soft)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--accent)",
                    }}
                  >
                    {member.initials}
                  </div>
                  {/* Status dot overlay */}
                  <span
                    style={{
                      position: "absolute",
                      bottom: "1px",
                      right: "1px",
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: isOnline ? "#22c55e" : "#9ca3af",
                      border: "2px solid var(--bg-elevated)",
                    }}
                  />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>
                    {member.name}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    {statusText}
                  </div>
                </div>

                {/* Health ring + percentage + label */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                  <div style={{ position: "relative", width: "32px", height: "32px" }}>
                    <svg width="32" height="32" viewBox="0 0 32 32">
                      <circle cx="16" cy="16" r="13" fill="none" stroke="var(--border-default)" strokeWidth="3" />
                      <circle
                        cx="16"
                        cy="16"
                        r="13"
                        fill="none"
                        stroke={healthPct < 40 ? "#22c55e" : healthPct <= 75 ? "#f59e0b" : "#ef4444"}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 13}`}
                        strokeDashoffset={2 * Math.PI * 13 - (healthPct / 100) * 2 * Math.PI * 13}
                        transform="rotate(-90 16 16)"
                        style={{ transition: "stroke-dashoffset .8s ease" }}
                      />
                    </svg>
                    <span
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        fontSize: "8px",
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {healthPct}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 500,
                      color: healthPct < 40 ? "#22c55e" : healthPct <= 75 ? "#f59e0b" : "#ef4444",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {healthLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Deadlines Panel ─────────────────────────────────────────────────────────

function DeadlinesPanel({
  deadlineTab,
  setDeadlineTab,
  dueToday,
  dueThisWeek,
  dueLater,
  overdue,
  deadlineItems,
}: {
  deadlineTab: "today" | "week" | "later" | "overdue";
  setDeadlineTab: (t: "today" | "week" | "later" | "overdue") => void;
  dueToday: DashboardContentProps["dueToday"];
  dueThisWeek: DashboardContentProps["dueThisWeek"];
  dueLater: DashboardContentProps["dueLater"];
  overdue: DashboardContentProps["overdue"];
  deadlineItems: DashboardContentProps["dueToday"];
}) {
  const tabs: Array<{ id: "today" | "week" | "later" | "overdue"; label: string; count: number; isOverdue?: boolean }> = [
    { id: "overdue", label: "Overdue", count: overdue.length, isOverdue: true },
    { id: "today", label: "Today", count: dueToday.length },
    { id: "week", label: "This Week", count: dueThisWeek.length },
    { id: "later", label: "Later", count: dueLater.length },
  ];

  return (
    <div
      className="deadlines-panel-outer"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-sm)",
        padding: "26px",
        marginBottom: "20px",
        transition: "transform .18s ease, box-shadow .18s ease, border-color .18s ease",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.transform = "translateY(-4px)";
        el.style.boxShadow = "var(--elevation-3)";
        el.style.borderColor = "rgba(139,92,246,0.28)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "var(--shadow-sm)";
        el.style.borderColor = "var(--border-default)";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
        <Calendar style={{ width: "16px", height: "16px", color: "var(--accent)" }} />
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Deadlines
        </h3>
      </div>
      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px", marginBottom: "20px" }}>
        What&apos;s due, sorted by urgency
      </div>

      {/* Segmented tab bar - wraps on mobile via className for responsive */}
      <div
        className="deadlines-tabbar"
        style={{
          display: "flex",
          background: "var(--bg-base)",
          borderRadius: "999px",
          padding: "5px",
          marginBottom: "20px",
          border: "1px solid var(--border-subtle)",
          gap: "4px",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setDeadlineTab(tab.id)}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: "999px",
              fontSize: "12.5px",
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
              transition: "all .18s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              background: deadlineTab === tab.id ? "var(--bg-muted)" : "transparent",
              color: deadlineTab === tab.id
                ? (tab.isOverdue && tab.count > 0 ? "var(--danger)" : "var(--text-primary)")
                : (tab.isOverdue && tab.count > 0 ? "var(--danger)" : "var(--text-secondary)"),
              boxShadow: deadlineTab === tab.id ? "var(--shadow-sm)" : "none",
            }}
          >
            {tab.label}
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                background: deadlineTab === tab.id
                  ? (tab.isOverdue && tab.count > 0 ? "var(--danger-soft)" : "var(--accent-soft)")
                  : "var(--bg-muted)",
                color: deadlineTab === tab.id
                  ? (tab.isOverdue && tab.count > 0 ? "var(--danger)" : "var(--accent)")
                  : "var(--text-muted)",
                borderRadius: "999px",
                padding: "1px 6px",
                minWidth: "18px",
                textAlign: "center",
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {deadlineItems.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
          <Clock style={{ width: "28px", height: "28px", margin: "0 auto 10px", opacity: 0.4 }} />
          <p style={{ fontSize: "13px" }}>
            {deadlineTab === "overdue" ? "Nothing overdue - you\u2019re on track!" : deadlineTab === "today" ? "Nothing due today - enjoy the breathing room" : deadlineTab === "week" ? "No tasks due this week" : "No upcoming deadlines"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {deadlineItems.map((item) => (
            <Link
              key={item.id}
              href={`/graph/${item.projectId}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  transition: "background .15s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--bg-muted)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                {/* Check circle */}
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    border: `2px solid ${deadlineTab === "overdue" ? "var(--danger)" : "var(--border-default)"}`,
                    flexShrink: 0,
                  }}
                />

                {/* Title */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.title}
                  </div>
                </div>

                {/* Project tag */}
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 500,
                    padding: "2px 8px",
                    borderRadius: "999px",
                    background: "var(--bg-muted)",
                    color: "var(--text-muted)",
                    flexShrink: 0,
                    maxWidth: "120px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.projectName}
                </span>

                {/* Date / overdue indicator */}
                <span style={{ fontSize: "11px", color: deadlineTab === "overdue" ? "var(--danger)" : "var(--text-muted)", flexShrink: 0, fontWeight: deadlineTab === "overdue" ? 600 : 400 }}>
                  {deadlineTab === "overdue" && (item as { daysOverdue?: number }).daysOverdue !== undefined
                    ? `${(item as { daysOverdue?: number }).daysOverdue}d late`
                    : formatDate(item.dueDate)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
