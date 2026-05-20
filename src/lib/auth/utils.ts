import type { Session } from "@/types/auth.type";
 
/** Parse the `exp` claim from a JWT without verifying the signature. */
export function parseJwtExpiry(token: string): number {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString());
    // `exp` is in seconds — convert to ms
    return decoded.exp * 1000;
  } catch {
    // Fall back: treat as already expired
    return Date.now();
  }
}
 
/**
 * Returns true when the access token will expire within the next 60 seconds
 * (giving us a buffer to refresh before an actual 401).
 */
export function isAccessTokenExpired(session: Session): boolean {
  return Date.now() >= session.accessTokenExpiresAt - 60_000;
}
 
