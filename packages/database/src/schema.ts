/**
 * TypeScript type definitions for shared CrewCircle tables.
 *
 * These mirror the SQL schema in `migrations/001_base_schema.sql`.
 * Use them for type-safe queries and API contracts.
 */

// ---------------------------------------------------------------------------
// Base types
// ---------------------------------------------------------------------------

/** ISO 8601 datetime string */
export type DateTime = string

/** UUID string */
export type UUID = string

/** JSON value */
export type Json = Record<string, unknown> | unknown[] | string | number | boolean | null

// ---------------------------------------------------------------------------
// Table: organizations
// ---------------------------------------------------------------------------

export interface Organization {
  id: UUID
  name: string
  slug: string
  /** Owner user id (from Supabase auth.users) */
  owner_id: UUID | null
  /** Stripe customer id */
  stripe_customer_id: string | null
  /** Free-form settings blob */
  settings: Json
  created_at: DateTime
  updated_at: DateTime
}

export interface OrganizationInsert {
  id?: UUID
  name: string
  slug: string
  owner_id?: UUID | null
  stripe_customer_id?: string | null
  settings?: Json
  created_at?: DateTime
  updated_at?: DateTime
}

export interface OrganizationUpdate {
  name?: string
  slug?: string
  owner_id?: UUID | null
  stripe_customer_id?: string | null
  settings?: Json
  updated_at?: DateTime
}

// ---------------------------------------------------------------------------
// Table: organization_members
// ---------------------------------------------------------------------------

export type OrgMemberRole = 'owner' | 'admin' | 'member' | 'viewer'

export interface OrganizationMember {
  id: UUID
  org_id: UUID
  user_id: UUID
  role: OrgMemberRole
  created_at: DateTime
  updated_at: DateTime
}

export interface OrganizationMemberInsert {
  id?: UUID
  org_id: UUID
  user_id: UUID
  role?: OrgMemberRole
  created_at?: DateTime
  updated_at?: DateTime
}

export interface OrganizationMemberUpdate {
  role?: OrgMemberRole
  updated_at?: DateTime
}

// ---------------------------------------------------------------------------
// Table: subscriptions
// ---------------------------------------------------------------------------

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid'
  | 'paused'

export interface Subscription {
  id: UUID
  org_id: UUID
  stripe_subscription_id: string
  status: SubscriptionStatus
  product_id: string | null
  price_id: string | null
  current_period_start: DateTime | null
  current_period_end: DateTime | null
  created_at: DateTime
  updated_at: DateTime
}

export interface SubscriptionInsert {
  id?: UUID
  org_id: UUID
  stripe_subscription_id: string
  status: SubscriptionStatus
  product_id?: string | null
  price_id?: string | null
  current_period_start?: DateTime | null
  current_period_end?: DateTime | null
  created_at?: DateTime
  updated_at?: DateTime
}

export interface SubscriptionUpdate {
  status?: SubscriptionStatus
  product_id?: string | null
  price_id?: string | null
  current_period_start?: DateTime | null
  current_period_end?: DateTime | null
  updated_at?: DateTime
}

// ---------------------------------------------------------------------------
// Table: audit_log
// ---------------------------------------------------------------------------

export interface AuditLogEntry {
  id: UUID
  org_id: UUID
  /** User who performed the action (nullable for system actions) */
  user_id: UUID | null
  /** Action performed, e.g. 'create', 'update', 'delete', 'login' */
  action: string
  /** Entity type, e.g. 'organization', 'member', 'subscription' */
  entity: string
  /** Id of the entity acted upon */
  entity_id: UUID | null
  /** Arbitrary metadata about the action */
  metadata: Json
  created_at: DateTime
}

export interface AuditLogInsert {
  id?: UUID
  org_id: UUID
  user_id?: UUID | null
  action: string
  entity: string
  entity_id?: UUID | null
  metadata?: Json
  created_at?: DateTime
}

// ---------------------------------------------------------------------------
// Supabase Database type map (for typed queries)
// ---------------------------------------------------------------------------

/**
 * Supabase `Database` type definition.
 *
 * Merge this into your app's Supabase types to get full type-safety:
 *
 *   import type { Database } from '@crewcircle/database/schema'
 *   const supabase = createClient<Database>(url, key)
 */
export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: Organization
        Insert: OrganizationInsert
        Update: OrganizationUpdate
      }
      organization_members: {
        Row: OrganizationMember
        Insert: OrganizationMemberInsert
        Update: OrganizationMemberUpdate
      }
      subscriptions: {
        Row: Subscription
        Insert: SubscriptionInsert
        Update: SubscriptionUpdate
      }
      audit_log: {
        Row: AuditLogEntry
        Insert: AuditLogInsert
        Update: Partial<AuditLogInsert>
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
