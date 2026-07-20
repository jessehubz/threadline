import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

// This endpoint should be called by a cron job (e.g., Vercel Cron) to notify
// task assignees when their task's due date is within the next 24 hours.
export async function GET(request: Request) {
  // Verify cron secret (fail closed if unset)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const twentyHoursAgo = new Date(now.getTime() - 20 * 60 * 60 * 1000);

  const nodes = await prisma.taskNode.findMany({
    where: {
      deletedAt: null,
      status: { not: "COMPLETE" },
      dueDate: { gte: now, lte: in24h },
      graph: { project: { deletedAt: null } },
    },
    select: {
      id: true,
      title: true,
      graph: { select: { projectId: true } },
      assignments: { select: { userId: true } },
    },
  });

  let notified = 0;
  for (const node of nodes) {
    for (const assignment of node.assignments) {
      // Dedupe: skip if this user already got a DUE_SOON ping for this node recently.
      const recent = await prisma.notification.findFirst({
        where: {
          userId: assignment.userId,
          type: "DUE_SOON",
          relatedNodeId: node.id,
          createdAt: { gte: twentyHoursAgo },
        },
        select: { id: true },
      });
      if (recent) continue;

      await createNotification({
        userId: assignment.userId,
        type: "DUE_SOON",
        title: `Task "${node.title}" is due soon`,
        relatedProjectId: node.graph.projectId,
        relatedNodeId: node.id,
      });
      notified++;
    }
  }

  return NextResponse.json({ notified, checked: nodes.length, timestamp: now.toISOString() });
}
