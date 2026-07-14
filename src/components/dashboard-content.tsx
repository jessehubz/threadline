"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  Sparkles,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Circle,
  Globe,
  MessageCircle,
  Link2,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { CreateProjectButton } from "@/components/create-project-button";
import { TagChip } from "@/components/ui/tag-chip";
import { TagScrollContainer } from "@/components/ui/tag-scroll-container";
import { ProjectTagManager } from "@/components/project-tag-manager";

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

  // State
  const [showLauncher, setShowLauncher] = useState(false);
  const [projectTab, setProjectTab] = useState("all");
  const [projectSearch, setProjectSearch] = useState("");
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [deadlineTab, setDeadlineTab] = useState<"today" | "week" | "later">("today");
  const [healthRingOffset, setHealthRingOffset] = useState(251.2);
  const [friendRingOffsets, setFriendRingOffsets] = useState<number[]>([]);

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

  const visibleProjects = showAllProjects ? filteredProjects : filteredProjects.slice(0, 6);

  const deadlineItems =
    deadlineTab === "today" ? dueToday : deadlineTab === "week" ? dueThisWeek : dueLater;

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
        /* Section separator — subtle hairline between major blocks */
        .dash-separator {
          height: 1px;
          margin: 24px 0 28px;
          background: var(--border-subtle);
          border: none;
        }
        /* Filter tab bar container */
        .dash-filter-tabs {
          display: flex;
          align-items: center;
          gap: 2px;
          background: var(--bg-muted);
          border: 1px solid var(--border-default);
          border-radius: 999px;
          padding: 4px;
          margin-bottom: 20px;
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .dash-filter-tabs::-webkit-scrollbar { display: none; }
        @media (prefers-reduced-motion: reduce) {
          .dash-reveal {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }
        @media (max-width: 900px) {
          .dash-hero { grid-template-columns: 1fr !important; }
          .dash-second-row { grid-template-columns: 1fr !important; }
          .dash-footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          .dash-hero { padding: 24px 20px !important; }
          .dash-hero h1 { font-size: 32px !important; }
          .dash-search-box { display: none !important; }
          .dash-footer-grid { grid-template-columns: 1fr !important; }
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
        deadlineItems={deadlineItems}
      />
      </div>

      {/* ═══ 6. FOOTER ═══ */}
      <div className="dash-reveal">
      <FooterSection />
      </div>

      </div>{/* end revealContainerRef */}

      {/* AI Assistant Launcher — slides in after 200px scroll */}
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

      {/* RIGHT — Snapshot Card */}
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
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
  const tabs = [...systemTabs, ...tagTabs];

  return (
    <section style={{ marginBottom: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 600, letterSpacing: "-0.015em", color: "var(--text-primary)", marginBottom: "4px" }}>
            My Projects
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            Manage and track all your project graphs
          </p>
        </div>
        {/* Search */}
        <div
          className="dash-search-box"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--bg-muted)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-sm)",
            padding: "8px 14px",
            minWidth: "200px",
          }}
        >
          <Search style={{ width: "14px", height: "14px", color: "var(--text-muted)", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search projects..."
            value={projectSearch}
            onChange={(e) => setProjectSearch(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: "13px",
              color: "var(--text-primary)",
              width: "100%",
            }}
          />
        </div>
      </div>

      {/* Tab bar with chevron scroll controls */}
      <FilterTabBar tabs={tabs} projectTab={projectTab} setProjectTab={setProjectTab} />

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
        {visibleProjects.map((project, idx) => (
          <ProjectCard key={project.id} project={project} index={idx} availableTags={availableTags} />
        ))}
      </div>

      {/* Show all toggle */}
      {projects.length > 6 && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            onClick={() => setShowAllProjects(!showAllProjects)}
            style={{
              padding: "10px 20px",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: 500,
              background: "var(--bg-muted)",
              border: "1px solid var(--border-default)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              transition: "all .18s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--accent)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.28)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            {showAllProjects ? "Show fewer" : `Show all ${projects.length} projects`}
          </button>
        </div>
      )}

      {/* Empty */}
      {visibleProjects.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--text-muted)" }}>
          <Circle style={{ width: "32px", height: "32px", margin: "0 auto 12px", opacity: 0.4 }} />
          <p style={{ fontSize: "14px" }}>No projects match your filter</p>
        </div>
      )}
    </section>
  );
}

// ─── Filter Tab Bar with Chevron Scroll Controls ─────────────────────────────

