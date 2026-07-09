import { requireUser } from "@/lib/auth";
import { SettingsForm } from "@/components/settings-form";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">Settings</h1>
        <p className="mt-1.5 text-sm text-[#6B7280]">
          Manage your account preferences
        </p>
      </div>
      <SettingsForm user={user} />
    </div>
  );
}
