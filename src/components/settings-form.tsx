"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateSettings } from "@/actions/user-actions";
import { toast } from "sonner";
import { Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [theme, setTheme] = useState(user.theme);
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
      // Apply theme
      if (theme === "dark") document.documentElement.classList.add("dark");
      else if (theme === "light") document.documentElement.classList.remove("dark");
      else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        document.documentElement.classList.toggle("dark", prefersDark);
      }
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
      <div className="rounded-2xl border border-surface-200/80 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-surface-900">Appearance</h3>
        <div className="flex gap-3">
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-150",
                theme === t.value
                  ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm"
                  : "border-surface-200 text-surface-500 hover:border-surface-300 hover:text-surface-700"
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl border border-surface-200/80 bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-sm font-semibold text-surface-900">
          Email Notifications
        </h3>
        <div className="space-y-4">
          <Toggle
            label="Enable email notifications"
            checked={emailNotifications}
            onChange={setEmailNotifications}
          />
          {emailNotifications && (
            <div className="ml-6 space-y-4 border-l-2 border-surface-200 pl-5">
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
      <span className="text-sm text-surface-600">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
          checked ? "bg-brand-600" : "bg-surface-300600"
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
