// Centralized owner check. Keep owner identities in env var OWNER_EMAILS (comma-separated)
// Example: OWNER_EMAILS="giosterr44@gmail.com,owner2@example.com"
import dotenv from "dotenv";
dotenv.config({ path: ['.env.local', '.env'] })

export function isOwner(email?: string | null): boolean {
  if (!email) return false;
  const configured = (process.env.OWNER_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (configured.length === 0) return false;
  return configured.includes(email.toLowerCase());
}
