"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Clock, CheckCircle2, Circle } from "lucide-react";
import { DependencyMapPreview, type DependencyMapData } from "@/components/dependency-map-preview";
import { CreateProjectButton } from "@/components/create-project-button";
import { usePresence } from "@/hooks/use-presence";
import type { DepGlyph } from "@/lib/dependency-map";
import { formatRelativeTime } from "@/lib/utils";

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
    visibility: "PUBLIC" | "PRIVATE";
    totalTasks: number;
    completedTasks: number;
    memberCount: number;
    lastOpenedAt: string | null;
    displayOrder: number;
    role: "HEAD" | "CO_HEAD" | "MEMBER";
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
  awaitingApprovalCount: number;
  firstUpTask: {
    id: string;
    title: string;
    projectId: string;
    projectName: string;
    dueLabel: string;
    glyph: DepGlyph;
    unblocksCount: number;
  } | null;
  dependencyMaps: DependencyMapData[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null) {
  if (!dateStr) return "No date";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Component ───────────────────────────────────────────────────────────────

export function DashboardContent(props: DashboardContentProps) {
  const {
    greeting,
    firstName,
    healthScore,
    activeTasks,
    projects,
    needsAttention,
    dueToday,
    dueThisWeek,
    dueLater,
    overdue,
    workload,
    awaitingApprovalCount,
    firstUpTask,
    dependencyMaps,
  } = props;

  const { inProgressTasks, blockedTasksCount } = props;

  // Track which friends are online via Pusher presence channel
  // This also broadcasts the current user's own presence to friends.
  const onlineUserIds = usePresence("presence-dashboard", true);

  // State
  const [deadlineTab, setDeadlineTab] = useState<"today" | "week" | "later" | "overdue">("today");
  const [healthRingOffset, setHealthRingOffset] = useState(251.2);
  const [friendRingOffsets, setFriendRingOffsets] = useState<number[]>([]);

  // Helper to open the AI chat (single instance lives in DashboardNavbar)
  const openAiChat = () => {
    window.dispatchEvent(new CustomEvent("open-ai-chat"));
  };

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

  // Plain project list (design-preview12's .prow rows) — the rich
  // search/filter/tag/bulk-select grid lives on the dedicated /projects page.
  const topProjects = projects.slice(0, 5);

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
        @media (prefers-reduced-motion: reduce) {
          .dash-reveal { opacity: 1; transform: none; transition: none; }
        }
        @media (max-width: 640px) {
          .greet-row { flex-direction: column; align-items: flex-start; gap: 12px; }
          .greet-health { margin-left: 0; }
          .greet-row h1 { font-size: 22px; }
          .deadlines-tabbar { flex-wrap: wrap; }
        }
      `}</style>

      <div ref={revealContainerRef}>

        {/* ═══ 1. Greeting + focus card ("First up") — verbatim file order ═══ */}
        <div className="dash-reveal">
          <HeroSection
            greeting={greeting}
            firstName={firstName}
            healthScore={healthScore}
            dueToday={dueToday}
            overdue={overdue}
            healthRingOffset={healthRingOffset}
            circumference={circumference}
            firstUpTask={firstUpTask}
            inProgressTasks={inProgressTasks}
            awaitingApprovalCount={awaitingApprovalCount}
          />
        </div>

        {/* ═══ 2. Needs attention + Deadlines + Friends — three-column row ═══ */}
        <div className="dash-reveal dash-sect">
          <div className="dash-cols-3">
            <NeedsAttentionPanel items={needsAttention} />
            <DeadlinesPanel
              deadlineTab={deadlineTab}
              setDeadlineTab={setDeadlineTab}
              dueToday={dueToday}
              dueThisWeek={dueThisWeek}
              dueLater={dueLater}
              overdue={overdue}
              deadlineItems={deadlineItems}
            />
            <FriendsPanel workload={workload} friendRingOffsets={friendRingOffsets} smallCircumference={smallCircumference} onlineUserIds={onlineUserIds} />
          </div>
        </div>

        {/* ═══ 3. Projects — verbatim .prow list. Rich search/filter/tags/
           bulk-select live on the dedicated /projects page instead. ═══ */}
        <div className="dash-reveal dash-sect">
          <div className="dash-sect-head">
            <h3>Projects</h3>
            <Link className="more" href="/projects">All projects ›</Link>
          </div>
          <div className="dash-card">
            {topProjects.map((p) => (
              <ProjectRow key={p.id} project={p} />
            ))}
            {topProjects.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--dp-ink-3)" }}>
                <Circle style={{ width: "28px", height: "28px", margin: "0 auto 10px", opacity: 0.4 }} />
                <p style={{ fontSize: "13px" }}>No projects yet</p>
              </div>
            )}
          </div>
        </div>

        {/* ═══ 4. Dependency map — verbatim .map-card ═══ */}
        <div className="dash-reveal dash-sect">
          <DependencyMapPreview maps={dependencyMaps} />
        </div>

      </div>{/* end revealContainerRef */}


    </>
  );
}


// ─── Sub-Components ──────────────────────────────────────────────────────────

function HeroSection({
  greeting,
  firstName,
  healthScore,
  dueToday,
  overdue,
  firstUpTask,
  inProgressTasks,
  awaitingApprovalCount,
}: {
  greeting: string;
  firstName: string;
  healthScore: number;
  dueToday: Array<unknown>;
  overdue: Array<unknown>;
  healthRingOffset: number;
  circumference: number;
  firstUpTask: DashboardContentProps["firstUpTask"];
  inProgressTasks: number;
  awaitingApprovalCount: number;
}) {
  const ringC = 103.7; // 2πr for r=16.5
  return (
    <div style={{ marginBottom: "20px", animation: "fadeSlideUp .5s ease" }}>
      {/* greeting — one quiet line of context */}
      <div className="greet-row">
        <div>
          <h1>{greeting}, {firstName}.</h1>
          <div className="greet-sub">
            <b>{dueToday.length}</b> due today
          </div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <CreateProjectButton />
        </div>
      </div>

      {/* Focus card — "First up": the single loud element, verbatim
          design-preview12 .focus-card. One task, not a generic ledger. */}
      {firstUpTask && (
        <div className="dash-focus-card">
          <div className="ftop">
            <div className="fbody">
              <div className="eyebrow">
                <span className={`dash-g dash-g-${firstUpTask.glyph}`} />
                First up
              </div>
              <h2>{firstUpTask.title}</h2>
              <div className="fmeta num">
                {firstUpTask.dueLabel}
                <span className="sep">·</span>
                {firstUpTask.projectName}
                {firstUpTask.unblocksCount > 0 && (
                  <>
                    <span className="sep">·</span>
                    <b>unblocks {firstUpTask.unblocksCount} task{firstUpTask.unblocksCount === 1 ? "" : "s"}</b>
                  </>
                )}
              </div>
            </div>
            <div className="frow">
              <Link href={`/graph/${firstUpTask.projectId}`} className="dash-btn dash-btn-on-ink">
                Open task
              </Link>
              <Link href={`/graph/${firstUpTask.projectId}`} className="dash-btn dash-btn-ghost-on-ink">
                View in graph
              </Link>
            </div>
          </div>
          <div className="fstats">
            <div className="fstat">
              <b className="num">{dueToday.length}</b>
              <span className="sl"><span className="dash-g dash-g-ready" />Due today</span>
            </div>
            <div className="fstat">
              <b className="num">{inProgressTasks}</b>
              <span className="sl"><span className="dash-g dash-g-prog" />In progress</span>
            </div>
            <div className="fstat">
              <b className="num">{awaitingApprovalCount}</b>
              <span className="sl"><span className="dash-g dash-g-await" />Awaiting approval</span>
            </div>
            {/* Health ring */}
            <div className="fstat" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "10px", flexDirection: "row" }}>
              <svg width="36" height="36" viewBox="0 0 40 40" aria-hidden="true">
                <circle cx="20" cy="20" r="16.5" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                <circle
                  cx="20" cy="20" r="16.5" fill="none"
                  stroke="#ffffff" strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={ringC}
                  strokeDashoffset={ringC * (1 - healthScore / 100)}
                  transform="rotate(-90 20 20)"
                  style={{ transition: "stroke-dashoffset 900ms ease" }}
                />
              </svg>
              <div>
                <b style={{ fontSize: "12px", display: "block" }}>{healthScore >= 70 ? "On track" : "Needs attention"}</b>
                <span className="sl" style={{ marginTop: "1px" }}>{healthScore} of 100</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Project Row (plain design-preview12 .prow list) ─────────────────────────

function ProjectRow({ project }: { project: DashboardContentProps["projects"][number] }) {
  const progress = project.totalTasks > 0 ? Math.round((project.completedTasks / project.totalTasks) * 100) : 0;
  const roleLabel = project.role === "HEAD" ? "Head" : project.role === "CO_HEAD" ? "Co-head" : "Member";
  const roleClass = project.role === "HEAD" ? "dash-role-head" : project.role === "CO_HEAD" ? "dash-role-cohead" : "dash-role-member";
  return (
    <Link href={`/graph/${project.id}`} className="dash-prow">
      <span className="pname">
        <b>{project.name}</b>
        <span>
          {project.visibility === "PRIVATE" ? "Private" : "Team"}
          {project.lastOpenedAt ? ` · ${formatRelativeTime(project.lastOpenedAt).replace(/^Opened /, "updated ")}` : ""}
        </span>
      </span>
      <span className="pprog">
        <span className="pbar"><i style={{ width: `${progress}%` }} /></span>
        <span className="pfrac num"><b>{project.completedTasks}</b> of {project.totalTasks} done</span>
      </span>
      <span className={`dash-role ${roleClass}`}>{roleLabel}</span>
      <span className="chev">›</span>
    </Link>
  );
}

// ─── Needs Attention Panel ───────────────────────────────────────────────────

function NeedsAttentionPanel({ items }: { items: DashboardContentProps["needsAttention"] }) {
  return (
    <div className="dash-card">
      <div className="dash-sect-head" style={{ padding: "16px 20px 0" }}>
        <h3>Needs attention</h3>
        <Link href="/my-tasks" className="more">Show all {items.length} ›</Link>
      </div>
      <div className="dash-rowlist">
        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--dp-ink-3)" }}>
            <CheckCircle2 style={{ width: "28px", height: "28px", margin: "0 auto 10px", opacity: 0.4 }} />
            <p style={{ fontSize: "13px" }}>All clear — nothing needs attention</p>
          </div>
        ) : (
          items.slice(0, 3).map((item) => {
            const awaitingApproval = item.status === "AWAITING_APPROVAL";
            return (
              <Link key={item.id} href={`/graph/${item.projectId}`} className="dash-trow">
                <span className={`dash-g ${item.status === "BLOCKED" ? "dash-g-blocked" : awaitingApproval ? "dash-g-await" : "dash-g-prog"}`} />
                <div className="tbody">
                  <b>{item.title}</b>
                  <span>
                    {item.status === "BLOCKED" ? (
                      "Waiting upstream"
                    ) : awaitingApproval ? (
                      <>Awaiting <em>your</em> approval</>
                    ) : item.daysOverdue && item.daysOverdue > 0 ? (
                      <><em>Overdue</em> — {item.daysOverdue}d</>
                    ) : (
                      item.projectName
                    )}
                  </span>
                </div>
                {awaitingApproval ? (
                  <span className="act">Review</span>
                ) : (
                  <div className="tright">
                    <span className="due hot num">{item.status === "BLOCKED" ? "Waiting" : "Overdue"}</span>
                    <span className="proj">{item.projectName}</span>
                  </div>
                )}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Friends (Team Workload) Panel ───────────────────────────────────────────

function FriendsPanel({
  workload,
  onlineUserIds,
}: {
  workload: DashboardContentProps["workload"];
  friendRingOffsets: number[];
  smallCircumference: number;
  onlineUserIds: Set<string>;
}) {
  return (
    <div className="dash-card" style={{ padding: "26px" }}>
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Friends
        </h3>
        <div style={{ fontSize: "12px", color: "var(--dp-ink-3)", marginTop: "2px" }}>
          Who&apos;s around right now
        </div>
      </div>

      {workload.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: "var(--dp-ink-3)" }}>
          <Circle style={{ width: "28px", height: "28px", margin: "0 auto 10px", opacity: 0.4 }} />
          <p style={{ fontSize: "13px" }}>No team members with active tasks</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {workload.slice(0, 6).map((member) => {
            const maxTotal = Math.max(...workload.map((w) => w.total), 1);
            const healthPct = Math.min(Math.round((member.total / maxTotal) * 100), 100);
            const isOnline = onlineUserIds.has(member.id);
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
                  borderRadius: "var(--dp-r-sm)",
                  transition: "background 140ms var(--dp-ease-out)",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--dp-band)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                {/* Avatar with status dot — verbatim .ava (monochrome; presence
                    avatars are not the banned "letter avatars on the Projects
                    list" — preview12 uses this exact pattern for people) */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "var(--dp-band)",
                      boxShadow: "inset 0 0 0 1px var(--dp-hair-soft)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--dp-ink-2)",
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
                      background: isOnline ? "var(--text-primary)" : "#9ca3af",
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
                        stroke={healthPct < 40 ? "var(--text-primary)" : healthPct <= 75 ? "var(--text-secondary)" : "var(--text-muted)"}
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
                      color: healthPct < 40 ? "var(--text-primary)" : healthPct <= 75 ? "var(--text-secondary)" : "var(--text-muted)",
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
  const tabs: Array<{ id: "today" | "week" | "later" | "overdue"; label: string }> = [
    { id: "overdue", label: "Overdue" },
    { id: "today", label: "Today" },
    { id: "week", label: "This week" },
    { id: "later", label: "Later" },
  ];

  const tabContainerRef = useRef<HTMLDivElement>(null);
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  // Calculate pill position when tab changes
  useEffect(() => {
    if (!tabContainerRef.current) return;
    const activeBtn = tabContainerRef.current.querySelector(`[data-tab-id="${deadlineTab}"]`) as HTMLElement | null;
    if (activeBtn) {
      const containerRect = tabContainerRef.current.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      setPillStyle({
        left: btnRect.left - containerRect.left,
        width: btnRect.width,
      });
    }
  }, [deadlineTab]);

  // Initial measurement
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!tabContainerRef.current) return;
      const activeBtn = tabContainerRef.current.querySelector(`[data-tab-id="${deadlineTab}"]`) as HTMLElement | null;
      if (activeBtn) {
        const containerRect = tabContainerRef.current.getBoundingClientRect();
        const btnRect = activeBtn.getBoundingClientRect();
        setPillStyle({
          left: btnRect.left - containerRect.left,
          width: btnRect.width,
        });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="dash-card">
      <div className="dash-sect-head" style={{ padding: "16px 20px 0" }}>
        <h3>Deadlines</h3>
        <Link href="/calendar" className="more">Calendar ›</Link>
      </div>

      {/* Tab bar — grey container with sliding dark pill */}
      <div style={{ display: "flex", alignItems: "center", padding: "16px 20px 0" }}>
        <div
          ref={tabContainerRef}
          style={{
            position: "relative",
            display: "flex",
            gap: "2px",
            background: "var(--dp-band)",
            borderRadius: "999px",
            padding: "4px",
          }}
        >
          {/* Sliding pill indicator */}
          <div
            style={{
              position: "absolute",
              top: "4px",
              left: `${pillStyle.left}px`,
              width: `${pillStyle.width}px`,
              height: "calc(100% - 8px)",
              borderRadius: "999px",
              background: "var(--dp-ink)",
              transition: "left 300ms cubic-bezier(0.23, 1, 0.32, 1), width 300ms cubic-bezier(0.23, 1, 0.32, 1)",
              zIndex: 0,
            }}
          />
          {tabs.map((tab) => (
            <button
              key={tab.id}
              data-tab-id={tab.id}
              onClick={() => setDeadlineTab(tab.id)}
              style={{
                position: "relative",
                zIndex: 1,
                padding: "7px 16px",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                background: "transparent",
                color: deadlineTab === tab.id ? "var(--dp-bg)" : "var(--text-secondary)",
                transition: "color 200ms ease",
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span style={{ marginLeft: "auto", fontSize: "12px", color: "var(--dp-ink-3)" }} className="num">
          {deadlineItems.length} due
        </span>
      </div>

      {/* Task list */}
      <div className="dash-rowlist" style={{ paddingTop: "10px", minHeight: "120px" }}>
        {deadlineItems.map((item) => (
          <Link key={item.id} href={`/graph/${item.projectId}`} className="dash-trow">
            <span className={`dash-g ${deadlineTab === "overdue" ? "dash-g-rej" : "dash-g-ready"}`} />
            <div className="tbody">
              <b>{item.title}</b>
              <span>{item.projectName}</span>
            </div>
            <div className="tright">
              <span className={`due num${deadlineTab === "overdue" ? " hot" : ""}`}>
                {deadlineTab === "overdue" && (item as { daysOverdue?: number }).daysOverdue !== undefined
                  ? `${(item as { daysOverdue?: number }).daysOverdue}d late`
                  : formatDate(item.dueDate)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
