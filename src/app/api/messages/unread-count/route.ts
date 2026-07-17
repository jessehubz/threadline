import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Unread = conversations where a message exists that is (a) newer than the
  // caller's lastReadAt (or any message if lastReadAt is null), (b) authored
  // by someone else, (c) not a system message.
  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: { userId: user.id },
      },
    },
    include: {
      participants: {
        where: { userId: user.id },
        select: { lastReadAt: true },
      },
      messages: {
        where: { userId: { not: user.id }, isSystem: false },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
    },
  });

  const unreadCount = conversations.filter((c) => {
    const lastMessage = c.messages[0];
    if (!lastMessage) return false;
    const lastReadAt = c.participants[0]?.lastReadAt;
    return !lastReadAt || lastMessage.createdAt > lastReadAt;
  }).length;

  return NextResponse.json({ count: unreadCount });
}
