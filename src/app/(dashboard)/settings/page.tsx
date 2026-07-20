import { requireUser } from "@/lib/auth";
import { SettingsForm } from "@/components/settings-form";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto w-full max-w-2xl px-1 sm:px-0">
      <div className="mb-8 sm:mb-10">
        <h1 className="text-headline"><span className="font-bold">Settings</span></h1>
        <p className="mt-1.5 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          Manage your account preferences
        </p>
      </div>
      <SettingsForm user={user} />
    </div>
  );
}
