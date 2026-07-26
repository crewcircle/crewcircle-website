import type {
  IKnowledgeProvider,
  KnowledgeGraphConfig,
  HealthCheckResult,
  Document,
  DocumentRef,
  Entity,
  EntityRef,
  Relation,
  RelationRef,
  RetrievalRequest,
  RetrievalResult,
  GraphQuery,
  GraphQueryResult,
  Namespace,
  TenantId,
  AccessLevel,
  RetrievedChunk,
} from '../../core/types';

interface StoredGraph {
  documents: Map<string, Document>;
  entities: Map<string, Entity>;
  relations: Map<string, Relation>;
  documentIndex: Map<string, Set<string>>;
  entityIndex: Map<string, Set<string>>;
  relationIndex: Map<string, Set<string>>;
}

export class MockProvider implements IKnowledgeProvider {
  readonly name: string;
  readonly type = 'mock' as const;
  private graphs = new Map<string, StoredGraph>();
  private initialized = false;

  constructor(config: { seed?: number } = {}, name = 'mock') {
    this.name = name;
  }

  async initialize(config: KnowledgeGraphConfig): Promise<void> {
    const key = this.getGraphKey(config.namespace, config.tenantId);
    if (!this.graphs.has(key)) {
      this.graphs.set(key, this.createEmptyGraph());
    }
    this.initialized = true;
  }

  async shutdown(): Promise<void> {
    this.initialized = false;
  }

  async healthCheck(): Promise<HealthCheckResult> {
    return { healthy: this.initialized, latencyMs: 1 };
  }

  private getGraphKey(namespace: Namespace, tenantId: TenantId | undefined): string {
    return `${namespace}:${tenantId ?? 'default'}`;
  }

  private getGraph(namespace: Namespace, tenantId: TenantId | undefined): StoredGraph {
    const key = this.getGraphKey(namespace, tenantId);
    let graph = this.graphs.get(key);
    if (!graph) {
      graph = this.createEmptyGraph();
      this.graphs.set(key, graph);
    }
    return graph;
  }

  private createEmptyGraph(): StoredGraph {
    return {
      documents: new Map(),
      entities: new Map(),
      relations: new Map(),
      documentIndex: new Map(),
      entityIndex: new Map(),
      relationIndex: new Map(),
    };
  }

  private addToIndex(index: Map<string, Set<string>>, key: string, id: string): void {
    if (!index.has(key)) index.set(key, new Set());
    index.get(key)!.add(id);
  }

  private removeFromIndex(index: Map<string, Set<string>>, key: string, id: string): void {
    const set = index.get(key);
    if (set) {
      set.delete(id);
      if (set.size === 0) index.delete(key);
    }
  }

  // Document operations
  async ingestDocument(document: Document): Promise<DocumentRef> {
    const graph = this.getGraph(document.namespace, document.tenantId);
    graph.documents.set(document.id, document);
    
    for (const tag of document.metadata.tags) {
      this.addToIndex(graph.documentIndex, `tag:${tag}`, document.id);
    }
    this.addToIndex(graph.documentIndex, `access:${document.metadata.accessLevel}`, document.id);
    if (document.metadata.userId) this.addToIndex(graph.documentIndex, `user:${document.metadata.userId}`, document.id);
    if (document.metadata.customFields?.clientId) this.addToIndex(graph.documentIndex, `client:${document.metadata.customFields.clientId}`, document.id);
    if (document.metadata.customFields?.projectId) this.addToIndex(graph.documentIndex, `project:${document.metadata.customFields.projectId}`, document.id);

    return document.id as DocumentRef;
  }

  async getDocument(ref: DocumentRef): Promise<Document | null> {
    // Search all graphs since ref doesn't have namespace/tenant
    for (const graph of this.graphs.values()) {
      const doc = graph.documents.get(ref);
      if (doc) return doc;
    }
    return null;
  }

