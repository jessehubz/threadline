import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Count conversations where the most recent message is from someone else
  // (a simple heuristic for "unread" without dedicated read-tracking)
  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: { userId: user.id },
      },
    },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { userId: true },
      },
    },
  });

  const unreadCount = conversations.filter(
    (c) => c.messages.length > 0 && c.messages[0].userId !== user.id
  ).length;

  return NextResponse.json({ count: unreadCount });
}
