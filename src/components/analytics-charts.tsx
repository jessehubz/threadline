"use client";

import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  type PieLabelRenderProps,
} from "recharts";
import { AlertCircle, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AnalyticsChartsProps {
  statusBreakdown: Array<{ name: string; value: number; color: string }>;
  completionTimeline: Array<{ date: string; count: number }>;
  workload: Array<{ name: string; total: number; completed: number }>;
  overdueTasks: Array<{ id: string; title: string; dueDate: string; projectName: string }>;
  totalTasks: number;
  completedCount: number;
}

export function AnalyticsCharts({
  statusBreakdown,
  completionTimeline,
  workload,
  overdueTasks,
  totalTasks,
  completedCount,
}: AnalyticsChartsProps) {
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<CheckCircle2 className="h-5 w-5 text-green-500" />} label="Completion Rate" value={`${completionRate}%`} />
        <StatCard icon={<TrendingUp className="h-5 w-5 accent-color" />} label="Total Tasks" value={String(totalTasks)} />
        <StatCard icon={<Clock className="h-5 w-5 text-amber-500" />} label="Completed" value={String(completedCount)} />
        <StatCard icon={<AlertCircle className="h-5 w-5 text-red-500" />} label="Overdue" value={String(overdueTasks.length)} />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Completion over time */}
        <div className="rounded-2xl border border-themed-subtle bg-card p-6 shadow-themed">
          <h3 className="mb-5 text-sm font-semibold text-heading">Completions Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={completionTimeline}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#F3F4F6" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#E5E7EB" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(d) => d.slice(5)} />
              <YAxis stroke="#E5E7EB" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2.5} fill="url(#colorCount)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status breakdown */}
        <div className="rounded-2xl border border-themed-subtle bg-card p-6 shadow-themed">
          <h3 className="mb-5 text-sm font-semibold text-heading">Status Breakdown</h3>
          {statusBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusBreakdown} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={(props: PieLabelRenderProps) => `${props.name || ""} ${((props.percent ?? 0) * 100).toFixed(0)}%`}>
                  {statusBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-16 text-center text-sm text-dim">No tasks yet</p>
          )}
        </div>

        {/* Workload */}
        <div className="rounded-2xl border border-themed-subtle bg-card p-6 shadow-themed">
          <h3 className="mb-5 text-sm font-semibold text-heading">Workload per Person</h3>
          {workload.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={workload}>
                <CartesianGrid stroke="#F3F4F6" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#E5E7EB" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis stroke="#E5E7EB" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" stackId="a" fill="#7c3aed" name="Completed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total" stackId="a" fill="#EDE9FE" name="Remaining" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-16 text-center text-sm text-dim">No assignments yet</p>
          )}
        </div>

        {/* Overdue tasks */}
        <div className="rounded-2xl border border-themed-subtle bg-card p-6 shadow-themed">
          <h3 className="mb-5 text-sm font-semibold text-heading">Overdue Tasks</h3>
          {overdueTasks.length > 0 ? (
            <div className="max-h-[250px] space-y-2 overflow-y-auto">
              {overdueTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50/50 px-4 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-heading">{task.title}</p>
                    <p className="text-xs text-body">{task.projectName}</p>
                  </div>
                  <span className="text-xs font-medium text-red-600">Due {formatDate(task.dueDate)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-dim">No overdue tasks</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-themed-subtle bg-card p-5 shadow-themed transition-shadow hover:shadow-themed-md">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl accent-bg">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-heading">{value}</p>
        <p className="text-xs font-medium text-body">{label}</p>
      </div>
    </div>
  );
}
