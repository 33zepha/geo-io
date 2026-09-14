/** Admin allowlist — emails séparés par des virgules via env, plus ton compte par défaut. */
const DEFAULT_ADMIN_EMAILS = ['22hendrxkd@gmail.com'];

export function getAdminEmails(): string[] {
  const fromEnv = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return Array.from(new Set([...DEFAULT_ADMIN_EMAILS, ...fromEnv]));
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}
