import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const COOKIE_NAME = "store_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days
const SECRET = process.env.STORE_SESSION_SECRET || "magma-store-session-dev-secret";

export { COOKIE_NAME, MAX_AGE_SEC };

export function createStoreSession(payload: { userId: string; email: string }): string {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SEC;
  const data = JSON.stringify({ sub: payload.userId, email: payload.email, exp });
  const b64 = Buffer.from(data, "utf8").toString("base64url");
  const sig = createHmac("sha256", SECRET).update(b64).digest("base64url");
  return `${b64}.${sig}`;
}

export function verifyStoreSession(token: string): { userId: string; email: string } | null {
  const i = token.lastIndexOf(".");
  if (i === -1) return null;
  const b64 = token.slice(0, i);
  const sig = token.slice(i + 1);
  const expected = createHmac("sha256", SECRET).update(b64).digest("base64url");
  const sigBuf = Buffer.from(sig, "base64url");
  const expBuf = Buffer.from(expected, "base64url");
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null;
  try {
    const raw = Buffer.from(b64, "base64url").toString("utf8");
    const j = JSON.parse(raw) as { sub?: string; email?: string; exp?: number };
    if (!j.sub || !j.email || typeof j.exp !== "number" || j.exp < Math.floor(Date.now() / 1000))
      return null;
    return { userId: j.sub, email: j.email };
  } catch {
    return null;
  }
}

export async function getStoreUserFromRequest(request: NextRequest): Promise<{ id: string; email: string; username: string } | null> {
  try {
    // Get session token from cookie
    const sessionToken = request.cookies.get(COOKIE_NAME)?.value;
    if (!sessionToken) return null;

    // Verify the session
    const session = verifyStoreSession(sessionToken);
    if (!session) return null;

    // Get user data from database
    const supabase = createAdminClient();
    const { data: user, error } = await supabase
      .from('store_users')
      .select('id, email, username')
      .eq('id', session.userId)
      .single();

    if (error || !user) return null;

    return user;
  } catch (error) {
    console.error('Error getting store user from request:', error);
    return null;
  }
}
