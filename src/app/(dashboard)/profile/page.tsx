import { requireUser } from "@/lib/auth";
import { ProfileForm } from "@/components/profile-form";

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage your personal information
        </p>
      </div>
      <ProfileForm user={user} />
    </div>
  );
}
