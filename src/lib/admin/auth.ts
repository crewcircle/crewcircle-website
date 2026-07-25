import { createServerClient } from "@crewcircle/auth";

const DEV_MODE = process.env.ADMIN_AUTH_BYPASS === "true";

interface AdminUser {
  id: string;
  email: string;
  role: string;
}

/**
 * Require admin access for the current request.
 *
 * In production: validates Supabase session and admin/owner role in the
 * CrewCircle org (identified by CREWCIRCLE_ORG_SLUG).
 *
 * In dev mode (no NEXT_PUBLIC_SUPABASE_URL configured): returns a dummy
 * admin user so the admin UI is browseable without real auth.
 *
 * In server components, failed auth throws a redirect via next/navigation.
 * In API routes, failed auth throws Response with status 401/403.
 */
export async function requireAdmin(): Promise<{ user: AdminUser }> {
  // Dev mode: return a dummy admin user for preview
  if (DEV_MODE) {
    return {
      user: {
        id: "dev-user",
        email: "dev@crewcircle.com.au",
        role: "owner",
      },
    };
  }

  const orgSlug = process.env.CREWCIRCLE_ORG_SLUG;
  if (!orgSlug) {
    throw new Error(
      "Missing CREWCIRCLE_ORG_SLUG environment variable. " +
        "Set it to the slug of the CrewCircle admin organization."
    );
  }

  const client = await createServerClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  // Check org membership and role
  const { data: membership } = await client
    .from("organization_members")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    throw new Response("Forbidden: not a member of the admin org", {
      status: 403,
    });
  }

  const role = membership.role;
  if (role !== "admin" && role !== "owner") {
    throw new Response("Forbidden: insufficient privileges", { status: 403 });
  }

  return {
    user: {
      id: user.id,
      email: user.email ?? "unknown",
      role,
    },
  };
}
