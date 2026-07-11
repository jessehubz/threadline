import { requireUser } from "@/lib/auth";
import { ProfileForm } from "@/components/profile-form";

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-10">
        <h1 className="text-[20px] sm:text-[22px] text-headline">Profile</h1>
        <p className="mt-1.5 text-sm text-body">
          Manage your personal information
        </p>
      </div>
      <ProfileForm user={user} />
    </div>
  );
}
