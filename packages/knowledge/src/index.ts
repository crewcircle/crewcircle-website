/**
 * @crewcircle/knowledge - Unified Knowledge Layer
 * 
 * A provider-agnostic knowledge graph system supporting:
 * - Embedded (Cognee local): SQLite + LanceDB + Kuzu for local dev
 * - Postgres (pgvector + Apache AGE): Production multi-tenant with RLS
 * - Mock: In-memory for tests
 */

// Core types
export type {
  Namespace,
  TenantId,
  UserId,
  DocumentId,
  EntityId,
  RelationId,
  AccessLevel,
  KnowledgeGraphConfig,
  DocumentMetadata,
  Document,
  Entity,
  Relation,
  EntityType,
  RelationType,
  RetrievalRequest,
  RetrievalResult,
  RetrievedChunk,
  GraphQuery,
  GraphQueryResult,
  ProviderConfig,
  IKnowledgeProvider,
  HealthCheckResult,
  InternalEntityTypes,
  InternalRelationTypes,
  entityType,
  relationType,
  namespace,
  tenantId,
  userId,
  documentId,
  entityId,
  relationId,
} from './core/types';

// Core classes
export { KnowledgeGraph } from './core/knowledge-graph';

// Provider system
export {
  ProviderRegistry,
  knowledge,
  registerDefaultProviders,
  getOrgMemory,
  getAppGraph,
} from './providers';

// Providers
export { MockProvider } from './providers/mock/mock-provider';
export { EmbeddedProvider, EmbeddedBridge, createEmbeddedProvider, type EmbeddedConfig } from './providers/embedded';
export { PostgresProvider, createPostgresProvider, type PostgresConfig } from './providers/postgres';

// Internal domain (CrewCircle org memory)
export * from './internal';

// External domain (Per-app knowledge graphs)
export * from './external';

export { R2BackupService, createR2BackupService, type R2BackupConfig, type BackupManifest, type BackupMetadata } from './backup/r2-backup';