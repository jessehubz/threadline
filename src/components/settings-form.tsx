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
    <div className="max-w-2xl space-y-8">
      {/* Theme */}
      <div className="card">
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Appearance</h3>
        <div className="flex gap-3">
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors",
                theme === t.value
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                  : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400"
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="card">
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
          Email Notifications
        </h3>
        <div className="space-y-3">
          <Toggle
            label="Enable email notifications"
            checked={emailNotifications}
            onChange={setEmailNotifications}
          />
          {emailNotifications && (
            <div className="ml-6 space-y-3 border-l-2 border-gray-200 pl-4 dark:border-gray-700">
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
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
          checked ? "bg-brand-600" : "bg-gray-300 dark:bg-gray-600"
        )}
      >
        <span
          className={cn(
            "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
            checked ? "translate-x-4.5" : "translate-x-0.5"
          )}
        />
      </button>
    </label>
  );
}
