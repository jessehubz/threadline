"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateSettings } from "@/actions/user-actions";
import { toast } from "sonner";
import { Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

interface User {
  id: string;
  theme: string;
  emailNotifications: boolean;
  notifyAssigned: boolean;
  notifyApproval: boolean;
  notifyDueSoon: boolean;
  notifyMentioned: boolean;
}

export function SettingsForm({ user }: { user: User }) {
  const [theme, setThemeLocal] = useState(user.theme);
  const { setTheme: applyTheme } = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(user.emailNotifications);
  const [notifyAssigned, setNotifyAssigned] = useState(user.notifyAssigned);
  const [notifyApproval, setNotifyApproval] = useState(user.notifyApproval);
  const [notifyDueSoon, setNotifyDueSoon] = useState(user.notifyDueSoon);
  const [notifyMentioned, setNotifyMentioned] = useState(user.notifyMentioned);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    const result = await updateSettings({
      theme,
      emailNotifications,
      notifyAssigned,
      notifyApproval,
      notifyDueSoon,
      notifyMentioned,
    });
    if (result.error) toast.error(result.error);
    else {
      toast.success("Settings saved");
      // Apply theme via provider
      applyTheme(theme as "light" | "dark" | "system");
    }
    setSaving(false);
  }

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="space-y-7">
      {/* Theme - iOS-style grouped section: label above, border-only group below */}
      <div>
        <p className="text-eyebrow mb-2.5 px-1">Appearance</p>
        <div className="panel-quiet p-4 sm:p-5">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => {
                  setThemeLocal(t.value);
                  applyTheme(t.value as "light" | "dark" | "system");
                }}
                className={cn(
                  "flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-[transform,border-color,background-color,color] duration-150 hover:-translate-y-px sm:flex-none sm:justify-start sm:px-4",
                  theme === t.value
                    ? "border-[var(--accent)] accent-bg accent-color shadow-sm"
                    : "border-themed text-body hover:bg-hover"
                )}
              >
                <t.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div>
        <p className="text-eyebrow mb-2.5 px-1">Email Notifications</p>
        <div className="panel-quiet p-4 sm:p-5">
          <div className="space-y-4">
            <Toggle
              label="Enable email notifications"
              checked={emailNotifications}
              onChange={setEmailNotifications}
            />
            {emailNotifications && (
              <div className="ml-3 sm:ml-6 space-y-4 border-l-2 border-themed pl-3 sm:pl-5">
                <Toggle label="Task assigned to me" checked={notifyAssigned} onChange={setNotifyAssigned} />
                <Toggle label="Approval requests" checked={notifyApproval} onChange={setNotifyApproval} />
                <Toggle label="Due date reminders" checked={notifyDueSoon} onChange={setNotifyDueSoon} />
                <Toggle label="Mentions" checked={notifyMentioned} onChange={setNotifyMentioned} />
              </div>
            )}
          </div>
        </div>
      </div>

      <Button onClick={handleSave} loading={saving} disabled={saving}>
        Save Settings
      </Button>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3">
      <span className="text-sm text-body min-w-0">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
          checked ? "bg-[var(--accent)]" : "bg-[var(--border-default)]"
        )}
      >
        <span
          className={cn(
            "inline-block h-3.5 w-3.5 transform rounded-full transition-transform shadow-sm",
            checked ? "translate-x-4.5 bg-[var(--on-accent)]" : "translate-x-0.5 bg-white"
          )}
        />
      </button>
    </label>
  );
}
