/**
 * @crewcircle/database — Supabase Postgres client factories, RLS helpers,
 * and base schema for multi-tenant CrewCircle apps.
 *
 * @packageDocumentation
 */

// Client factories
export {
  createDatabaseClient,
  createServiceClient,
  createOrgClient,
  buildOrgHeaders,
  type DatabaseClientOptions,
} from './client'

// RLS helpers
export {
  setOrgIdSQL,
  createOrgRLSPolicy,
  enableRLSCheck,
  setupTableRLS,
  SET_ORG_ID_RPC,
  CLEAR_ORG_ID_RPC,
} from './rls'

// Schema types
export type {
  DateTime,
  UUID,
  Json,
  Organization,
  OrganizationInsert,
  OrganizationUpdate,
  OrganizationMember,
  OrganizationMemberInsert,
  OrganizationMemberUpdate,
  OrgMemberRole,
  Subscription,
  SubscriptionInsert,
  SubscriptionUpdate,
  SubscriptionStatus,
  AuditLogEntry,
  AuditLogInsert,
  Database,
} from './schema'
