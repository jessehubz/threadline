import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { rateLimiters } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit check
  const { success, resetAt } = await rateLimiters.messages.check(user.id);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)) } }
    );
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  // Verify user is a member of the project
  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: user.id,
        projectId,
      },
    },
  });

  if (!membership) {
    return NextResponse.json({ error: "Not a member of this project" }, { status: 403 });
  }

  const cursor = searchParams.get("cursor");

  const messages = await prisma.message.findMany({
    where: { projectId },
    include: {
      user: {
        select: { id: true, name: true, email: true, imageUrl: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    ...(cursor
      ? {
          skip: 1,
          cursor: { id: cursor },
        }
      : {}),
  });

  return NextResponse.json({ messages: messages.reverse() });
}
