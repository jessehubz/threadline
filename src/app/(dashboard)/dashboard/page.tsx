import { getProjects } from "@/actions/project-actions";
import { ProjectGrid } from "@/components/project-grid";
import { CreateProjectButton } from "@/components/create-project-button";
import { EmptyState } from "@/components/ui/empty-state";
import { LayoutDashboard, TrendingUp, FolderOpen, Users, CalendarDays, MessageSquare, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage() {
  const projects = await getProjects();

  const totalTasks = projects.reduce((acc, p) => acc + p.totalTasks, 0);
  const completedTasks = projects.reduce((acc, p) => acc + p.completedTasks, 0);
  const totalMembers = projects.reduce((acc, p) => acc + p.memberCount, 0);

  return (
    <div className="mx-auto max-w-6xl">
      {/* Greeting + Quick Actions */}
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1A1A1A]">
            Good to see you
          </h1>
          <p className="mt-1 text-[15px] text-[#6B7280]">
            Here&apos;s what&apos;s happening across your projects
          </p>
        </div>
        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/my-tasks"
            className="inline-flex items-center gap-2 rounded-xl border border-surface-200/80 bg-white px-3.5 py-2 text-[13px] font-medium text-surface-600 shadow-sm transition-all hover:border-surface-300 hover:shadow-md"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            My Tasks
          </Link>
          <Link
            href="/messages"
            className="inline-flex items-center gap-2 rounded-xl border border-surface-200/80 bg-white px-3.5 py-2 text-[13px] font-medium text-surface-600 shadow-sm transition-all hover:border-surface-300 hover:shadow-md"
          >
            <MessageSquare className="h-4 w-4 text-sky-500" />
            Messages
          </Link>
          <Link
            href="/calendar"
            className="inline-flex items-center gap-2 rounded-xl border border-surface-200/80 bg-white px-3.5 py-2 text-[13px] font-medium text-surface-600 shadow-sm transition-all hover:border-surface-300 hover:shadow-md"
          >
            <CalendarDays className="h-4 w-4 text-amber-500" />
            Calendar
          </Link>
        </div>
      </div>

      {/* Stat cards row */}
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Projects"
          value={String(projects.length)}
          icon={<FolderOpen className="h-5 w-5 text-brand-600" />}
          trend="+2 this month"
          trendUp={true}
        />
        <StatCard
          label="Total Tasks"
          value={String(totalTasks)}
          icon={<LayoutDashboard className="h-5 w-5 text-sky-500" />}
          trend={`${completedTasks} done`}
          trendUp={true}
        />
        <StatCard
          label="Completion"
          value={totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}%` : "0%"}
          icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
          trend="+5% vs last week"
          trendUp={true}
        />
        <StatCard
          label="Team Members"
          value={String(totalMembers)}
          icon={<Users className="h-5 w-5 text-amber-500" />}
          trend="Across all projects"
          trendUp={null}
        />
      </div>

      {/* Projects section */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-[#1A1A1A]">Your Projects</h2>
          <p className="mt-0.5 text-sm text-[#6B7280]">Manage and navigate your task graphs</p>
        </div>
        <CreateProjectButton />
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

function StatCard({
  label,
  value,
  icon,
  trend,
  trendUp,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  trendUp: boolean | null;
}) {
  return (
    <div className="rounded-2xl border border-surface-200/60 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-[#1A1A1A]">{value}</p>
      <p className="text-[13px] font-medium text-[#6B7280] mt-0.5">{label}</p>
      <div className="mt-2 flex items-center gap-1">
        {trendUp !== null && (
          <span className={cn("text-[11px] font-semibold", trendUp ? "text-emerald-600" : "text-red-500")}>
            {trendUp ? "↑" : "↓"}
          </span>
        )}
        <span className="text-[11px] text-[#6B7280]">{trend}</span>
      </div>
    </div>
  );
}
