"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Clock,
  Circle,
  ChevronDown,
  Pencil,
  X,
  UserPlus,
  Trash2,
  Users,
  Globe,
  Lock,
  CheckSquare,
  Square,
} from "lucide-react";
import { CreateProjectButton } from "@/components/create-project-button";
import { TagChip } from "@/components/ui/tag-chip";
import { TagScrollContainer } from "@/components/ui/tag-scroll-container";
import { ProjectTagManager } from "@/components/project-tag-manager";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { updateProject, deleteProject, bulkDeleteProjects } from "@/actions/project-actions";
import { updateProjectVisibility } from "@/actions/project-permission-actions";
import { getProjectMembers } from "@/actions/assignment-actions";
import { removeMember } from "@/actions/team-actions";
import { getFriends, addFriendToProject } from "@/actions/friend-actions";
import { getTeams } from "@/actions/team-group-actions";
import { formatRelativeTime } from "@/lib/utils";

export interface GridProject {
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
}

export type GridTag = { id: string; name: string; color: string; isSystem: boolean };

/**
 * The rich project grid — search, status/tag filter pills, bulk-select +
 * delete, per-card tag manager. Lives on the dedicated /projects page;
 * the dashboard itself only shows the plain design-preview12 `.prow` list.
 */
export function ProjectsGridSection({ projects, availableTags }: { projects: GridProject[]; availableTags: GridTag[] }) {
  const router = useRouter();

  const [projectTab, setProjectTab] = useState("all");
  const [projectSearch, setProjectSearch] = useState("");
  const [showAllProjects, setShowAllProjects] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    variant: "danger" | "default";
    onConfirm: () => void;
  }>({ open: false, title: "", description: "", confirmLabel: "", variant: "default", onConfirm: () => {} });

  const [selectMode, setSelectMode] = useState(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const toggleSelectMode = () => {
    if (selectMode) setSelectedProjectIds(new Set());
    setSelectMode(!selectMode);
  };

  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  };

  const handleBulkDelete = () => {
    if (selectedProjectIds.size === 0) return;
    setConfirmDialog({
      open: true,
      title: `Delete ${selectedProjectIds.size} project${selectedProjectIds.size !== 1 ? "s" : ""}?`,
      description: `${selectedProjectIds.size} project${selectedProjectIds.size !== 1 ? "s" : ""} will be moved to Recently Deleted. You can restore them from the Trash page within 15 days.`,
      confirmLabel: `Delete (${selectedProjectIds.size})`,
      variant: "danger",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        setBulkDeleting(true);
        const result = await bulkDeleteProjects(Array.from(selectedProjectIds));
        setBulkDeleting(false);
        if (result && "error" in result) {
          setConfirmDialog({
            open: true,
            title: "Error",
            description: result.error as string,
            confirmLabel: "OK",
            variant: "default",
            onConfirm: () => setConfirmDialog((p) => ({ ...p, open: false })),
          });
          return;
        }
        setSelectedProjectIds(new Set());
        setSelectMode(false);
        router.refresh();
      },
    });
  };

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

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
      p.tags.some((t) => t.name.toLowerCase().includes(projectSearch.toLowerCase()));
    if (!matchesSearch) return false;
    if (projectTab === "all") return true;
    if (projectTab === "ongoing") return p.completedTasks > 0 && p.completedTasks < p.totalTasks;
    if (projectTab === "not_started") return p.completedTasks === 0 && p.totalTasks > 0;
    if (projectTab === "draft") return p.totalTasks === 0;
    if (projectTab.startsWith("tag:")) {
      const tagId = projectTab.slice(4);
      return p.tags.some((t) => t.id === tagId);
    }
    return true;
  });

  const visibleProjects = showAllProjects ? filteredProjects : filteredProjects.slice(0, 8);

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .my-projects-section { margin-bottom: 20px; }
        .my-projects-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 20px; gap: 16px; flex-wrap: wrap;
        }
        .my-projects-title { font-size: 22px; font-weight: 600; letter-spacing: -0.015em; color: var(--text-primary); margin-bottom: 4px; }
        .my-projects-subtitle { font-size: 13px; color: var(--text-secondary); }
        .my-projects-header__right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
        .my-projects-search {
          display: flex; align-items: center; gap: 8px; background: var(--dp-band);
          border: 1px solid transparent; border-radius: var(--dp-r-md); padding: 8px 16px;
          min-width: 350px; transition: box-shadow 160ms var(--dp-ease-out), background 160ms var(--dp-ease-out);
        }
        .my-projects-search:focus-within { background: var(--dp-card); box-shadow: 0 0 0 1.5px var(--dp-ink); }
        .my-projects-search__icon { width: 14px; height: 14px; color: var(--text-muted); flex-shrink: 0; }
        .my-projects-search__input { background: transparent; border: none; outline: none; font-size: 13px; color: var(--text-primary); width: 100%; font-family: inherit; }
        .my-projects-search__input::placeholder { color: var(--text-muted); }
        .my-projects-filter-bar {
          position: relative; display: inline-flex; align-items: center; gap: 2px;
          background: var(--dp-card); border: 0.5px solid var(--dp-hair-soft); border-radius: var(--dp-r-md);
          padding: 4px; box-shadow: var(--dp-shadow-1); margin-bottom: 24px; flex-wrap: nowrap; max-width: 100%; overflow: visible;
        }
        .my-projects-pill-indicator {
          position: absolute; top: 4px; bottom: 4px; left: 0; width: 0;
          background: var(--dp-ink); border-radius: var(--dp-pill); z-index: 0; pointer-events: none;
        }
        .my-projects-tab {
          position: relative; z-index: 1; padding: 8px 16px; border-radius: 999px; font-size: 13px; font-weight: 600;
          color: var(--text-secondary); background: transparent; border: none; cursor: pointer; white-space: nowrap;
          flex-shrink: 0; transition: color .18s ease; outline: none;
        }
        .my-projects-tab:hover { color: var(--text-primary); }
        .my-projects-tab:focus-visible { box-shadow: 0 0 0 1.5px var(--dp-ink); border-radius: 999px; }
        .my-projects-tab--active { color: var(--dp-bg); }
        .my-projects-tab--active:hover { color: var(--dp-bg); }
        .my-projects-tab-divider { width: 1px; height: 20px; background: var(--dp-hair-soft); margin: 0 4px; flex-shrink: 0; }
        .my-projects-tag-row-wrap { position: relative; display: flex; align-items: center; min-width: 0; flex: 1; overflow: hidden; }
        .my-projects-tag-row { display: flex; align-items: center; gap: 2px; overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch; padding: 0 4px; }
        .my-projects-tag-row::-webkit-scrollbar { display: none; }
        .my-projects-tag-fade { position: absolute; top: 0; bottom: 0; width: 32px; pointer-events: none; z-index: 2; }
        .my-projects-tag-fade--left { left: 0; background: linear-gradient(to right, var(--bg-elevated), transparent); }
        .my-projects-tag-fade--right { right: 0; background: linear-gradient(to left, var(--bg-elevated), transparent); }
        .my-projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .my-projects-card-entrance { animation: fadeInUp 0.35s ease-out both; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .my-projects-card-entrance--0 { animation-delay: 0ms; }
        .my-projects-card-entrance--1 { animation-delay: 50ms; }
        .my-projects-card-entrance--2 { animation-delay: 100ms; }
        .my-projects-card-entrance--3 { animation-delay: 150ms; }
        .my-projects-card-entrance--4 { animation-delay: 200ms; }
        .my-projects-card-entrance--5 { animation-delay: 250ms; }
        .my-projects-card-entrance--6 { animation-delay: 300ms; }
        .my-projects-card-entrance--7 { animation-delay: 350ms; }
        .my-projects-empty { text-align: center; padding: 48px 20px; color: var(--text-muted); font-size: 14px; }
        .my-projects-show-all {
          display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; margin-top: 20px;
          padding: 12px 24px; border-radius: var(--dp-r-md); border: 0.5px solid var(--dp-hair-soft); background: var(--dp-card);
          color: var(--dp-ink-2); font-size: 13px; font-weight: 600; cursor: pointer;
          transition: background-color 140ms var(--dp-ease-out), color 140ms var(--dp-ease-out); outline: none;
        }
        .my-projects-show-all:hover { color: var(--dp-ink); background: var(--dp-band); }
        .my-projects-show-all:focus-visible { box-shadow: 0 0 0 1.5px var(--dp-ink); }
        .my-projects-show-all__chevron { width: 14px; height: 14px; transition: transform .25s ease; }
        .my-projects-show-all--expanded .my-projects-show-all__chevron { transform: rotate(180deg); }
        @media (prefers-reduced-motion: reduce) {
          .my-projects-card-entrance, .my-projects-card-entrance--0, .my-projects-card-entrance--1,
          .my-projects-card-entrance--2, .my-projects-card-entrance--3, .my-projects-card-entrance--4,
          .my-projects-card-entrance--5, .my-projects-card-entrance--6, .my-projects-card-entrance--7 { animation: none !important; }
          .my-projects-pill-indicator { transition: none !important; }
          .my-projects-show-all__chevron { transition: none !important; }
        }
        @media (max-width: 1100px) { .my-projects-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 900px) { .my-projects-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 640px) {
          .my-projects-grid { grid-template-columns: 1fr !important; }
          .my-projects-header { flex-direction: column !important; align-items: stretch !important; }
          .my-projects-header__right { flex-direction: column !important; width: 100% !important; }
          .my-projects-search { min-width: 0 !important; width: 100% !important; }
          .my-projects-filter-bar { flex-wrap: wrap !important; border-radius: var(--dp-r-sm) !important; }
          .my-projects-show-all { border-radius: var(--dp-r-sm) !important; }
        }
      `}</style>

      <ProjectsSectionBody
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
        selectMode={selectMode}
        toggleSelectMode={toggleSelectMode}
        selectedProjectIds={selectedProjectIds}
        toggleProjectSelection={toggleProjectSelection}
        handleBulkDelete={handleBulkDelete}
        bulkDeleting={bulkDeleting}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel={confirmDialog.confirmLabel}
        destructive={confirmDialog.variant === "danger"}
        onConfirm={confirmDialog.onConfirm}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
      />
    </>
  );
}

// ─── Section body ────────────────────────────────────────────────────────────

function ProjectsSectionBody({
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
  selectMode,
  toggleSelectMode,
  selectedProjectIds,
  toggleProjectSelection,
  handleBulkDelete,
  bulkDeleting,
}: {
  projects: GridProject[];
  visibleProjects: GridProject[];
  projectTab: string;
  setProjectTab: (t: string) => void;
  projectSearch: string;
  setProjectSearch: (s: string) => void;
  showAllProjects: boolean;
  setShowAllProjects: (b: boolean) => void;
  availableTags: GridTag[];
  onDeleteProject: (projectId: string, e: React.MouseEvent) => void;
  selectMode: boolean;
  toggleSelectMode: () => void;
  selectedProjectIds: Set<string>;
  toggleProjectSelection: (id: string) => void;
  handleBulkDelete: () => void;
  bulkDeleting: boolean;
}) {
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

  const tabBarRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const tagRowRef = useRef<HTMLDivElement>(null);
  const [tagFadeLeft, setTagFadeLeft] = useState(false);
  const [tagFadeRight, setTagFadeRight] = useState(false);

  const prefersReducedMotion = useRef(false);
  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

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

  const [seenProjectIds, setSeenProjectIds] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setSeenProjectIds((prev) => {
        let changed = false;
        const next = new Set(prev);
        for (const project of visibleProjects) {
          if (!next.has(project.id)) {
            next.add(project.id);
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [visibleProjects]);

  const needsAttentionCount = projects.filter(
    (p) => p.totalTasks === 0 || (p.completedTasks === 0 && p.totalTasks > 0)
  ).length;

  return (
    <section data-testid="projects-section-v2" className="my-projects-section">
      <div className="my-projects-header">
        <div className="my-projects-header__left">
          <h2 className="my-projects-title">My Projects</h2>
          <p className="my-projects-subtitle">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
            {needsAttentionCount > 0 && ` · ${needsAttentionCount} need your attention`}
          </p>
        </div>
        <div className="my-projects-header__right">
          <button
            onClick={toggleSelectMode}
            title={selectMode ? "Exit select mode" : "Select projects"}
            aria-label={selectMode ? "Exit select mode" : "Select projects"}
            aria-pressed={selectMode}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "var(--dp-r-sm)",
              border: selectMode ? "1px solid var(--dp-ink)" : "0.5px solid var(--dp-hair-soft)",
              background: selectMode ? "var(--dp-ink)" : "var(--dp-card)",
              color: selectMode ? "var(--dp-bg)" : "var(--dp-ink-2)",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "background-color 140ms ease, color 140ms ease, border-color 140ms ease",
              flexShrink: 0,
            }}
          >
            <CheckSquare style={{ width: "14px", height: "14px" }} />
            {selectMode ? "Cancel" : "Select"}
          </button>
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

      <div className="my-projects-filter-bar" ref={tabBarRef} role="tablist" aria-label="Filter projects by status">
        <div className="my-projects-pill-indicator" ref={pillRef} aria-hidden="true" />

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

      <div className="my-projects-grid" id="projects-grid">
        {visibleProjects.map((project, idx) => {
          const isNew = !seenProjectIds.has(project.id);
          const isSelected = selectedProjectIds.has(project.id);
          const canDelete = project.role === "HEAD";
          return (
            <div
              key={project.id}
              className={isNew ? `my-projects-card-entrance my-projects-card-entrance--${Math.min(idx, 7)}` : ""}
              style={{ position: "relative", borderRadius: "var(--dp-r-lg)" }}
            >
              {selectMode && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (canDelete) toggleProjectSelection(project.id);
                  }}
                  disabled={!canDelete}
                  title={canDelete ? (isSelected ? "Deselect project" : "Select project") : "Only owners can delete projects"}
                  aria-label={canDelete ? (isSelected ? `Deselect ${project.name}` : `Select ${project.name}`) : `Cannot delete ${project.name} — not owner`}
                  style={{
                    position: "absolute", top: "12px", left: "12px", zIndex: 10,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: "28px", height: "28px", borderRadius: "6px", border: "none",
                    background: isSelected ? "var(--dp-ink)" : "var(--dp-card)",
                    color: isSelected ? "var(--dp-bg)" : "var(--dp-ink-3)",
                    cursor: canDelete ? "pointer" : "not-allowed",
                    opacity: canDelete ? 1 : 0.4,
                    boxShadow: "var(--dp-shadow-1)",
                    transition: "background .15s ease, color .15s ease, transform .15s ease",
                  }}
                >
                  {isSelected ? (
                    <CheckSquare style={{ width: "16px", height: "16px" }} />
                  ) : (
                    <Square style={{ width: "16px", height: "16px" }} />
                  )}
                </button>
              )}
              <div
                style={{
                  outline: selectMode && isSelected ? "2px solid var(--dp-ink)" : "none",
                  outlineOffset: "-1px",
                  borderRadius: "var(--dp-r-lg)",
                  transition: "outline .15s ease",
                }}
              >
                <ProjectCard project={project} availableTags={availableTags} onDeleteProject={onDeleteProject} />
              </div>
            </div>
          );
        })}
      </div>

      {visibleProjects.length === 0 && (
        <div className="my-projects-empty">
          <Circle style={{ width: "32px", height: "32px", margin: "0 auto 12px", opacity: 0.4 }} />
          <p>No projects match your filter</p>
        </div>
      )}

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

      {selectMode && selectedProjectIds.size > 0 && (
        <div
          style={{
            position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)", zIndex: 1000,
            display: "flex", alignItems: "center", gap: "12px", padding: "12px 20px",
            borderRadius: "var(--dp-r-lg)", background: "var(--dp-card)", border: "0.5px solid var(--dp-hair-soft)",
            boxShadow: "var(--dp-shadow-2)", animation: "fadeSlideUp .25s ease",
          }}
        >
          <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>
            {selectedProjectIds.size} selected
          </span>
          <button
            onClick={handleBulkDelete}
            disabled={bulkDeleting}
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px",
              borderRadius: "var(--dp-r-sm)", border: "none", background: "var(--danger)", color: "var(--dp-bg)",
              fontSize: "13px", fontWeight: 600, cursor: bulkDeleting ? "not-allowed" : "pointer",
              opacity: bulkDeleting ? 0.7 : 1, transition: "opacity .15s ease",
            }}
          >
            <Trash2 style={{ width: "14px", height: "14px" }} />
            {bulkDeleting ? "Deleting..." : `Delete (${selectedProjectIds.size})`}
          </button>
          <button
            onClick={toggleSelectMode}
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px",
              borderRadius: "6px", border: "none", background: "transparent", color: "var(--dp-ink-3)", cursor: "pointer",
              transition: "background .15s ease, color .15s ease",
            }}
            title="Cancel selection"
            aria-label="Cancel selection"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--dp-band)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            <X style={{ width: "14px", height: "14px" }} />
          </button>
        </div>
      )}
    </section>
  );
}

// ─── Project Card ────────────────────────────────────────────────────────────

function ProjectCard({ project, availableTags, onDeleteProject }: { project: GridProject; availableTags: GridTag[]; onDeleteProject: (projectId: string, e: React.MouseEvent) => void }) {
  const progress = project.totalTasks > 0 ? Math.round((project.completedTasks / project.totalTasks) * 100) : 0;
  const statusLabel = project.totalTasks === 0 ? "Draft" : project.completedTasks === project.totalTasks ? "Complete" : progress > 0 ? "Ongoing" : "Not Started";

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => { window.location.href = `/graph/${project.id}`; }}
      onKeyDown={(e) => { if (e.key === "Enter") window.location.href = `/graph/${project.id}`; }}
      className="transition-transform duration-150 active:scale-[0.98]"
      style={{ textDecoration: "none", cursor: "pointer" }}
    >
      <div
        style={{
          background: "var(--dp-card)",
          boxShadow: "inset 0 0 0 1px var(--dp-hair), var(--dp-shadow-1)",
          borderRadius: "var(--dp-r-lg)",
          padding: "26px",
          transition: "transform 160ms var(--dp-ease-out), box-shadow 160ms var(--dp-ease-out)",
          cursor: "pointer",
          height: "100%",
          position: "relative",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.transform = "translateY(-1px)";
          el.style.boxShadow = "inset 0 0 0 1px var(--dp-ink-3), var(--dp-shadow-2)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.transform = "translateY(0)";
          el.style.boxShadow = "inset 0 0 0 1px var(--dp-hair), var(--dp-shadow-1)";
        }}
      >
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
              display: "inline-flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px",
              borderRadius: "6px", border: "none", background: "transparent", color: "var(--text-muted)", cursor: "pointer",
              transition: "background .15s ease, color .15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.08)";
              e.currentTarget.style.color = "var(--danger)";
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

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "flex-start", gap: "6px", marginBottom: "14px", flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: "10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em",
              padding: "3px 8px", borderRadius: "999px",
              background: statusLabel === "Ongoing" ? "var(--accent-soft)" : "var(--bg-muted)",
              color: statusLabel === "Ongoing" ? "var(--accent)" : statusLabel === "Complete" ? "var(--accent)" : "var(--text-muted)",
            }}
          >
            {statusLabel}
          </span>
          <VisibilityToggle projectId={project.id} visibility={project.visibility} />
          <span
            style={{
              fontSize: "10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em",
              padding: "3px 8px", borderRadius: "999px",
              background: project.role === "HEAD" ? "rgba(139,92,246,0.1)" : project.role === "CO_HEAD" ? "rgba(59,130,246,0.1)" : "var(--bg-muted)",
              color: project.role === "HEAD" ? "var(--text-primary)" : project.role === "CO_HEAD" ? "var(--text-secondary)" : "var(--text-muted)",
            }}
          >
            {project.role === "HEAD" ? "Head" : project.role === "CO_HEAD" ? "Co-Head" : "Member"}
          </span>
        </div>

        <h3 style={{ fontSize: "17px", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--text-primary)", marginBottom: "6px" }}>
          {project.name}
        </h3>

        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
          {project.totalTasks} tasks · {project.memberCount} member{project.memberCount !== 1 ? "s" : ""}
        </p>

        <div style={{ marginBottom: "16px" }}>
          <div style={{ height: "4px", borderRadius: "2px", background: "var(--bg-muted)", overflow: "hidden" }}>
            <div
              style={{
                height: "100%", width: `${progress}%`, borderRadius: "2px", background: "var(--accent)", transition: "width .6s ease",
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "14px", minHeight: "26px" }}>
          {project.tags.length > 0 && (
            <TagScrollContainer>
              {project.tags.map((tag) => (
                <TagChip key={tag.id} name={tag.name} color={tag.color} isSystem={tag.isSystem} />
              ))}
            </TagScrollContainer>
          )}
        </div>

        <div style={{ height: "1px", background: "var(--border-subtle)", marginBottom: "14px" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "var(--text-muted)" }}>
            <Clock style={{ width: "12px", height: "12px" }} />
            {project.lastOpenedAt ? formatRelativeTime(project.lastOpenedAt) : `${project.completedTasks}/${project.totalTasks} complete`}
          </span>
          <span
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px",
              borderRadius: "50%", background: "transparent", color: "var(--text-muted)",
              transition: "background .15s ease, color .15s ease, transform .15s ease", cursor: "pointer",
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

// ─── Visibility Toggle ───────────────────────────────────────────────────────

function VisibilityToggle({ projectId, visibility }: { projectId: string; visibility: "PUBLIC" | "PRIVATE" }) {
  const [currentVisibility, setCurrentVisibility] = useState(visibility);
  const [toggling, setToggling] = useState(false);

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (toggling) return;
    setToggling(true);
    const newVisibility = currentVisibility === "PUBLIC" ? "PRIVATE" : "PUBLIC";
    const result = await updateProjectVisibility(projectId, newVisibility);
    if (!result.error) {
      setCurrentVisibility(newVisibility);
    }
    setToggling(false);
  }

  const isPublic = currentVisibility === "PUBLIC";

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={toggling}
      title={isPublic ? "Public — click to make private" : "Private — click to make public"}
      aria-label={isPublic ? "Public project, click to make private" : "Private project, click to make public"}
      style={{
        display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "10px", fontWeight: 500,
        textTransform: "uppercase", letterSpacing: "0.05em", padding: "3px 8px", borderRadius: "999px",
        background: isPublic ? "rgba(34,197,94,0.1)" : "var(--bg-muted)",
        color: isPublic ? "rgb(34,197,94)" : "var(--text-muted)",
        border: "none", cursor: toggling ? "wait" : "pointer", opacity: toggling ? 0.6 : 1,
        transition: "opacity .15s ease, background .15s ease, color .15s ease",
      }}
    >
      {isPublic ? <Globe style={{ width: "10px", height: "10px" }} /> : <Lock style={{ width: "10px", height: "10px" }} />}
      {isPublic ? "Public" : "Private"}
    </button>
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
          display: "inline-flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px",
          borderRadius: "6px", border: "none", background: "transparent", color: "var(--text-muted)", cursor: "pointer",
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
            position: "fixed", inset: 0, zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.5)", border: "none", padding: 0, width: "100vw", height: "100vh",
            maxWidth: "100vw", maxHeight: "100vh",
          }}
        >
          <div
            style={{
              background: "var(--dp-card)", boxShadow: "inset 0 0 0 0.5px var(--dp-hair), var(--dp-shadow-2)",
              borderRadius: "var(--dp-r-lg)", padding: "28px", width: "100%", maxWidth: "440px", maxHeight: "80vh", overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Edit Project</h3>
              <button
                onClick={() => setOpen(false)}
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px",
                  borderRadius: "6px", border: "none", background: "transparent", color: "var(--text-muted)", cursor: "pointer",
                }}
                aria-label="Close"
              >
                <X style={{ width: "16px", height: "16px" }} />
              </button>
            </div>

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
                  width: "100%", padding: "10px 12px", fontSize: "14px", borderRadius: "8px",
                  border: "1px solid var(--border-default)", background: "var(--bg-primary)", color: "var(--text-primary)",
                  outline: "none", transition: "border-color .15s ease", boxSizing: "border-box",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-default)"; }}
              />
              {error && <p style={{ fontSize: "12px", color: "var(--error)", marginTop: "6px" }}>{error}</p>}
            </div>

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
                        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px",
                        borderRadius: "8px", background: "var(--bg-muted)", fontSize: "13px",
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
                          fontSize: "10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em",
                          padding: "2px 6px", borderRadius: "4px",
                          background: member.role === "HEAD" ? "var(--accent-soft)" : "transparent",
                          color: member.role === "HEAD" ? "var(--accent)" : "var(--text-muted)",
                        }}>
                          {member.role === "HEAD" ? "Owner" : member.role === "CO_HEAD" ? "Admin" : "Member"}
                        </span>
                        {member.role !== "HEAD" && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            title="Remove member"
                            style={{
                              display: "inline-flex", alignItems: "center", justifyContent: "center", width: "22px", height: "22px",
                              borderRadius: "4px", border: "none", background: "transparent", color: "var(--text-muted)",
                              cursor: "pointer", transition: "color .15s ease, background .15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = "var(--danger)";
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

              <div style={{ marginTop: "4px" }}>
                <div style={{ display: "flex", gap: "4px", marginBottom: "10px" }}>
                  <button
                    onClick={() => setTab("friends")}
                    style={{
                      padding: "5px 12px", fontSize: "12px", fontWeight: 600, borderRadius: "6px",
                      border: "1px solid " + (tab === "friends" ? "var(--accent)" : "var(--border-default)"),
                      background: tab === "friends" ? "var(--accent-soft)" : "transparent",
                      color: tab === "friends" ? "var(--accent)" : "var(--text-secondary)",
                      cursor: "pointer", transition: "all .15s ease",
                    }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <UserPlus style={{ width: "12px", height: "12px" }} /> Friends
                    </span>
                  </button>
                  <button
                    onClick={() => setTab("teams")}
                    style={{
                      padding: "5px 12px", fontSize: "12px", fontWeight: 600, borderRadius: "6px",
                      border: "1px solid " + (tab === "teams" ? "var(--accent)" : "var(--border-default)"),
                      background: tab === "teams" ? "var(--accent-soft)" : "transparent",
                      color: tab === "teams" ? "var(--accent)" : "var(--text-secondary)",
                      cursor: "pointer", transition: "all .15s ease",
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
                            display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px",
                            borderRadius: "6px", border: "1px solid var(--border-default)", fontSize: "13px",
                          }}
                        >
                          <span style={{ color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {friend.name || friend.email}
                          </span>
                          <button
                            onClick={() => handleAddFriend(friend.friendId)}
                            style={{
                              padding: "3px 8px", fontSize: "11px", fontWeight: 600, borderRadius: "4px", border: "none",
                              background: "var(--accent)", color: "var(--on-accent)", cursor: "pointer", flexShrink: 0,
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
                            display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px",
                            borderRadius: "6px", border: "1px solid var(--border-default)", fontSize: "13px",
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
                              padding: "3px 8px", fontSize: "11px", fontWeight: 600, borderRadius: "4px", border: "none",
                              background: "var(--accent)", color: "var(--on-accent)", cursor: "pointer", flexShrink: 0,
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
              {addError && <p style={{ fontSize: "12px", color: "var(--danger)", marginTop: "6px" }}>{addError}</p>}
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                width: "100%", padding: "10px 16px", fontSize: "14px", fontWeight: 600, borderRadius: "8px", border: "none",
                background: "var(--accent)", color: "var(--on-accent)", cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1, transition: "opacity .15s ease",
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
