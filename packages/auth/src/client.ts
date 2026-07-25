import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient, Session, User } from "@supabase/supabase-js";
import type { Organization } from "./types";

export interface AuthClientOptions {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

export function createAuthClient(
  opts: AuthClientOptions = {}
): SupabaseClient {
  const url =
    opts.supabaseUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    opts.supabaseAnonKey ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createBrowserClient(url, key);
}

export async function getSession(
  client: SupabaseClient
): Promise<Session | null> {
  const { data } = await client.auth.getSession();
  return data.session;
}

export async function getUser(
  client: SupabaseClient
): Promise<User | null> {
  const { data } = await client.auth.getUser();
  return data.user;
}

/**
 * Reads org from user_metadata.org_id or app_metadata.org_id.
 */
export async function getActiveOrg(
  client: SupabaseClient
): Promise<Organization | null> {
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  const orgId =
    (user.user_metadata as Record<string, string>)?.org_id ??
    (user.app_metadata as Record<string, string>)?.org_id;

  if (!orgId) return null;

  const { data } = await client
    .from("organizations")
    .select("*")
    .eq("id", orgId)
    .single();

  return data as Organization | null;
}

export async function signIn(
  client: SupabaseClient,
  email: string,
  password: string
) {
  return client.auth.signInWithPassword({ email, password });
}

export async function signInWithOAuth(
  client: SupabaseClient,
  provider: "google" | "github"
) {
  return client.auth.signInWithOAuth({ provider });
}

export async function signOut(client: SupabaseClient) {
  return client.auth.signOut();
}

/** Returns subscription — call `.unsubscribe()` to clean up. */
export function onAuthStateChange(
  client: SupabaseClient,
  callback: (event: string, session: Session | null) => void
) {
  return client.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}
