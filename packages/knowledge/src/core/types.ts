/**
 * Core type definitions for @crewcircle/knowledge
 * These types are provider-agnostic and define the knowledge layer interface
 */

import { z } from 'zod';

// ============================================================================
// Identifiers & References
// ============================================================================

export type Namespace = string & { readonly __brand: unique symbol };
export type TenantId = string & { readonly __brand: unique symbol };
export type UserId = string & { readonly __brand: unique symbol };
export type DocumentId = string & { readonly __brand: unique symbol };
export type EntityId = string & { readonly __brand: unique symbol };
export type RelationId = string & { readonly __brand: unique symbol };

export type DocumentRef = DocumentId;
export type EntityRef = EntityId;
export type RelationRef = RelationId;

export function namespace(s: string): Namespace { return s as Namespace; }
export function tenantId(s: string): TenantId { return s as TenantId; }
export function userId(s: string): UserId { return s as UserId; }
export function documentId(s: string): DocumentId { return s as DocumentId; }
export function entityId(s: string): EntityId { return s as EntityId; }
export function relationId(s: string): RelationId { return s as RelationId; }

// ============================================================================
// Access Control
// ============================================================================

export enum AccessLevel {
  PUBLIC = 'public',
  ORG_INTERNAL = 'org-internal',
  TEAM_PRIVATE = 'team-private',
  USER_PRIVATE = 'user-private',
}

export const AccessLevelSchema = z.nativeEnum(AccessLevel);

// ============================================================================
// Knowledge Graph Core Types
// ============================================================================

export interface KnowledgeGraphConfig {
  namespace: Namespace;
  tenantId?: TenantId;
  provider: string;
  defaultAccessLevel?: AccessLevel;
  embeddingModel?: string;
}

export interface DocumentMetadata {
  sourceId: string;
  sourceType: 'file' | 'url' | 'api' | 'manual' | 'sync';
  title: string;
  description?: string;
  tags: string[];
  accessLevel: AccessLevel;
  tenantId?: TenantId;
  userId?: UserId;
  createdAt: Date;
  updatedAt: Date;
  customFields?: Record<string, unknown>;
}

