import { getProjects } from "@/actions/project-actions";
import { getUserTags } from "@/actions/tag-actions";
import { ProjectsGridSection } from "@/components/projects-grid-section";

export default async function ProjectsPage() {
  const projects = await getProjects();

  const projectList = projects.map((p) => ({
    id: p.id,
    name: p.name,
    visibility: p.visibility,
    totalTasks: p.totalTasks,
    completedTasks: p.completedTasks,
    memberCount: p.memberCount,
    lastOpenedAt: p.lastOpenedAt ? p.lastOpenedAt.toISOString() : null,
    displayOrder: p.displayOrder,
    role: p.role,
    labels: p.labels.map((l) => ({ id: l.id, name: l.name, color: l.color })),
    tags: p.tags.map((t) => ({ id: t.id, name: t.name, color: t.color, isSystem: t.isSystem })),
  }));

  let availableTags: Array<{ id: string; name: string; color: string; isSystem: boolean }> = [];
  try {
    availableTags = await getUserTags();
  } catch {
    // Non-critical - default to empty
  }

  return <ProjectsGridSection projects={projectList} availableTags={availableTags} />;
}
