"use client";

import {
  LineChart,
  Line,
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
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<CheckCircle2 className="h-5 w-5 text-green-500" />} label="Completion Rate" value={`${completionRate}%`} />
        <StatCard icon={<TrendingUp className="h-5 w-5 text-blue-500" />} label="Total Tasks" value={String(totalTasks)} />
        <StatCard icon={<Clock className="h-5 w-5 text-amber-500" />} label="Completed" value={String(completedCount)} />
        <StatCard icon={<AlertCircle className="h-5 w-5 text-red-500" />} label="Overdue" value={String(overdueTasks.length)} />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Completion over time */}
        <div className="card">
          <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Completions Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={completionTimeline}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status breakdown */}
        <div className="card">
          <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Status Breakdown</h3>
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
            <p className="py-16 text-center text-sm text-gray-500">No tasks yet</p>
          )}
        </div>

        {/* Workload */}
        <div className="card">
          <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Workload per Person</h3>
          {workload.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={workload}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" stackId="a" fill="#22c55e" name="Completed" />
                <Bar dataKey="total" stackId="a" fill="#e5e7eb" name="Remaining" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-16 text-center text-sm text-gray-500">No assignments yet</p>
          )}
        </div>

        {/* Overdue tasks */}
        <div className="card">
          <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Overdue Tasks</h3>
          {overdueTasks.length > 0 ? (
            <div className="max-h-[250px] space-y-2 overflow-y-auto">
              {overdueTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50 px-3 py-2 dark:border-red-900 dark:bg-red-950">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</p>
                    <p className="text-xs text-gray-500">{task.projectName}</p>
                  </div>
                  <span className="text-xs text-red-600">Due {formatDate(task.dueDate)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-gray-500">No overdue tasks 🎉</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="card flex items-center gap-3">
      {icon}
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}
