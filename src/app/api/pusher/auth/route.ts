import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";
import { rateLimiters } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

/**
 * Extracts the project ID from a Pusher channel name.
 * Supported formats:
 *   - private-graph-{graphId} → resolve graph → projectId
 *   - private-messages-{projectId}
 *   - presence-graph-{graphId} → resolve graph → projectId
 *   - private-project-{projectId}
 *
 * Returns null if the channel doesn't contain an identifiable resource.
 */
async function resolveProjectIdFromChannel(channel: string): Promise<string | null> {
  // private-messages-{projectId} or private-project-{projectId}
  const messagesMatch = channel.match(/^private-messages-(.+)$/);
  if (messagesMatch) return messagesMatch[1];

  const projectMatch = channel.match(/^private-project-(.+)$/);
  if (projectMatch) return projectMatch[1];

  // private-graph-{graphId} or presence-graph-{graphId}
  const graphMatch = channel.match(/^(?:private|presence)-graph-(.+)$/);
  if (graphMatch) {
    const graph = await prisma.graph.findUnique({
      where: { id: graphMatch[1] },
      select: { projectId: true },
    });
    return graph?.projectId ?? null;
  }

  return null;
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit check
  const { success, resetAt } = await rateLimiters.pusherAuth.check(user.id);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)) } }
    );
  }

  const body = await req.formData();
  const socketId = body.get("socket_id") as string;
  const channel = body.get("channel_name") as string;

  if (!socketId || !channel) {
    return NextResponse.json({ error: "Missing socket_id or channel_name" }, { status: 400 });
  }

  // Channel-level authorization: verify user is a member of the project
  const projectId = await resolveProjectIdFromChannel(channel);
  if (projectId) {
    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: { userId: user.id, projectId },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Not authorized for this channel" },
        { status: 403 }
      );
    }
  }

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