export interface Document {
  id: DocumentId;
  namespace: Namespace;
  tenantId?: TenantId;
  content: string;
  metadata: DocumentMetadata;
  embedding?: number[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Entity {
  id: EntityId;
  namespace: Namespace;
  tenantId?: TenantId;
  name: string;
  type: EntityType;
  description?: string;
  properties: Record<string, unknown>;
  embedding?: number[];
  metadata: DocumentMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface Relation {
  id: RelationId;
  namespace: Namespace;
  tenantId?: TenantId;
  sourceEntityId: EntityId;
  targetEntityId: EntityId;
  type: RelationType;
  properties: Record<string, unknown>;
  confidence: number;
  metadata: DocumentMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export type EntityType = string & { readonly __brand: unique symbol };
export type RelationType = string & { readonly __brand: unique symbol };

export function entityType(s: string): EntityType { return s as EntityType; }
export function relationType(s: string): RelationType { return s as RelationType; }

// Common entity/relation types for Internal domain
export const InternalEntityTypes = {
  STANDARD: entityType('Standard'),
  DECISION: entityType('Decision'),
  PROJECT: entityType('Project'),
  MILESTONE: entityType('Milestone'),
  TEAM_MEMBER: entityType('TeamMember'),
  TECHNOLOGY: entityType('Technology'),
  RETROSPECTIVE: entityType('Retrospective'),
  ADR: entityType('ADR'),
} as const;

export const InternalRelationTypes = {
  DEFINES: relationType('DEFINES'),
  RELATES_TO: relationType('RELATES_TO'),
  SUPERSEDES: relationType('SUPERSEDES'),
  HAS_MILESTONE: relationType('HAS_MILESTONE'),
  PARTICIPATED_IN: relationType('PARTICIPATED_IN'),
  PRODUCED: relationType('PRODUCED'),
  DECIDED_BY: relationType('DECIDED_BY'),
  USES_TECHNOLOGY: relationType('USES_TECHNOLOGY'),
} as const;

// ============================================================================
// Query & Retrieval
// ============================================================================

export interface RetrievalRequest {
  query: string;
  namespace: Namespace;
  tenantId?: TenantId;
  userId?: UserId;
  limit?: number;
  threshold?: number;
  embedding?: number[];
  filters?: RetrievalFilters;
  includeGraph?: boolean;
  includeVectors?: boolean;
  graphDepth?: number;
  graphWeight?: number;
  vectorWeight?: number;
}

export interface RetrievalFilters {
  entityTypes?: EntityType[];
  relationTypes?: RelationType[];
  tags?: string[];
  accessLevels?: AccessLevel[];
  dateRange?: { from: Date; to: Date };
  sourceTypes?: DocumentMetadata['sourceType'][];
}

export interface RetrievedChunk {
  document: Document;
  score: number;
  chunkIndex: number;
  chunkText: string;
  matchedEntities?: Entity[];
  matchedRelations?: Relation[];
}

export interface RetrievalResult {
  chunks: RetrievedChunk[];
  entities: Entity[];
  relations: Relation[];
  totalChunks: number;
  queryTimeMs: number;
}

export interface GraphQuery {
  namespace: Namespace;
  tenantId?: TenantId;
  startEntityIds?: EntityId[];
  maxDepth?: number;
  relationTypes?: RelationType[];
  entityTypes?: EntityType[];
  limit?: number;
}

export interface GraphQueryResult {
  entities: Entity[];
  relations: Relation[];
  paths: EntityPath[];
}

export interface EntityPath {
  entities: Entity[];
  relations: Relation[];
  length: number;
}

// ============================================================================
// Provider Interface
// ============================================================================

export interface ProviderConfig {
  name: string;
  type: 'embedded' | 'postgres' | 'mock' | 'http';
  config: Record<string, unknown>;
}

export interface IKnowledgeProvider {
  readonly name: string;
  readonly type: ProviderConfig['type'];

  // Lifecycle
  initialize(config: KnowledgeGraphConfig): Promise<void>;
  shutdown(): Promise<void>;
  healthCheck(): Promise<HealthCheckResult>;

  // Document operations
  ingestDocument(doc: Document): Promise<DocumentRef>;
  getDocument(ref: DocumentRef): Promise<Document | null>;
  updateDocument(ref: DocumentRef, updates: Partial<Document>): Promise<void>;
  deleteDocument(ref: DocumentRef): Promise<void>;
  listDocuments(namespace: Namespace, tenantId: TenantId | undefined, filter?: Record<string, unknown>): Promise<{ documents: Document[]; total: number }>;

  // Entity operations
  upsertEntity(entity: Entity): Promise<EntityRef>;
  getEntity(ref: EntityRef): Promise<Entity | null>;
  updateEntity(ref: EntityRef, updates: Partial<Entity>): Promise<void>;
  deleteEntity(ref: EntityRef): Promise<void>;
  listEntities(namespace: Namespace, tenantId: TenantId | undefined, filter?: Record<string, unknown>): Promise<{ entities: Entity[]; total: number }>;

  // Relation operations
  upsertRelation(relation: Relation): Promise<RelationRef>;
  getRelation(ref: RelationRef): Promise<Relation | null>;
  updateRelation(ref: RelationRef, updates: Partial<Relation>): Promise<void>;
  deleteRelation(ref: RelationRef): Promise<void>;
  listRelations(namespace: Namespace, tenantId: TenantId | undefined, filter?: Record<string, unknown>): Promise<{ relations: Relation[]; total: number }>;

  // Retrieval
  search(request: RetrievalRequest): Promise<RetrievalResult>;
  hybridSearch(request: RetrievalRequest & { graphWeight?: number; vectorWeight?: number }): Promise<RetrievalResult>;

  // Graph queries
  queryGraph(query: GraphQuery): Promise<GraphQueryResult>;
  getEntityNeighbors(namespace: Namespace, tenantId: TenantId | undefined, entityId: string, options?: Record<string, unknown>): Promise<{ entities: Entity[]; relations: Relation[] }>;
  getPath(namespace: Namespace, tenantId: TenantId | undefined, sourceEntityId: string, targetEntityId: string, options?: Record<string, unknown>): Promise<Relation[] | null>;
  getSubgraph(namespace: Namespace, tenantId: TenantId | undefined, entityIds: string[], options?: Record<string, unknown>): Promise<{ entities: Entity[]; relations: Relation[] }>;

  // Utilities
  getStats(namespace: Namespace, tenantId: TenantId | undefined): Promise<{
    documents: number;
    entities: number;
    relations: number;
    storageSizeBytes: number;
  }>;
  createIndex(namespace: Namespace, tenantId: TenantId | undefined, indexType: string, config?: Record<string, unknown>): Promise<void>;
  dropIndex(namespace: Namespace, tenantId: TenantId | undefined, indexType: string): Promise<void>;
}

export interface HealthCheckResult {
  healthy: boolean;
  latencyMs: number;
  details?: Record<string, unknown>;
  error?: string;
}

export interface DocumentFilter {
  namespace: Namespace;
  tenantId?: TenantId;
  userId?: UserId;
  accessLevel?: AccessLevel;
  tags?: string[];
  sourceType?: DocumentMetadata['sourceType'];
  limit?: number;
  offset?: number;
}

export interface EntityFilter {
  namespace: Namespace;
  tenantId?: TenantId;
  type?: EntityType;
  name?: string;
  limit?: number;
  offset?: number;
}

export interface RelationFilter {
  namespace: Namespace;
  tenantId?: TenantId;
  type?: RelationType;
  fromEntityId?: EntityId;
  toEntityId?: EntityId;
  limit?: number;
  offset?: number;
}

export interface NamespaceConfig {
  vectorDimension?: number;
  graphConfig?: GraphConfig;
  retentionDays?: number;
}

export interface GraphConfig {
  enableDeduplication?: boolean;
  deduplicationThreshold?: number;
  enableTemporalVersioning?: boolean;
}

// ============================================================================
// Knowledge Graph Facade
// ============================================================================

export interface IKnowledgeGraph {
  readonly namespace: Namespace;
  readonly tenantId?: TenantId;
  readonly provider: IKnowledgeProvider;

  // High-level document operations
  ingest(documents: Omit<Document, 'id' | 'namespace' | 'tenantId' | 'metadata' | 'createdAt' | 'updatedAt'>[]): Promise<DocumentId[]>;
  addDocument(content: string, metadata: Omit<DocumentMetadata, 'createdAt' | 'updatedAt'>): Promise<DocumentId>;
  deleteDocument(id: DocumentId): Promise<void>;
  getDocument(id: DocumentId): Promise<Document | null>;
  listDocuments(filter: Omit<DocumentFilter, 'namespace'>): Promise<Document[]>;

  // High-level entity operations
  addEntity(entity: Omit<Entity, 'id' | 'namespace' | 'tenantId' | 'metadata' | 'createdAt' | 'updatedAt'>): Promise<EntityId>;
  getEntity(id: EntityId): Promise<Entity | null>;
  deleteEntity(id: EntityId): Promise<void>;
  findEntities(filter: Omit<EntityFilter, 'namespace'>): Promise<Entity[]>;

  // High-level relation operations
  addRelation(relation: Omit<Relation, 'id' | 'namespace' | 'tenantId' | 'metadata' | 'createdAt' | 'updatedAt'>): Promise<RelationId>;
  getRelation(id: RelationId): Promise<Relation | null>;
  deleteRelation(id: RelationId): Promise<void>;
  findRelations(filter: Omit<RelationFilter, 'namespace'>): Promise<Relation[]>;

  // Retrieval
  search(request: Omit<RetrievalRequest, 'namespace'>): Promise<RetrievalResult>;
  searchHybrid(request: Omit<RetrievalRequest, 'namespace'>, graphWeight: number): Promise<RetrievalResult>;

  // Graph traversal
  traverse(query: Omit<GraphQuery, 'namespace'>): Promise<GraphQueryResult>;
  getEntityNeighbors(entityId: string, depth?: number, relationTypes?: RelationType[]): Promise<GraphQueryResult>;
  getPath(from: EntityId, to: EntityId, maxDepth?: number): Promise<EntityPath[]>;

  // Utilities
  stats(): Promise<GraphStats>;
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
}

export interface GraphStats {
  namespace: Namespace;
  tenantId?: TenantId;
  documentCount: number;
  entityCount: number;
  relationCount: number;
  storageSizeBytes: number;
  lastUpdated: Date;
}

// ============================================================================
// Sync & Ingestion
// ============================================================================

export interface SyncResult {
  success: boolean;
  documentsProcessed: number;
  entitiesCreated: number;
  entitiesUpdated: number;
  relationsCreated: number;
  relationsUpdated: number;
  errors: SyncError[];
  durationMs: number;
}

export interface SyncError {
  sourceId: string;
  error: string;
  recoverable: boolean;
}

export interface SyncConfig {
  namespace: Namespace;
  tenantId?: TenantId;
  source: SyncSource;
  schedule?: string; // cron expression
  incremental?: boolean;
  since?: Date;
}

export type SyncSource = 
  | { type: 'notion'; databaseId: string; apiKey: string }
  | { type: 'github'; repo: string; token: string; path?: string }
  | { type: 'linear'; apiKey: string; teamId?: string }
  | { type: 'filesystem'; path: string; pattern?: string }
  | { type: 'custom'; handler: string };

// ============================================================================
// AI SDK Integration Types
// ============================================================================

export interface KnowledgeToolConfig {
  provider: IKnowledgeProvider;
  namespace: Namespace;
  tenantId?: TenantId;
  userId?: UserId;
  maxResults?: number;
  minScore?: number;
}

export interface RecallToolInput {
  query: string;
  filters?: RetrievalFilters;
  limit?: number;
}

export interface RememberToolInput {
  content: string;
  metadata: Omit<DocumentMetadata, 'createdAt' | 'updatedAt' | 'sourceId'>;
  entities?: Omit<Entity, 'id' | 'namespace' | 'tenantId' | 'metadata' | 'createdAt' | 'updatedAt'>[];
  relations?: Omit<Relation, 'id' | 'namespace' | 'tenantId' | 'metadata' | 'createdAt' | 'updatedAt'>[];
}