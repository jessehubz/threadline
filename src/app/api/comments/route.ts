import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const nodeId = req.nextUrl.searchParams.get("nodeId");
  if (!nodeId) {
    return NextResponse.json({ error: "nodeId is required" }, { status: 400 });
  }

  // Verify the node belongs to a project the user is a member of
  const node = await prisma.taskNode.findUnique({
    where: { id: nodeId },
    include: {
      graph: {
        include: {
          project: {
            include: {
              members: { where: { userId: user.id } },
            },
          },
        },
      },
    },
  });

  if (!node || node.graph.project.members.length === 0) {
    return NextResponse.json({ error: "Not found or access denied" }, { status: 404 });
  }

  const membership = node.graph.project.members[0];
  const isOwner = membership.role === "OWNER";

  // Fetch comments - filter private comments (only visible to author and project owner)
  const comments = await prisma.comment.findMany({
    where: {
      nodeId,
      OR: [
        { isPrivate: false },
        { userId: user.id },
        ...(isOwner ? [{ isPrivate: true }] : []),
      ],
    },
    include: {
      user: { select: { id: true, name: true, email: true, imageUrl: true } },
      attachments: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ comments });
}
