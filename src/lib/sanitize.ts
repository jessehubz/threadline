/**
 * Input sanitization utilities for user-generated content.
 *
 * Note: React's JSX automatically escapes text content, preventing XSS
 * in rendered output. These utilities provide defense-in-depth by
 * sanitizing content BEFORE it reaches the database, ensuring:
 * 1. No stored XSS payloads in the DB
 * 2. Safe output even if content is rendered outside React (emails, exports)
 * 3. Clean data for full-text search and API consumers
 */

/**
 * Strip HTML tags from a string.
 * Prevents stored XSS payloads from being saved to the database.
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

/**
 * Remove dangerous characters and patterns that could be used for XSS.
 * Strips: script-injection patterns, event handlers, data: URIs, javascript: URIs
 */
export function sanitizeText(input: string): string {
  let cleaned = input;

  // Remove HTML tags
  cleaned = stripHtml(cleaned);

  // Remove javascript: protocol patterns
  cleaned = cleaned.replace(/javascript\s*:/gi, "");

  // Remove data: URIs (can execute JS in some contexts)
  cleaned = cleaned.replace(/data\s*:[^,]*,/gi, "");

  // Remove event handler patterns (onclick, onerror, etc.)
  cleaned = cleaned.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");

  // Trim whitespace
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Sanitize a message/chat content string.
 * Preserves newlines and basic formatting but removes dangerous content.
 */
export function sanitizeMessageContent(input: string): string {
  let cleaned = sanitizeText(input);

  // Normalize excessive newlines (max 3 consecutive)
  cleaned = cleaned.replace(/\n{4,}/g, "\n\n\n");

  // Normalize excessive spaces (max 2 consecutive)
  cleaned = cleaned.replace(/ {3,}/g, "  ");

  return cleaned;
}

/**
 * Sanitize a title/name field (single line, no special chars).
 */
export function sanitizeTitle(input: string): string {
  let cleaned = sanitizeText(input);

  // Remove newlines from titles
  cleaned = cleaned.replace(/[\r\n]/g, " ");

  // Collapse multiple spaces
  cleaned = cleaned.replace(/\s{2,}/g, " ");

  return cleaned.trim();
}
