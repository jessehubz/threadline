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
    <div className="space-y-8">
      {/* Theme */}
      <div className="rounded-2xl border border-themed-subtle bg-card p-6 shadow-themed">
        <h3 className="mb-4 text-sm font-semibold text-heading">Appearance</h3>
        <div className="flex gap-3">
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => {
                setThemeLocal(t.value);
                applyTheme(t.value as "light" | "dark" | "system");
              }}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-150",
                theme === t.value
                  ? "border-[var(--accent)] accent-bg accent-color shadow-sm"
                  : "border-themed text-body hover:bg-hover"
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl border border-themed-subtle bg-card p-6 shadow-themed">
        <h3 className="mb-5 text-sm font-semibold text-heading">
          Email Notifications
        </h3>
        <div className="space-y-4">
          <Toggle
            label="Enable email notifications"
            checked={emailNotifications}
            onChange={setEmailNotifications}
          />
          {emailNotifications && (
            <div className="ml-6 space-y-4 border-l-2 border-themed pl-5">
              <Toggle label="Task assigned to me" checked={notifyAssigned} onChange={setNotifyAssigned} />
              <Toggle label="Approval requests" checked={notifyApproval} onChange={setNotifyApproval} />
              <Toggle label="Due date reminders" checked={notifyDueSoon} onChange={setNotifyDueSoon} />
              <Toggle label="Mentions" checked={notifyMentioned} onChange={setNotifyMentioned} />
            </div>
          )}
        </div>
      </div>

      <Button onClick={handleSave} loading={saving}>
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
    <label className="flex cursor-pointer items-center justify-between">
      <span className="text-sm text-body">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
          checked ? "bg-brand-600" : "bg-[var(--border-default)]"
        )}
      >
        <span
          className={cn(
            "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm",
            checked ? "translate-x-4.5" : "translate-x-0.5"
          )}
        />
      </button>
    </label>
  );
}
