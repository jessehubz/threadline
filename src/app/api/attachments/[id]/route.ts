import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const attachment = await prisma.attachment.findUnique({ where: { id } });
  if (!attachment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Delete from blob storage
  try {
    await del(attachment.fileUrl);
  } catch {
    // Blob might already be deleted
  }

  await prisma.attachment.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