  async updateDocument(ref: DocumentRef, updates: Partial<Document>): Promise<void> {
    for (const graph of this.graphs.values()) {
      const doc = graph.documents.get(ref);
      if (doc) {
        Object.assign(doc, updates);
        return;
      }
    }
    throw new Error(`Document ${ref} not found`);
  }

  async deleteDocument(ref: DocumentRef): Promise<void> {
    for (const graph of this.graphs.values()) {
      const doc = graph.documents.get(ref);
      if (doc) {
        for (const tag of doc.metadata.tags) {
          this.removeFromIndex(graph.documentIndex, `tag:${tag}`, ref);
        }
        this.removeFromIndex(graph.documentIndex, `access:${doc.metadata.accessLevel}`, ref);
        if (doc.metadata.userId) this.removeFromIndex(graph.documentIndex, `user:${doc.metadata.userId}`, ref);
        graph.documents.delete(ref);
        return;
      }
    }
  }

  async listDocuments(
    namespace: Namespace,
    tenantId: TenantId | undefined,
    filter?: Record<string, unknown>
  ): Promise<{ documents: Document[]; total: number }> {
    const graph = this.getGraph(namespace, tenantId);
    let candidates = Array.from(graph.documents.values());

    if (filter?.tags) {
      candidates = candidates.filter(d => (filter.tags as string[]).some(t => d.metadata.tags.includes(t)));
    }
    if (filter?.accessLevel) {
      candidates = candidates.filter(d => d.metadata.accessLevel === filter.accessLevel);
    }

    const total = candidates.length;
    const offset = (filter?.offset as number) ?? 0;
    const limit = (filter?.limit as number) ?? 50;
    candidates = candidates.slice(offset, offset + limit);

    return { documents: candidates, total };
  }

  // Entity operations
  async upsertEntity(entity: Entity): Promise<EntityRef> {
    const graph = this.getGraph(entity.namespace, entity.tenantId);
    graph.entities.set(entity.id, entity);
    this.addToIndex(graph.entityIndex, `type:${entity.type}`, entity.id);
    return entity.id as EntityRef;
  }

  async getEntity(ref: EntityRef): Promise<Entity | null> {
    for (const graph of this.graphs.values()) {
      const entity = graph.entities.get(ref);
      if (entity) return entity;
    }
    return null;
  }

  async updateEntity(ref: EntityRef, updates: Partial<Entity>): Promise<void> {
    for (const graph of this.graphs.values()) {
      const entity = graph.entities.get(ref);
      if (entity) {
        Object.assign(entity, updates);
        return;
      }
    }
    throw new Error(`Entity ${ref} not found`);
  }

  async deleteEntity(ref: EntityRef): Promise<void> {
    for (const graph of this.graphs.values()) {
      const entity = graph.entities.get(ref);
      if (entity) {
        this.removeFromIndex(graph.entityIndex, `type:${entity.type}`, ref);
        for (const [, relation] of graph.relations) {
          if (relation.sourceEntityId === ref || relation.targetEntityId === ref) {
            graph.relations.delete(relation.id);
          }
        }
        graph.entities.delete(ref);
        return;
      }
    }
  }

  async listEntities(
    namespace: Namespace,
    tenantId: TenantId | undefined,
    filter?: Record<string, unknown>
  ): Promise<{ entities: Entity[]; total: number }> {
    const graph = this.getGraph(namespace, tenantId);
    let candidates = Array.from(graph.entities.values());

    if (filter?.type) {
      candidates = candidates.filter(e => e.type === filter.type);
    }

    const total = candidates.length;
    const offset = (filter?.offset as number) ?? 0;
    const limit = (filter?.limit as number) ?? 50;
    candidates = candidates.slice(offset, offset + limit);

    return { entities: candidates, total };
  }

