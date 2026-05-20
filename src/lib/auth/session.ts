"use server";

import { getSession } from "@/lib/auth/cookies";

/**
 * Returns the current access token so a client component can
 * establish a WebSocket connection.
 *
 * Why a server action instead of passing from RSC?
 *   The session cookie is HttpOnly — client JS cannot read it.
 *   We expose only the access token (already a short-lived JWT),
 *   never the refresh token or full session object.
 */
export async function getAccessTokenAction(): Promise<string | null> {
  const session = await getSession();
  return session?.accessToken ?? null;
}

/**
 * Returns the current user's ID for identifying own messages in the WS feed.
 */
export async function getCurrentUserIdAction(): Promise<string | null> {
  const session = await getSession();
  if (!session) return null;
  // The user ID is embedded in the JWT payload — parse it without verifying
  try {
    const payload = session.accessToken.split(".")[1];
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString());
    return decoded.user_id ?? null;
  } catch {
    return null;
  }
}