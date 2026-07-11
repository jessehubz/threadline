import { requireUser } from "@/lib/auth";
import { SettingsForm } from "@/components/settings-form";
import { RecentlyDeleted } from "@/components/recently-deleted";
import { getDeletedProjects } from "@/actions/project-actions";

export default async function SettingsPage() {
  const user = await requireUser();
  const deletedProjects = await getDeletedProjects();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-10">
        <h1 className="text-headline"><span className="font-bold">Settings</span></h1>
        <p className="mt-1.5 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          Manage your account preferences
        </p>
      </div>
      <SettingsForm user={user} />
      <div className="mt-8">
        <RecentlyDeleted projects={deletedProjects} />
      </div>
    </div>
  );
}
