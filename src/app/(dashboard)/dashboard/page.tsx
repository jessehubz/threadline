import { getProjects } from "@/actions/project-actions";
import { ProjectGrid } from "@/components/project-grid";
import { CreateProjectButton } from "@/components/create-project-button";
import { EmptyState } from "@/components/ui/empty-state";
import { LayoutDashboard, TrendingUp, FolderOpen, UsersRound, CheckCircle2, Clock, MessageSquare, CalendarDays, ArrowUpRight } from "lucide-react";
import { getTeams } from "@/actions/team-group-actions";
import Link from "next/link";

export default async function DashboardPage() {
  const projects = await getProjects();
  const teams = await getTeams();

  const totalTasks = projects.reduce((acc, p) => acc + p.totalTasks, 0);
  const completedTasks = projects.reduce((acc, p) => acc + p.completedTasks, 0);
  const totalMembers = projects.reduce((acc, p) => acc + p.memberCount, 0);
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const inProgressTasks = totalTasks - completedTasks;

  return (
    <div className="mx-auto max-w-6xl">
      {/* Page header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-[#1A1A1A]">Dashboard</h1>
          <p className="mt-0.5 text-[13px] text-[#6B7280]">Your workspace at a glance</p>
        </div>
        <CreateProjectButton />
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-surface-200/60 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <FolderOpen className="h-4 w-4 text-brand-500" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">Projects</span>
          </div>
          <p className="text-[28px] font-bold text-[#1A1A1A]">{projects.length}</p>
        </div>
        <div className="rounded-2xl border border-surface-200/60 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">Completed</span>
          </div>
          <p className="text-[28px] font-bold text-[#1A1A1A]">{completedTasks}</p>
          <p className="text-[11px] text-emerald-600 mt-0.5">of {totalTasks} tasks</p>
        </div>
        <div className="rounded-2xl border border-surface-200/60 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">In Progress</span>
          </div>
          <p className="text-[28px] font-bold text-[#1A1A1A]">{inProgressTasks}</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-surface-100">
            <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${completionRate}%` }} />
          </div>
        </div>
        <div className="rounded-2xl border border-surface-200/60 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <UsersRound className="h-4 w-4 text-brand-500" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">Teams</span>
          </div>
          <p className="text-[28px] font-bold text-[#1A1A1A]">{teams.length}</p>
          <p className="text-[11px] text-[#6B7280] mt-0.5">{totalMembers} members</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link href="/my-tasks" className="group flex items-center justify-between rounded-xl border border-surface-200/60 bg-white px-4 py-3 shadow-sm transition-all hover:border-brand-200 hover:shadow-md">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-[13px] font-medium text-[#1A1A1A]">My Tasks</span>
          </div>
          <ArrowUpRight className="h-3.5 w-3.5 text-surface-300 group-hover:text-brand-500" />
        </Link>
        <Link href="/messages" className="group flex items-center justify-between rounded-xl border border-surface-200/60 bg-white px-4 py-3 shadow-sm transition-all hover:border-brand-200 hover:shadow-md">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-4 w-4 text-brand-500" />
            <span className="text-[13px] font-medium text-[#1A1A1A]">Messages</span>
          </div>
          <ArrowUpRight className="h-3.5 w-3.5 text-surface-300 group-hover:text-brand-500" />
        </Link>
        <Link href="/calendar" className="group flex items-center justify-between rounded-xl border border-surface-200/60 bg-white px-4 py-3 shadow-sm transition-all hover:border-brand-200 hover:shadow-md">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-4 w-4 text-amber-500" />
            <span className="text-[13px] font-medium text-[#1A1A1A]">Calendar</span>
          </div>
          <ArrowUpRight className="h-3.5 w-3.5 text-surface-300 group-hover:text-brand-500" />
        </Link>
      </div>

      {/* Projects */}
      <div className="mb-4">
        <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Projects</h2>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={<LayoutDashboard className="h-8 w-8" />}
          title="No projects yet"
          description="Create your first project to start organizing tasks as dependency graphs."
          action={<CreateProjectButton />}
        />
      ) : (
        <ProjectGrid projects={projects} />
      )}
    </div>
  );
}
