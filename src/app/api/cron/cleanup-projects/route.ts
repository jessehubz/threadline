import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// This endpoint should be called by a cron job (e.g., Vercel Cron)
// to permanently delete projects past their deleteAfter date
export async function GET(request: Request) {
  // Verify cron secret for security
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const expiredProjects = await prisma.project.findMany({
    where: {
      deletedAt: { not: null },
      deleteAfter: { lte: now },
    },
    select: { id: true, name: true },
  });

  let deleted = 0;
  for (const project of expiredProjects) {
    await prisma.project.delete({ where: { id: project.id } });
    deleted++;
  }

  return NextResponse.json({ deleted, projects: expiredProjects.map((p) => p.name) });
}
