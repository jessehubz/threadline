import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { nodeId, fileName, fileUrl, fileType, fileSize } = await req.json();

  const attachment = await prisma.attachment.create({
    data: { nodeId, fileName, fileUrl, fileType, fileSize },
  });

  return NextResponse.json(attachment);
}
