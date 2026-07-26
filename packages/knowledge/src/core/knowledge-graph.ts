import {
  IKnowledgeGraph,
  KnowledgeGraphConfig,
  Namespace,
  TenantId,
  Document,
  DocumentMetadata,
  DocumentId,
  Entity,
  EntityType,
  EntityId,
  Relation,
  RelationType,
  RelationId,
  RetrievalRequest,
  RetrievalResult,
  RetrievedChunk,
  GraphQuery,
  GraphQueryResult,
  AccessLevel,
  IKnowledgeProvider,
  GraphStats,
  EntityPath,
  EntityFilter,
  RelationFilter,
  DocumentFilter,
} from './types';
import { knowledge } from '../providers';

/**
 * KnowledgeGraph - Main facade for interacting with the knowledge layer
 */
export class KnowledgeGraph implements IKnowledgeGraph {
  readonly provider: IKnowledgeProvider;
  readonly namespace: Namespace;
  readonly tenantId?: TenantId;

  private readonly defaultAccessLevel: AccessLevel = AccessLevel.ORG_INTERNAL;

  constructor(config: KnowledgeGraphConfig) {
    if (typeof config.provider === 'string') {
      this.provider = knowledge.getProvider(config.provider) ?? knowledge.getDefaultProvider();
    } else {
      this.provider = config.provider;
    }
    this.namespace = config.namespace;
    this.tenantId = config.tenantId;
  }

  private get config(): KnowledgeGraphConfig {
    return { namespace: this.namespace, tenantId: this.tenantId, provider: this.provider.name };
  }

  // ============================================================================
  // Lifecycle
  // ============================================================================

  async initialize(): Promise<void> {
    await this.provider.initialize(this.config);
  }

  async shutdown(): Promise<void> {
    await this.provider.shutdown();
  }

  async healthCheck(): Promise<{ healthy: boolean; latencyMs: number; details?: Record<string, unknown> }> {
    const start = Date.now();
    const result = await this.provider.healthCheck();
    return { ...result, latencyMs: Date.now() - start };
  }

  // ============================================================================
  // Document Operations
  // ============================================================================

  async addDocument(content: string, metadata: Omit<DocumentMetadata, 'createdAt' | 'updatedAt'>): Promise<DocumentId> {
    const now = new Date();
    const fullDoc: Document = {
      id: crypto.randomUUID() as DocumentId,
      namespace: this.namespace,
      tenantId: this.tenantId,
      content,
      metadata: { ...metadata, createdAt: now, updatedAt: now },
      embedding: undefined,
      createdAt: now,
      updatedAt: now,
    };

    return this.provider.ingestDocument(fullDoc);
  }

  async ingest(documents: (Omit<Document, 'id' | 'namespace' | 'tenantId' | 'createdAt' | 'updatedAt'> & { metadata?: Partial<DocumentMetadata> })[]): Promise<DocumentId[]> {
    const now = new Date();
    const fullDocs: Document[] = documents.map(d => ({
      ...d,
      id: crypto.randomUUID() as DocumentId,
      namespace: this.namespace,
      tenantId: this.tenantId,
      metadata: { ...d.metadata, createdAt: now, updatedAt: now } as DocumentMetadata,
      embedding: d.embedding,
      createdAt: now,
      updatedAt: now,
    }));
    return this.provider.ingestDocument(fullDocs[0]).then(id => [id]);
  }

  async deleteDocument(id: DocumentId): Promise<void> {
    await this.provider.deleteDocument(id);
  }

  async getDocument(id: DocumentId): Promise<Document | null> {
    return this.provider.getDocument(id);
  }

  async listDocuments(filter: Omit<DocumentFilter, 'namespace'>): Promise<Document[]> {
    const result = await this.provider.listDocuments(this.namespace, this.tenantId, filter);
    return result.documents;
  }

  // ============================================================================
  // Entity Operations
  // ============================================================================

  async addEntity(entity: Omit<Entity, 'id' | 'namespace' | 'tenantId' | 'metadata' | 'createdAt' | 'updatedAt'>): Promise<EntityId> {
    const now = new Date();
    const fullEntity: Entity = {
      ...entity,
      id: crypto.randomUUID() as EntityId,
      namespace: this.namespace,
      tenantId: this.tenantId,
      metadata: { sourceId: '', sourceType: 'manual', title: entity.name, accessLevel: this.defaultAccessLevel, tags: [], createdAt: now, updatedAt: now },
      properties: entity.properties ?? {},
      embedding: entity.embedding,
      createdAt: now,
      updatedAt: now,
    };
    return this.provider.upsertEntity(fullEntity);
  }

