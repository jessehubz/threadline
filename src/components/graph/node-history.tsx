"use client";

import { useState } from "react";
import { History, ChevronDown, ChevronUp } from "lucide-react";
import { getNodeHistory } from "@/actions/audit-actions";

interface AuditEntry {
  id: string;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: Date | string;
  user: { id: string; name: string | null; email: string; imageUrl: string | null };
}

const actionLabels: Record<string, string> = {
  title_changed: "changed title",
  description_changed: "updated description",
  status_changed: "changed status",
  priority_changed: "changed priority",
  assignee_added: "added assignee",
  assignee_removed: "removed assignee",
  approver_set: "made approver",
  approver_removed: "removed approver",
  edge_added: "added dependency",
  edge_removed: "removed dependency",
  due_date_changed: "changed due date",
  color_changed: "changed color",
  created: "created this node",
  deleted: "deleted this node",
  restored: "restored this node",
};

export function NodeHistory({ nodeId }: { nodeId: string }) {
  const [history, setHistory] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function handleToggle() {
    const next = !expanded;
    setExpanded(next);
    if (next && !loaded) {
      setLoading(true);
      try {
        const logs = await getNodeHistory(nodeId);
        setHistory(logs as AuditEntry[]);
        setLoaded(true);
      } finally {
        setLoading(false);
      }
    }
  }

  function formatTime(date: Date | string) {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  return (
    <div className="border-t" style={{ borderColor: 'var(--border-subtle)' }}>
      <button
        onClick={handleToggle}
        className="flex w-full items-center justify-between py-3 px-1 transition-colors hover:text-[var(--text-primary)]"
        style={{ color: 'var(--text-secondary)' }}
      >
        <span className="flex items-center gap-2 text-xs font-medium">
          <History className="h-3.5 w-3.5" />
          Edit History
        </span>
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {expanded && (
        <div className="pb-3">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 rounded-lg skeleton-shimmer" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <p className="text-[11px] py-2" style={{ color: 'var(--text-muted)' }}>No history yet</p>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {history.map((entry) => (
                <div key={entry.id} className="flex items-start gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-[var(--bg-muted)]">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-semibold shrink-0 mt-0.5" style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
                    {(entry.user.name?.[0] || entry.user.email[0]).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px]" style={{ color: 'var(--text-primary)' }}>
                      <span className="font-medium">{entry.user.name || entry.user.email.split('@')[0]}</span>
                      {' '}
                      <span style={{ color: 'var(--text-secondary)' }}>{actionLabels[entry.action] || entry.action}</span>
                    </p>
                    {(entry.oldValue || entry.newValue) && (
                      <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                        {entry.oldValue && entry.newValue
                          ? `${entry.oldValue} → ${entry.newValue}`
                          : entry.newValue || entry.oldValue}
                      </p>
                    )}
                  </div>
                  <span className="text-[9px] shrink-0" style={{ color: 'var(--text-muted)' }}>
                    {formatTime(entry.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
