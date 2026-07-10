"use client";

import { AlertCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { CompletionTrendChart, StatusDonutChart, WorkloadChart, ProgressRing } from "@/components/dashboard-charts";

interface AnalyticsChartsProps {
  statusBreakdown: Array<{ name: string; value: number; color: string }>;
  completionTimeline: Array<{ date: string; count: number }>;
  workload: Array<{ name: string; total: number; completed: number }>;
  overdueTasks: Array<{ id: string; title: string; dueDate: string; projectName: string }>;
  totalTasks: number;
  completedCount: number;
  completionsThisWeek: number;
  weeklyTrendPct: number;
}

function buildInsight({
  weeklyTrendPct,
  completionsThisWeek,
  overdueCount,
}: {
  weeklyTrendPct: number;
  completionsThisWeek: number;
  overdueCount: number;
}): string {
  if (overdueCount > 0) {
    return `${overdueCount} task${overdueCount > 1 ? "s are" : " is"} overdue — clearing ${overdueCount > 1 ? "these" : "it"} first will lift your health score fastest.`;
  }
  if (completionsThisWeek === 0) {
    return "No completions yet this week — trends will appear here once tasks wrap up.";
  }
  if (weeklyTrendPct > 0) {
    return `Completion pace is up ${weeklyTrendPct}% from last week. Nice momentum.`;
  }
  if (weeklyTrendPct < 0) {
    return `Completion pace is down ${Math.abs(weeklyTrendPct)}% from last week.`;
  }
  return "Completion pace is steady with last week.";
}

export function AnalyticsCharts({
  statusBreakdown,
  completionTimeline,
  workload,
  overdueTasks,
  totalTasks,
  completedCount,
  completionsThisWeek,
  weeklyTrendPct,
}: AnalyticsChartsProps) {
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
  const workloadChartData = workload.map((w) => ({ name: w.name, active: w.total - w.completed, completed: w.completed }));
  const insight = buildInsight({ weeklyTrendPct, completionsThisWeek, overdueCount: overdueTasks.length });

  return (
    <div className="space-y-5">
      {/* Insight strip — no container. Lives directly on the background,
          separated from the charts below by a hairline rule and whitespace. */}
      <div className="flex flex-col gap-4 border-b border-themed-subtle pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <StatInline label="Completion rate" value={`${completionRate}%`} />
          <StatInline label="Completed this week" value={completionsThisWeek} trendPct={weeklyTrendPct} />
          <StatInline
            label="Overdue"
            value={overdueTasks.length}
            tone={overdueTasks.length > 0 ? "danger" : undefined}
          />
        </div>
        <p className="max-w-xs text-[13px] leading-relaxed text-body sm:text-right">{insight}</p>
      </div>

      {/* Hero: one focal panel — trend chart + completion radial share the same card
          instead of standing as two equal-weight boxes. */}
      <div className="animate-entrance-1 rounded-3xl border border-themed-subtle bg-card p-5 shadow-themed sm:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline justify-between gap-1">
              <h3 className="text-[15px] font-semibold text-heading">Completions over time</h3>
              <span className="text-meta">Last 30 days</span>
            </div>
            <p className="mb-4 text-[13px] text-body">{completedCount} of {totalTasks} tasks complete</p>
            {completionTimeline.length > 0 ? (
              <CompletionTrendChart data={completionTimeline} />
            ) : (
              <p className="py-16 text-center text-sm text-dim">No completions yet</p>
            )}
          </div>

          <div className="flex flex-col items-center justify-center border-t border-themed-subtle pt-5 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0">
            <span className="text-eyebrow">Completion Rate</span>
            <div className="mt-4">
              <ProgressRing progress={completionRate} size={128} strokeWidth={9} labelSize={26} />
            </div>
            <p className="mt-3 text-meta">{completedCount} of {totalTasks} tasks</p>
          </div>
        </div>
      </div>

      {/* Second row: quieter, border-only supporting panels — not a repeat of the hero's card. */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]">
        <div className="animate-entrance-2 panel-quiet p-5">
          <h3 className="mb-1 text-[13px] font-semibold text-heading">Status breakdown</h3>
          {statusBreakdown.length > 0 ? (
            <StatusDonutChart data={statusBreakdown} totalTasks={totalTasks} />
          ) : (
            <p className="py-16 text-center text-sm text-dim">No tasks yet</p>
          )}
        </div>

        <div className="animate-entrance-3 panel-quiet p-5">
          <h3 className="mb-1 text-[13px] font-semibold text-heading">Workload per person</h3>
          {workload.length > 0 ? (
            <WorkloadChart data={workloadChartData} />
          ) : (
            <p className="py-16 text-center text-sm text-dim">No assignments yet</p>
          )}
        </div>
      </div>

      {/* Overdue — a compact list, not another boxed grid tile */}
      {overdueTasks.length > 0 && (
        <div className="animate-entrance-4 rounded-3xl border border-[var(--danger-soft)] bg-gradient-to-r from-[var(--danger-soft)] to-transparent p-5">
          <div className="mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-[var(--danger)]" />
            <h3 className="text-[14px] font-semibold text-heading">Overdue ({overdueTasks.length})</h3>
          </div>
          <div className="space-y-0.5">
            {overdueTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-[var(--danger-soft)]">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-heading">{task.title}</p>
                  <p className="text-meta">{task.projectName}</p>
                </div>
                <span className="flex-shrink-0 text-[11px] font-medium text-[var(--danger)]">Due {formatDate(task.dueDate)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Insight strip stat ──────────────────────────────────────────────────────

function StatInline({
  label,
  value,
  trendPct,
  tone,
}: {
  label: string;
  value: string | number;
  trendPct?: number;
  tone?: "danger";
}) {
  return (
    <div>
      <p className="text-eyebrow">{label}</p>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className={cnStat(tone, value)}>{value}</span>
        {!!trendPct && (
          <span
            className="flex items-center gap-0.5 text-[11px] font-medium"
            style={{ color: trendPct > 0 ? "var(--accent)" : "var(--danger)" }}
          >
            {trendPct > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trendPct)}%
          </span>
        )}
      </div>
    </div>
  );
}

function cnStat(tone: "danger" | undefined, value: string | number): string {
  const base = "text-[22px] text-stat";
  if (tone === "danger" && Number(value) > 0) return `${base} text-[var(--danger)]`;
  return base;
}
