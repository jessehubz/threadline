import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.formData();
  const socketId = body.get("socket_id") as string;
  const channel = body.get("channel_name") as string;

  // For presence channels, include user info
  if (channel.startsWith("presence-")) {
    const authResponse = pusherServer.authorizeChannel(socketId, channel, {
      user_id: user.id,
      user_info: {
        id: user.id,
        name: user.name || user.email,
        imageUrl: user.imageUrl,
      },
    });
    return NextResponse.json(authResponse);
  }

  // For private channels
  const authResponse = pusherServer.authorizeChannel(socketId, channel);
  return NextResponse.json(authResponse);
}
