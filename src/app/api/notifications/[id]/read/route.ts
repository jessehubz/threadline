import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // IDOR fix: scope the update to the current user so one user can't mark
  // another user's notification as read by guessing an id.
  await prisma.notification.updateMany({
    where: { id, userId: user.id },
    data: { read: true },
  });

  return NextResponse.json({ success: true });
}
