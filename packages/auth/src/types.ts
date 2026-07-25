import type {
  Organization,
  OrganizationMember,
  OrgMemberRole,
} from "@crewcircle/database/schema";

export type { Organization, OrganizationMember, OrgMemberRole as Role };

/** Supabase auth user enriched with current org context */
export interface UserWithOrg {
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  org: Organization | null;
  role: OrgMemberRole | null;
}

export interface AuthContext {
  user: UserWithOrg | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}
