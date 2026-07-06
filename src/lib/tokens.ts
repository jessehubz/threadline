import { randomBytes } from "crypto";

/**
 * Generate a cryptographically secure random token.
 * Uses 32 bytes (256 bits) of entropy, hex-encoded to 64 characters.
 * Suitable for share links, invite tokens, and other security-critical identifiers.
 */
export function generateSecureToken(): string {
  return randomBytes(32).toString("hex");
}
