import { getDeletedProjects } from "@/actions/project-actions";
import { TrashPageClient } from "./trash-client";

export default async function TrashPage() {
  const deletedProjects = await getDeletedProjects();

  return <TrashPageClient initialProjects={deletedProjects} />;
}