function FilterTabBar({
  tabs,
  projectTab,
  setProjectTab,
}: {
  tabs: Array<{ id: string; label: string; color?: string }>;
  projectTab: string;
  setProjectTab: (t: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const checkOverflow = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 4);
    setShowRight(el.scrollWidth - el.clientWidth - el.scrollLeft > 4);
  };

  useEffect(() => {
    checkOverflow();
    const el = scrollRef.current;
    if (!el) return;
    const obs = new ResizeObserver(checkOverflow);
    obs.observe(el);
    return () => obs.disconnect();
  }, [tabs.length]);

  const scrollBy = (dir: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 150, behavior: "smooth" });
  };

  return (
    <div style={{ position: "relative", marginBottom: "20px" }}>
      {/* Left chevron */}
      {showLeft && (
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="Scroll tabs left"
          style={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            boxShadow: "var(--shadow-sm)",
            color: "var(--text-secondary)",
            cursor: "pointer",
            transition: "all .15s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.borderColor = "var(--accent)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--border-default)"; }}
        >
          <ChevronLeft style={{ width: "14px", height: "14px" }} />
        </button>
      )}

      {/* Scrollable tab container */}
      <div
        ref={scrollRef}
        onScroll={checkOverflow}
        className="dash-filter-tabs"
        style={{ margin: 0 }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setProjectTab(tab.id)}
            style={{
              padding: "8px 18px",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              transition: "all .18s ease",
              whiteSpace: "nowrap",
              flexShrink: 0,
              background: projectTab === tab.id ? "var(--accent)" : "transparent",
              color: projectTab === tab.id ? "#fff" : "var(--text-secondary)",
            }}
            onMouseEnter={(e) => {
              if (projectTab !== tab.id) {
                (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)";
                (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
              }
            }}
            onMouseLeave={(e) => {
              if (projectTab !== tab.id) {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Right chevron */}
      {showRight && (
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="Scroll tabs right"
          style={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            boxShadow: "var(--shadow-sm)",
            color: "var(--text-secondary)",
            cursor: "pointer",
            transition: "all .15s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.borderColor = "var(--accent)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--border-default)"; }}
        >
          <ChevronRight style={{ width: "14px", height: "14px" }} />
        </button>
      )}
    </div>
  );
}

// ─── Project Card ────────────────────────────────────────────────────────────

function ProjectCard({ project, index, availableTags }: { project: DashboardContentProps["projects"][number]; index: number; availableTags: DashboardContentProps["availableTags"] }) {
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
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: getProjectColor(index),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              fontWeight: 700,
              color: "var(--accent)",
            }}
          >
            {project.name.charAt(0).toUpperCase()}
          </div>
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
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px" }}>
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
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
        {project.tags.length > 0 && (
          <div style={{ marginBottom: "14px" }}>
            <TagScrollContainer>
              {project.tags.map((tag) => (
                <TagChip key={tag.id} name={tag.name} color={tag.color} isSystem={tag.isSystem} />
              ))}
            </TagScrollContainer>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: "1px", background: "var(--border-subtle)", marginBottom: "14px" }} />

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "var(--text-muted)" }}>
            <Clock style={{ width: "12px", height: "12px" }} />
            {project.completedTasks}/{project.totalTasks} complete
          </span>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} onMouseDown={(e) => e.stopPropagation()}>
            <ProjectTagManager
              projectId={project.id}
              projectName={project.name}
              currentTags={project.tags}
              availableTags={availableTags}
            />
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--accent)",
                transition: "gap .18s ease",
              }}
            >
              Open
              <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 10h11M11 5l5 5-5 5" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
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
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <AlertTriangle style={{ width: "16px", height: "16px", color: "var(--accent)" }} />
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Needs Attention
        </h3>
        {items.length > 0 && (
          <span
            style={{
              fontSize: "11px",
              fontWeight: 500,
              background: "var(--danger-soft)",
              color: "var(--danger)",
              borderRadius: "999px",
              padding: "2px 8px",
            }}
          >
            {items.length}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)" }}>
          <CheckCircle2 style={{ width: "28px", height: "28px", margin: "0 auto 10px", opacity: 0.4 }} />
          <p style={{ fontSize: "13px" }}>All clear — nothing needs attention</p>
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
                  (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.05)";
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
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <span style={{ fontSize: "16px" }}>👥</span>
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Team
        </h3>
        {workload.length > 0 && (
          <span
            style={{
              fontSize: "11px",
              fontWeight: 500,
              background: "var(--accent-soft)",
              color: "var(--accent)",
              borderRadius: "999px",
              padding: "2px 8px",
            }}
          >
            {workload.length}
          </span>
        )}
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
            const pct = Math.min(Math.round((member.total / maxTotal) * 100), 100);
            const offset = friendRingOffsets[idx] ?? smallCircumference;

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
                {/* Avatar */}
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
                    flexShrink: 0,
                  }}
                >
                  {member.initials}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>
                    {member.name}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    {member.total} task{member.total !== 1 ? "s" : ""} active
                    {member.blocked > 0 ? ` · ${member.blocked} blocked` : ""}
                  </div>
                </div>

                {/* Mini health ring */}
                <div style={{ position: "relative", width: "32px", height: "32px", flexShrink: 0 }}>
                  <svg width="32" height="32" viewBox="0 0 32 32">
                    <circle cx="16" cy="16" r="13" fill="none" stroke="var(--border-default)" strokeWidth="3" />
                    <circle
                      cx="16"
                      cy="16"
                      r="13"
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 13}`}
                      strokeDashoffset={2 * Math.PI * 13 - (pct / 100) * 2 * Math.PI * 13}
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
                    {pct}
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
  deadlineItems,
}: {
  deadlineTab: "today" | "week" | "later";
  setDeadlineTab: (t: "today" | "week" | "later") => void;
  dueToday: DashboardContentProps["dueToday"];
  dueThisWeek: DashboardContentProps["dueThisWeek"];
  dueLater: DashboardContentProps["dueLater"];
  deadlineItems: DashboardContentProps["dueToday"];
}) {
  const tabs: Array<{ id: "today" | "week" | "later"; label: string; count: number }> = [
    { id: "today", label: "Today", count: dueToday.length },
    { id: "week", label: "This Week", count: dueThisWeek.length },
    { id: "later", label: "Later", count: dueLater.length },
  ];

  return (
    <div
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-sm)",
        padding: "26px",
        marginBottom: "20px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <Calendar style={{ width: "16px", height: "16px", color: "var(--accent)" }} />
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Deadlines
        </h3>
      </div>

      {/* Segmented tab bar */}
      <div
        style={{
          display: "flex",
          background: "var(--bg-base)",
          borderRadius: "999px",
          padding: "5px",
          marginBottom: "20px",
          border: "1px solid var(--border-subtle)",
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
              color: deadlineTab === tab.id ? "var(--text-primary)" : "var(--text-secondary)",
              boxShadow: deadlineTab === tab.id ? "var(--shadow-sm)" : "none",
            }}
          >
            {tab.label}
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                background: deadlineTab === tab.id ? "var(--accent-soft)" : "var(--bg-muted)",
                color: deadlineTab === tab.id ? "var(--accent)" : "var(--text-muted)",
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
            {deadlineTab === "today" ? "Nothing due today — enjoy the breathing room" : deadlineTab === "week" ? "No tasks due this week" : "No upcoming deadlines"}
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
                    border: "2px solid var(--border-default)",
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

                {/* Date */}
                <span style={{ fontSize: "11px", color: "var(--text-muted)", flexShrink: 0 }}>
                  {formatDate(item.dueDate)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Footer Section ──────────────────────────────────────────────────────────

function FooterSection() {
  const footerLinks = {
    product: [
      { label: "Features", href: "#" },
      { label: "Pricing", href: "#" },
      { label: "Changelog", href: "#" },
      { label: "Integrations", href: "#" },
    ],
    resources: [
      { label: "Documentation", href: "#" },
      { label: "API Reference", href: "#" },
      { label: "Guides", href: "#" },
      { label: "Blog", href: "#" },
    ],
    company: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Security", href: "#" },
    ],
  };

  const socialIcons = [
    { Icon: Globe, href: "#", label: "Website" },
    { Icon: MessageCircle, href: "#", label: "Twitter" },
    { Icon: Link2, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-xl)",
        padding: "40px 44px 26px",
        marginTop: "4px",
      }}
    >
      {/* Top grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
          gap: "32px",
          marginBottom: "32px",
        }}
        className="dash-footer-grid"
      >
        {/* Brand */}
        <div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: "8px" }}>
            Threadline
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "16px", maxWidth: "240px" }}>
            Collaborative task management built around visual dependency graphs. Ship faster, together.
          </p>
          {/* Social icons */}
          <div style={{ display: "flex", gap: "8px" }}>
            {socialIcons.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-default)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-muted)",
                  transition: "all .18s ease",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "translateY(-2px)";
                  el.style.borderColor = "rgba(139,92,246,0.4)";
                  el.style.color = "#8B5CF6";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "translateY(0)";
                  el.style.borderColor = "var(--border-default)";
                  el.style.color = "var(--text-muted)";
                }}
              >
                <Icon style={{ width: "14px", height: "14px" }} />
              </a>
            ))}
          </div>
        </div>

        {/* Product */}
        <div>
          <div style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: "14px" }}>
            Product
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {footerLinks.product.map((link) => (
              <a
                key={link.label}
                href={link.href}
                style={{
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  transition: "color .15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div>
          <div style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: "14px" }}>
            Resources
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {footerLinks.resources.map((link) => (
              <a
                key={link.label}
                href={link.href}
                style={{
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  transition: "color .15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Company */}
        <div>
          <div style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: "14px" }}>
            Company
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {footerLinks.company.map((link) => (
              <a
                key={link.label}
                href={link.href}
                style={{
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  transition: "color .15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "var(--border-subtle)", marginBottom: "18px" }} />

      {/* Bottom */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <a
            href="#"
            style={{ fontSize: "12px", color: "var(--text-muted)", textDecoration: "none", transition: "color .15s ease" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
          >
            Terms
          </a>
          <a
            href="#"
            style={{ fontSize: "12px", color: "var(--text-muted)", textDecoration: "none", transition: "color .15s ease" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
          >
            Privacy
          </a>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            © 2026 Threadline
          </span>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 500,
              padding: "2px 7px",
              borderRadius: "999px",
              background: "var(--bg-muted)",
              color: "var(--text-muted)",
            }}
          >
            v2.1.0
          </span>
          <a
            href="#"
            style={{ fontSize: "12px", color: "var(--accent)", textDecoration: "none", transition: "opacity .15s ease" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.7"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
          >
            Feedback
          </a>
        </div>
      </div>
    </footer>
  );
}