  async getEntity(id: EntityId): Promise<Entity | null> {
    return this.provider.getEntity(id);
  }

  async deleteEntity(id: EntityId): Promise<void> {
    await this.provider.deleteEntity(id);
  }

  async findEntities(filter: Omit<EntityFilter, 'namespace'>): Promise<Entity[]> {
    const result = await this.provider.listEntities(this.namespace, this.tenantId, filter);
    return result.entities;
  }

  // ============================================================================
  // Relation Operations
  // ============================================================================

  async addRelation(relation: Omit<Relation, 'id' | 'namespace' | 'tenantId' | 'metadata' | 'createdAt' | 'updatedAt'>): Promise<RelationId> {
    const now = new Date();
    const fullRelation: Relation = {
      ...relation,
      id: crypto.randomUUID() as RelationId,
      namespace: this.namespace,
      tenantId: this.tenantId,
      metadata: { sourceId: '', sourceType: 'manual', title: relation.type, accessLevel: this.defaultAccessLevel, tags: [], createdAt: now, updatedAt: now },
      confidence: relation.confidence ?? 1.0,
      createdAt: now,
      updatedAt: now,
    };
    return this.provider.upsertRelation(fullRelation);
  }

  async getRelation(id: RelationId): Promise<Relation | null> {
    return this.provider.getRelation(id);
  }

  async deleteRelation(id: RelationId): Promise<void> {
    await this.provider.deleteRelation(id);
  }

  async findRelations(filter: Omit<RelationFilter, 'namespace'>): Promise<Relation[]> {
    const result = await this.provider.listRelations(this.namespace, this.tenantId, filter);
    return result.relations;
  }

  // ============================================================================
  // Retrieval & Search
  // ============================================================================

  async search(request: Omit<RetrievalRequest, 'namespace'>): Promise<RetrievalResult> {
    const scopedRequest: RetrievalRequest = {
      ...request,
      namespace: this.namespace,
      tenantId: this.tenantId,
    };
    return this.provider.search(scopedRequest);
  }

  async searchHybrid(request: Omit<RetrievalRequest, 'namespace'>, graphWeight: number): Promise<RetrievalResult> {
    const scopedRequest = {
      ...request,
      namespace: this.namespace,
      tenantId: this.tenantId,
      graphWeight,
    } as RetrievalRequest & { graphWeight: number };
    return this.provider.hybridSearch(scopedRequest);
  }

  // ============================================================================
  // Graph Queries & Traversal
  // ============================================================================

  async traverse(query: Omit<GraphQuery, 'namespace'>): Promise<GraphQueryResult> {
    const scopedQuery: GraphQuery = {
      ...query,
      namespace: this.namespace,
      tenantId: this.tenantId,
    };
    return this.provider.queryGraph(scopedQuery);
  }

  async getEntityNeighbors(entityId: string, depth?: number, relationTypes?: RelationType[]): Promise<GraphQueryResult> {
    const neighbors = await this.provider.getEntityNeighbors(this.namespace, this.tenantId, entityId, { depth, relationTypes });
    return { entities: neighbors.entities, relations: neighbors.relations, paths: [] };
  }

  async getPath(from: EntityId, to: EntityId, maxDepth?: number): Promise<EntityPath[]> {
    const relations = await this.provider.getPath(this.namespace, this.tenantId, from, to, { maxDepth });
    return relations ? [{ entities: [], relations, length: relations.length }] : [];
  }

  // ============================================================================
  // Utilities
  // ============================================================================

  async stats(): Promise<GraphStats> {
    const { documents, entities, relations, storageSizeBytes } = await this.provider.getStats(this.namespace, this.tenantId);
    return {
      namespace: this.namespace,
      tenantId: this.tenantId,
      documentCount: documents,
      entityCount: entities,
      relationCount: relations,
      storageSizeBytes,
      lastUpdated: new Date(),
    };
  }
}

export default KnowledgeGraph;