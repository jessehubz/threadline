import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  // Optional: verify cron secret
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
  const result = await prisma.nodeAuditLog.deleteMany({
    where: { createdAt: { lt: tenDaysAgo } },
  });

  return NextResponse.json({ pruned: result.count, timestamp: new Date().toISOString() });
}
