import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

export const dynamic = "force-dynamic";

const createAttachmentSchema = z.object({
  nodeId: z.string().min(1),
  fileName: z.string().min(1).max(255),
  fileUrl: z.string().url(),
  fileType: z.string().min(1).max(100),
  fileSize: z.number().int().min(1).max(10 * 1024 * 1024), // max 10MB
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Validate input
  const body = await req.json();
  const parsed = createAttachmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 });
  }

  const { nodeId, fileName, fileUrl, fileType, fileSize } = parsed.data;

  // IDOR check: verify the node belongs to a project the user is a member of
  const node = await prisma.taskNode.findUnique({
    where: { id: nodeId },
    select: {
      graph: {
        select: { projectId: true },
      },
    },
  });

  if (!node) {
    return NextResponse.json({ error: "Node not found" }, { status: 404 });
  }

  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: user.id,
        projectId: node.graph.projectId,
      },
    },
  });

  if (!membership || membership.role === "MEMBER") {
    return NextResponse.json({ error: "Not authorized to attach files to this node" }, { status: 403 });
  }

  const attachment = await prisma.attachment.create({
    data: { nodeId, fileName, fileUrl, fileType, fileSize },
  });

  return NextResponse.json(attachment);
}
