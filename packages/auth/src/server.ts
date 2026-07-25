import { createServerClient as _createServerClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Organization, OrganizationMember } from "./types";

export interface ServerClientOptions {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

/**
 * Request-scoped Supabase client using cookies from next/headers.
 * Must be called inside Server Components or Route Handlers.
 */
export async function createServerClient(
  opts: ServerClientOptions = {}
): Promise<SupabaseClient> {
  const url =
    opts.supabaseUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    opts.supabaseAnonKey ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  const cookieStore = await cookies();

  return _createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
          );
        } catch {
          // Server Component — read-only context. Middleware handles cookie refresh.
        }
      },
    },
  });
}

export async function requireAuth(): Promise<{
  user: User;
  client: SupabaseClient;
}> {
  const client = await createServerClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return { user, client };
}

export async function requireOrg(orgId: string): Promise<{
  client: SupabaseClient;
  membership: OrganizationMember;
  org: Organization;
}> {
  const { user, client } = await requireAuth();

  const { data: membership, error: memberErr } = await client
    .from("organization_members")
    .select("*")
    .eq("org_id", orgId)
    .eq("user_id", user.id)
    .single();

  if (memberErr || !membership) {
    throw new Response("Forbidden: not a member of this organization", {
      status: 403,
    });
  }

  const { data: org, error: orgErr } = await client
    .from("organizations")
    .select("*")
    .eq("id", orgId)
    .single();

  if (orgErr || !org) {
    throw new Response("Organization not found", { status: 404 });
  }

  return { client, membership, org: org as Organization };
}

export async function getCurrentOrg(): Promise<{
  client: SupabaseClient;
  org: Organization | null;
}> {
  const client = await createServerClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return { client, org: null };

  const orgId =
    (user.user_metadata as Record<string, string>)?.org_id ??
    (user.app_metadata as Record<string, string>)?.org_id;

  if (!orgId) return { client, org: null };

  const { data } = await client
    .from("organizations")
    .select("*")
    .eq("id", orgId)
    .single();

  return { client, org: (data as Organization) ?? null };
}
