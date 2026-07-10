import { requireUser } from "@/lib/auth";
import { FriendsClient } from "./friends-client";
import { getProjects } from "@/actions/project-actions";

export default async function FriendsPage() {
  const user = await requireUser();
  const projects = await getProjects();
  const projectList = projects.map((p) => ({ id: p.id, name: p.name }));

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-[22px] font-bold tracking-tight text-heading">Friends</h1>
        <p className="mt-1 text-[13px] text-body">Manage your friends and add them to projects</p>
      </div>
      <FriendsClient projects={projectList} currentUserId={user.id} />
    </div>
  );
}
