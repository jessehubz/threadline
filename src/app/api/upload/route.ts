import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { rateLimiters } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit check
  const { success, resetAt } = await rateLimiters.upload.check(user.id);
  if (!success) {
    return NextResponse.json(
      { error: "Too many uploads. Please wait." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)) } }
    );
  }

  const body = (await req.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => {
        // User already authenticated above via getCurrentUser()
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
          ],
          maximumSizeInBytes: 10 * 1024 * 1024, // 10MB
          // @vercel/blob v2 defaults addRandomSuffix to false. Without this,
          // the raw filename is the blob pathname, so a second upload of any
          // common name ("photo.jpg", "avatar.png") collides and the write is
          // rejected — the upload throws and the DB never records the URL,
          // which is the root cause of the "avatar shows empty" bug. A random
          // suffix guarantees a unique, unguessable pathname per upload.
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // Could add logging here
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
