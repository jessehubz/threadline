import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ShareGraphViewer } from "@/components/share-graph-viewer";

interface SharePageProps {
  params: Promise<{ projectId: string; token: string }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { projectId, token } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId, shareToken: token },
    include: {
      graphs: {
        take: 1,
        orderBy: { createdAt: "asc" },
        include: {
          nodes: {
            include: {
              assignments: { include: { user: true } },
              attachments: true,
              subGraph: { include: { nodes: { select: { id: true, status: true } } } },
              incomingEdges: true,
              outgoingEdges: true,
            },
          },
          edges: true,
        },
      },
    },
  });

  if (!project || !project.graphs[0]) {
    notFound();
  }

  const graph = project.graphs[0];

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6800900">
        <h1 className="text-lg font-semibold text-gray-900">
          {project.name}
          <span className="ml-2 text-sm font-normal text-gray-500">(View Only)</span>
        </h1>
        <a href="/sign-up" className="btn-primary text-sm">
          Sign up to edit
        </a>
      </header>
      <div className="flex-1">
        <ShareGraphViewer graph={graph} />
      </div>
    </div>
  );
}
