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
} from "recharts";

// ─── Shared tooltip style ────────────────────────────────────────────────────

const tooltipContentStyle = {
  backgroundColor: "var(--bg-elevated)",
  border: "1px solid var(--border-default)",
  borderRadius: "12px",
  fontSize: "12px",
  boxShadow: "var(--shadow-md)",
  color: "var(--text-primary)",
};

// ─── 1. HealthGauge ──────────────────────────────────────────────────────────

interface HealthGaugeProps {
  score: number;
}

export function HealthGauge({ score }: HealthGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const color =
    clampedScore >= 80 ? "var(--accent)" : clampedScore >= 50 ? "var(--text-secondary)" : "var(--danger)";

  // Semicircle arc parameters
  const cx = 70;
  const cy = 80;
  const r = 55;
  const startAngle = Math.PI; // 180 degrees (left)
  const endAngle = 0; // 0 degrees (right)

  // Arc path (semicircle from left to right)
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy - r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy - r * Math.sin(endAngle);

  const arcPath = `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;

  // Total arc length for a semicircle
  const totalLength = Math.PI * r;
  const filledLength = (clampedScore / 100) * totalLength;

  return (
    <div className="flex animate-[fadeIn_0.4s_ease-out] flex-col items-center">
      <svg
        viewBox="0 0 140 90"
        className="h-[70px] w-[110px] overflow-visible sm:h-[90px] sm:w-[140px]"
      >
        {/* Background arc */}
        <path
          d={arcPath}
          fill="none"
          stroke="var(--border-default)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Filled arc */}
        <path
          d={arcPath}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${filledLength} ${totalLength}`}
          className="transition-[stroke-dasharray] duration-300 ease-out"
        />
        {/* Score number */}
        <text
          x={cx}
          y={cy - 10}
          textAnchor="middle"
          className="fill-[var(--text-primary)] text-[24px] font-bold"
          style={{ fontSize: "24px", fontWeight: 700 }}
        >
          {clampedScore}
        </text>
        {/* Label */}
        <text
          x={cx}
          y={cy + 8}
          textAnchor="middle"
          className="fill-[var(--text-secondary)] text-[10px]"
          style={{ fontSize: "10px" }}
        >
          Health Score
        </text>
      </svg>
    </div>
  );
}

// ─── 2. CompletionTrendChart ─────────────────────────────────────────────────

interface CompletionTrendChartProps {
  data: Array<{ date: string; count: number }>;
}

export function CompletionTrendChart({ data }: CompletionTrendChartProps) {
  return (
    <div className="animate-[fadeIn_0.4s_ease-out]">
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="dashboardTrendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border-default)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="var(--border-default)"
            tick={{ fontSize: 10, fill: "var(--text-muted)" }}
            tickFormatter={(d: string) => {
              const date = new Date(d);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            stroke="var(--border-default)"
            tick={{ fontSize: 10, fill: "var(--text-muted)" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip contentStyle={tooltipContentStyle} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="var(--accent)"
            strokeWidth={2.5}
            fill="url(#dashboardTrendGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "var(--accent)", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── 3. StatusDonutChart ─────────────────────────────────────────────────────

interface StatusDonutChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  totalTasks: number;
}

export function StatusDonutChart({ data, totalTasks }: StatusDonutChartProps) {
  return (
    <div className="animate-[fadeIn_0.4s_ease-out]">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={75}
            dataKey="value"
            strokeWidth={2}
            stroke="var(--bg-elevated)"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipContentStyle} />
          {/* Center text */}
          <text
            x="50%"
            y="42%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-[var(--text-primary)]"
            style={{ fontSize: "20px", fontWeight: 700 }}
          >
            {totalTasks}
          </text>
          <text
            x="50%"
            y="52%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-[var(--text-secondary)]"
            style={{ fontSize: "11px" }}
          >
            tasks
          </text>
        </PieChart>
      </ResponsiveContainer>
      {/* Compact legend */}
      <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[11px] text-body">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 4. WorkloadChart ────────────────────────────────────────────────────────

interface WorkloadChartProps {
  data: Array<{ name: string; active: number; completed: number }>;
}

export function WorkloadChart({ data }: WorkloadChartProps) {
  const chartHeight = Math.max(160, data.length * 40);

  return (
    <div className="animate-[fadeIn_0.4s_ease-out]">
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid stroke="var(--border-default)" strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            stroke="var(--border-default)"
            tick={{ fontSize: 10, fill: "var(--text-muted)" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="var(--border-default)"
            tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip contentStyle={tooltipContentStyle} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "11px", color: "var(--text-secondary)" }}
          />
          <Bar
            dataKey="active"
            stackId="workload"
            fill="var(--accent)"
            name="Active"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="completed"
            stackId="workload"
            fill="var(--violet-400)"
            name="Completed"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── 5. ProgressRing ─────────────────────────────────────────────────────────

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  labelSize?: number;
}

export function ProgressRing({
  progress,
  size = 36,
  strokeWidth = 3,
  color = "var(--accent)",
  labelSize = 9,
}: ProgressRingProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedProgress / 100) * circumference;
  const center = size / 2;

  return (
    <div
      className="relative inline-flex animate-[fadeIn_0.4s_ease-out] items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--border-default)"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-300 ease-out"
        />
      </svg>
      {/* Center percentage */}
      <span
        className="absolute font-semibold text-heading"
        style={{ fontSize: `${labelSize}px` }}
      >
        {Math.round(clampedProgress)}%
      </span>
    </div>
  );
}