  // Relation operations
  async upsertRelation(relation: Relation): Promise<RelationRef> {
    const graph = this.getGraph(relation.namespace, relation.tenantId);
    graph.relations.set(relation.id, relation);
    this.addToIndex(graph.relationIndex, `type:${relation.type}`, relation.id);
    this.addToIndex(graph.relationIndex, `source:${relation.sourceEntityId}`, relation.id);
    this.addToIndex(graph.relationIndex, `target:${relation.targetEntityId}`, relation.id);
    return relation.id as RelationRef;
  }

  async getRelation(ref: RelationRef): Promise<Relation | null> {
    for (const graph of this.graphs.values()) {
      const relation = graph.relations.get(ref);
      if (relation) return relation;
    }
    return null;
  }

  async updateRelation(ref: RelationRef, updates: Partial<Relation>): Promise<void> {
    for (const graph of this.graphs.values()) {
      const relation = graph.relations.get(ref);
      if (relation) {
        Object.assign(relation, updates);
        return;
      }
    }
    throw new Error(`Relation ${ref} not found`);
  }

  async deleteRelation(ref: RelationRef): Promise<void> {
    for (const graph of this.graphs.values()) {
      const relation = graph.relations.get(ref);
      if (relation) {
        this.removeFromIndex(graph.relationIndex, `type:${relation.type}`, ref);
        this.removeFromIndex(graph.relationIndex, `source:${relation.sourceEntityId}`, ref);
        this.removeFromIndex(graph.relationIndex, `target:${relation.targetEntityId}`, ref);
        graph.relations.delete(ref);
        return;
      }
    }
  }

  async listRelations(
    namespace: Namespace,
    tenantId: TenantId | undefined,
    filter?: Record<string, unknown>
  ): Promise<{ relations: Relation[]; total: number }> {
    const graph = this.getGraph(namespace, tenantId);
    let candidates = Array.from(graph.relations.values());

    if (filter?.type) {
      candidates = candidates.filter(r => r.type === filter.type);
    }
    if (filter?.sourceEntityId) {
      candidates = candidates.filter(r => r.sourceEntityId === filter.sourceEntityId);
    }
    if (filter?.targetEntityId) {
      candidates = candidates.filter(r => r.targetEntityId === filter.targetEntityId);
    }

    const total = candidates.length;
    const offset = (filter?.offset as number) ?? 0;
    const limit = (filter?.limit as number) ?? 50;
    candidates = candidates.slice(offset, offset + limit);

    return { relations: candidates, total };
  }

  // Retrieval & Search
  async search(request: RetrievalRequest): Promise<RetrievalResult> {
    const graph = this.getGraph(request.namespace, request.tenantId);
    const query = request.query.toLowerCase();
    const limit = request.limit ?? 10;
    const threshold = request.threshold ?? 0.5;

    const chunks: RetrievedChunk[] = [];
    
    for (const doc of graph.documents.values()) {
      if (doc.content.toLowerCase().includes(query)) {
        // Apply access level filter if provided
        if (request.filters?.accessLevels && !request.filters.accessLevels.includes(doc.metadata.accessLevel)) {
          continue;
        }
        const score = Math.min(0.9, 0.5 + Math.random() * 0.4);
        if (score >= threshold) {
          chunks.push({
            document: doc,
            score,
            chunkIndex: 0,
            chunkText: doc.content.slice(0, 500),
          });
        }
      }
    }

    chunks.sort((a, b) => b.score - a.score);

    return {
      chunks: chunks.slice(0, limit),
      entities: [],
      relations: [],
      totalChunks: chunks.length,
      queryTimeMs: Math.floor(Math.random() * 10) + 1,
    };
  }

  async hybridSearch(request: RetrievalRequest & { graphWeight?: number; vectorWeight?: number }): Promise<RetrievalResult> {
    const result = await this.search(request);
    return {
      ...result,
      chunks: result.chunks.map(c => ({ ...c, score: Math.min(1, c.score * 1.1) })),
    };
  }

