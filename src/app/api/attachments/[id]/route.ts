import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Invalid attachment ID" }, { status: 400 });
  }

  // Fetch attachment with its node's project info for authorization
  const attachment = await prisma.attachment.findUnique({
    where: { id },
    include: {
      node: {
        select: {
          graph: {
            select: { projectId: true },
          },
        },
      },
    },
  });

  if (!attachment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // IDOR check: verify user is a member of the project with edit permissions
  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: user.id,
        projectId: attachment.node.graph.projectId,
      },
    },
  });

  if (!membership || membership.role === "MEMBER") {
    return NextResponse.json({ error: "Not authorized to delete this attachment" }, { status: 403 });
  }

  // Delete from blob storage
  try {
    await del(attachment.fileUrl);
  } catch {
    // Blob might already be deleted
  }

  await prisma.attachment.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
