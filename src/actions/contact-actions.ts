"use server";

import { headers } from "next/headers";
import { z } from "zod/v4";

import { resend } from "@/lib/resend";
import { rateLimiters } from "@/lib/rate-limit";
import { sanitizeText, sanitizeTitle } from "@/lib/sanitize";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(100),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  subject: z.string().trim().max(150).optional(),
  message: z.string().trim().min(1, "Message is required.").max(5000),
});

interface ContactInput {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

interface ContactResult {
  success?: true;
  error?: string;
}

// Public marketing-site form: no authenticated user, so rate-limit by
// requester IP instead of a userId.
async function getRequestIdentifier(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  const realIp = headerList.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

export async function submitContactMessage(input: ContactInput): Promise<ContactResult> {
  const identifier = await getRequestIdentifier();

  const rateLimit = await rateLimiters.sensitive.check(identifier);
  if (!rateLimit.success) {
    return { error: "Too many messages sent. Please wait a bit before trying again." };
  }

  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Please check your input and try again." };
  }

  if (!process.env.CONTACT_EMAIL || !process.env.RESEND_API_KEY) {
    console.error("[Contact] Missing CONTACT_EMAIL or RESEND_API_KEY env var.");
    return { error: "Sorry, the contact form isn't available right now. Please email us directly instead." };
  }

  const name = sanitizeTitle(parsed.data.name);
  const email = parsed.data.email;
  const subject = parsed.data.subject ? sanitizeTitle(parsed.data.subject) : "";
  const message = sanitizeText(parsed.data.message);

  try {
    const { error } = await resend.emails.send({
      from: "Threadline <onboarding@resend.dev>",
      to: process.env.CONTACT_EMAIL,
      replyTo: email,
      subject: subject ? `[Contact] ${subject}` : `[Contact] New message from ${name}`,
      text: `From: ${name} <${email}>\n${subject ? `Subject: ${subject}\n` : ""}\n${message}`,
    });

    if (error) {
      console.error("[Contact] Resend error:", error);
      return { error: "We couldn't send your message right now. Please try again later." };
    }
  } catch (err) {
    console.error("[Contact] Failed to send message:", err);
    return { error: "We couldn't send your message right now. Please try again later." };
  }

  return { success: true };
}
