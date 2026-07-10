import { requireUser } from "@/lib/auth";
import { ProfileForm } from "@/components/profile-form";

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-10">
        <h1 className="text-[20px] font-light tracking-tight text-heading sm:text-[22px]">
          <span className="font-semibold">Profile</span>
        </h1>
        <p className="mt-1.5 text-sm text-body">
          Manage your personal information
        </p>
      </div>
      <ProfileForm user={user} />
    </div>
  );
}
