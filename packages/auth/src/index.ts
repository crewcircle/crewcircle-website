export type {
  Organization,
  OrganizationMember,
  UserWithOrg,
  AuthContext,
  Role,
  AuthUser,
} from "./types";

export {
  createAuthClient,
  getSession,
  getUser,
  getActiveOrg,
  signIn,
  signInWithOAuth,
  signOut,
  onAuthStateChange,
} from "./client";
export type { AuthClientOptions } from "./client";

export {
  createServerClient,
  requireAuth,
  requireOrg,
  getCurrentOrg,
} from "./server";
export type { ServerClientOptions } from "./server";

export { useAuth, useOrg, useIsMember } from "./hooks";
export type { AuthState, OrgState } from "./hooks";
