import { getGraphData, getBreadcrumbs } from "@/actions/graph-actions";
import { GraphEditor } from "@/components/graph/graph-editor";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";

interface GraphPageProps {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ path?: string; graphId?: string }>;
}

export default async function GraphPage({ params, searchParams }: GraphPageProps) {
  const { projectId } = await params;
  const { path, graphId } = await searchParams;

  const user = await requireUser();

  let data;
  try {
    data = await getGraphData(projectId, graphId || undefined);
  } catch {
    redirect("/dashboard");
  }

  const pathArray = path ? path.split(",") : [];
  const breadcrumbs = await getBreadcrumbs(projectId, pathArray);

  // Get project details for share
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { shareToken: true },
  });

  // Get members for share dialog and assignment
  const members = await prisma.projectMember.findMany({
    where: { projectId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return (
    <div className="-mx-6 -my-8 lg:-mx-10 lg:-my-10 flex h-[calc(100vh-4rem)] flex-col">
      <GraphEditor
        projectId={projectId}
        graph={data.graph}
        projectName={data.project.name}
        shareToken={project?.shareToken || null}
        members={members.map((m) => ({ id: m.id, role: m.role, user: m.user }))}
        role={data.role}
        breadcrumbs={breadcrumbs}
        currentPath={pathArray}
        currentUserId={user.id}
      />
    </div>
  );
}
