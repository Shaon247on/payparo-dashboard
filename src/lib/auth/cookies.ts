"use server";

import { cookies } from "next/headers";
import type { Session } from "@/types/auth.type";

const COOKIE_NAME = "pp_session";
const ROLE_COOKIE = "pp_role";

// ─── Encryption helpers ──────────────────────────────────────────────────────

async function getKey(): Promise<CryptoKey> {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET env var must be at least 32 characters long."
    );
  }
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret.slice(0, 32)),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
  return keyMaterial;
}

async function encrypt(payload: string): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(payload)
  );
  // Concatenate iv + ciphertext and base64url-encode
  const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.byteLength);
  return Buffer.from(combined).toString("base64url");
}

async function decrypt(token: string): Promise<string> {
  const key = await getKey();
  const combined = Buffer.from(token, "base64url");
  const iv = combined.subarray(0, 12);
  const ciphertext = combined.subarray(12);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );
  return new TextDecoder().decode(decrypted);
}

// ─── Public session helpers ───────────────────────────────────────────────────

/** Persist the session in an encrypted HttpOnly cookie. */
export async function setSession(session: Session): Promise<void> {
  const encrypted = await encrypt(JSON.stringify(session));
  const cookieStore = await cookies();
  const maxAge = 60 * 60 * 24; // 24 hours

  // Encrypted session — HttpOnly, never readable by JS or middleware
  cookieStore.set(COOKIE_NAME, encrypted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  // Plain role cookie — NOT HttpOnly so Edge middleware can read it.
  // Contains no sensitive data; the encrypted cookie is the real auth gate.
  cookieStore.set(ROLE_COOKIE, session.user.role, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

/** Read and decrypt the session cookie. Returns null if absent/invalid. */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  try {
    const json = await decrypt(raw);
    return JSON.parse(json) as Session;
  } catch {
    // Tampered or corrupted cookie — treat as unauthenticated
    return null;
  }
}

/** Overwrite only the access token + its expiry inside an existing session. */
export async function updateAccessToken(
  newAccessToken: string,
  expiresAt: number
): Promise<void> {
  const session = await getSession();
  if (!session) return;
  await setSession({ ...session, accessToken: newAccessToken, accessTokenExpiresAt: expiresAt });
}

/** Delete the session cookie (logout). */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  cookieStore.delete(ROLE_COOKIE);
}