  // Graph queries
  async queryGraph(query: GraphQuery): Promise<GraphQueryResult> {
    const graph = this.getGraph(query.namespace, query.tenantId);
    const entities = Array.from(graph.entities.values()).filter(e => 
      query.startEntityIds?.some(id => e.id === id)
    ).slice(0, query.limit ?? 10);

    return { entities, relations: [], paths: [] };
  }

  async getEntityNeighbors(
    namespace: Namespace,
    tenantId: TenantId | undefined,
    entityId: string,
    options?: Record<string, unknown>
  ): Promise<{ entities: Entity[]; relations: Relation[] }> {
    const graph = this.getGraph(namespace, tenantId);
    const relations = Array.from(graph.relations.values()).filter(
      r => r.sourceEntityId === entityId || r.targetEntityId === entityId
    );
    
    const neighborIds = new Set<string>();
    for (const r of relations) {
      if (r.sourceEntityId === entityId) neighborIds.add(r.targetEntityId);
      else neighborIds.add(r.sourceEntityId);
    }

    const entities = Array.from(neighborIds)
      .map(id => graph.entities.get(id))
      .filter((e): e is Entity => e !== undefined)
      .slice(0, (options?.limit as number) ?? 50);

    return { entities, relations: relations.slice(0, (options?.limit as number) ?? 50) };
  }

  async getPath(
    namespace: Namespace,
    tenantId: TenantId | undefined,
    sourceEntityId: string,
    targetEntityId: string,
    options?: Record<string, unknown>
  ): Promise<Relation[] | null> {
    const graph = this.getGraph(namespace, tenantId);
    const visited = new Set<string>();
    const queue: { entityId: string; path: Relation[] }[] = [{ entityId: sourceEntityId, path: [] }];
    const maxDepth = (options?.maxDepth as number) ?? 5;
    
    while (queue.length > 0) {
      const { entityId, path } = queue.shift()!;
      if (entityId === targetEntityId) return path;
      if (visited.has(entityId)) continue;
      visited.add(entityId);
      if (path.length >= maxDepth) continue;

      const relations = Array.from(graph.relations.values()).filter(
        r => r.sourceEntityId === entityId || r.targetEntityId === entityId
      );

      for (const r of relations) {
        const nextId = r.sourceEntityId === entityId ? r.targetEntityId : r.sourceEntityId;
        if (!visited.has(nextId)) {
          queue.push({ entityId: nextId, path: [...path, r] });
        }
      }
    }

    return null;
  }

  async getSubgraph(
    namespace: Namespace,
    tenantId: TenantId | undefined,
    entityIds: string[],
    options?: Record<string, unknown>
  ): Promise<{ entities: Entity[]; relations: Relation[] }> {
    const graph = this.getGraph(namespace, tenantId);
    const entities = entityIds.map(id => graph.entities.get(id)).filter((e): e is Entity => e !== undefined);
    const relationSet = new Set<string>();

    for (const e of entities) {
      for (const r of graph.relations.values()) {
        if (r.sourceEntityId === e.id || r.targetEntityId === e.id) {
          relationSet.add(r.id);
        }
      }
    }

    const relations = Array.from(relationSet).map(id => graph.relations.get(id)!).filter(Boolean);
    return { entities, relations };
  }

  // Utilities
  async getStats(namespace: Namespace, tenantId: TenantId | undefined): Promise<{
    documents: number;
    entities: number;
    relations: number;
    storageSizeBytes: number;
  }> {
    const graph = this.getGraph(namespace, tenantId);
    return {
      documents: graph.documents.size,
      entities: graph.entities.size,
      relations: graph.relations.size,
      storageSizeBytes: 0,
    };
  }

  async createIndex(namespace: Namespace, tenantId: TenantId | undefined, indexType: string, config?: Record<string, unknown>): Promise<void> {
    // No-op for mock
  }

  async dropIndex(namespace: Namespace, tenantId: TenantId | undefined, indexType: string): Promise<void> {
    // No-op for mock
  }
}

export default MockProvider;