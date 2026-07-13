"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function logNodeChange(
  nodeId: string,
  action: string,
  oldValue: string | null,
  newValue: string | null
) {
  const user = await requireUser();
  await prisma.nodeAuditLog.create({
    data: { nodeId, userId: user.id, action, oldValue, newValue },
  });
}

export async function getNodeHistory(nodeId: string) {
  const user = await requireUser();

  // Prune entries older than 10 days
  const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
  await prisma.nodeAuditLog.deleteMany({
    where: { nodeId, createdAt: { lt: tenDaysAgo } },
  });

  const logs = await prisma.nodeAuditLog.findMany({
    where: { nodeId },
    include: { user: { select: { id: true, name: true, email: true, imageUrl: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return logs;
}

export async function pruneOldAuditLogs() {
  const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
  const result = await prisma.nodeAuditLog.deleteMany({
    where: { createdAt: { lt: tenDaysAgo } },
  });
  return { deleted: result.count };
}
