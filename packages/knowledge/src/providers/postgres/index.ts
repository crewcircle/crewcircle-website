import { Pool, PoolClient, QueryResult } from 'pg';
import type {
  IKnowledgeProvider,
  KnowledgeGraphConfig,
  HealthCheckResult,
  Document,
  DocumentRef,
  DocumentMetadata,
  Entity,
  EntityRef,
  EntityId,
  Relation,
  RelationRef,
  RetrievalRequest,
  RetrievalResult,
  RetrievedChunk,
  GraphQuery,
  GraphQueryResult,
  Namespace,
  TenantId,
} from '../../core/types';

export interface PostgresConfig {
  connectionString: string;
  maxConnections?: number;
  idleTimeoutMs?: number;
  connectionTimeoutMs?: number;
  graphExtension?: 'age' | 'kuzu';
  vectorExtension: 'pgvector';
  rls?: {
    enabled: boolean;
    tenantColumn: string;
    policyName?: string;
  };
}

interface PostgresDocumentRow {
  id: string;
  namespace: string;
  tenant_id: string | null;
  content: string;
  metadata: Record<string, unknown>;
  embedding: number[] | null;
  created_at: Date;
  updated_at: Date;
}

interface PostgresEntityRow {
  id: string;
  namespace: string;
  tenant_id: string | null;
  name: string;
  type: string;
  description: string | null;
  properties: Record<string, unknown>;
  embedding: number[] | null;
  created_at: Date;
  updated_at: Date;
}

interface PostgresRelationRow {
  id: string;
  namespace: string;
  tenant_id: string | null;
  source_entity_id: string;
  target_entity_id: string;
  type: string;
  properties: Record<string, unknown>;
  confidence: number;
  created_at: Date;
  updated_at: Date;
}

export class PostgresProvider implements IKnowledgeProvider {
  readonly name: string;
  readonly type = 'postgres' as const;
  private pool: Pool;
  private config: PostgresConfig;
  private initializedNamespaces = new Set<string>();

  constructor(config: PostgresConfig, name = 'postgres') {
    this.name = name;
    this.config = config;
    this.pool = new Pool({
      connectionString: config.connectionString,
      max: config.maxConnections ?? 20,
      idleTimeoutMillis: config.idleTimeoutMs ?? 30000,
      connectionTimeoutMillis: config.connectionTimeoutMs ?? 5000,
    });
  }

  async initialize(config: KnowledgeGraphConfig): Promise<void> {
    const client = await this.pool.connect();
    try {
      await this.ensureExtensions(client);
      await this.ensureSchema(client, config.namespace);
      if (this.config.rls?.enabled) {
        await this.ensureRlsPolicies(client, config.namespace);
      }
      await this.ensureIndexes(client, config.namespace);
      this.initializedNamespaces.add(config.namespace);
    } finally {
      client.release();
    }
  }

  private async ensureExtensions(client: PoolClient): Promise<void> {
    await client.query('CREATE EXTENSION IF NOT EXISTS vector');
    if (this.config.graphExtension === 'age') {
      await client.query('CREATE EXTENSION IF NOT EXISTS age');
      await client.query('LOAD \'age\'');
      await client.query('SET search_path = ag_catalog, "$user", public');
    }
  }

  private async ensureSchema(client: PoolClient, namespace: string): Promise<void> {
    const safeNs = namespace.replace(/[^a-zA-Z0-9_]/g, '_');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${safeNs}_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        namespace TEXT NOT NULL,
        tenant_id TEXT,
        content TEXT NOT NULL,
        metadata JSONB NOT NULL DEFAULT '{}',
        embedding vector(1536),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS ${safeNs}_entities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        namespace TEXT NOT NULL,
        tenant_id TEXT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        properties JSONB NOT NULL DEFAULT '{}',
        embedding vector(1536),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS ${safeNs}_relations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        namespace TEXT NOT NULL,
        tenant_id TEXT,
        source_entity_id UUID NOT NULL REFERENCES ${safeNs}_entities(id) ON DELETE CASCADE,
        target_entity_id UUID NOT NULL REFERENCES ${safeNs}_entities(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        properties JSONB NOT NULL DEFAULT '{}',
        confidence DOUBLE PRECISION NOT NULL DEFAULT 1.0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    // Graph extension tables (Apache AGE)
    if (this.config.graphExtension === 'age') {
      await client.query(`
        SELECT create_graph('${safeNs}_graph')
      `).catch(() => {}); // Graph may already exist
    }
  }

  private async ensureRlsPolicies(client: PoolClient, namespace: string): Promise<void> {
    if (!this.config.rls?.enabled) return;
    
    const safeNs = namespace.replace(/[^a-zA-Z0-9_]/g, '_');
    const { tenantColumn, policyName = 'tenant_isolation' } = this.config.rls;

    const tables = ['documents', 'entities', 'relations'];
    for (const table of tables) {
      await client.query(`
        ALTER TABLE ${safeNs}_${table} ENABLE ROW LEVEL SECURITY
      `);

      await client.query(`
        DROP POLICY IF EXISTS ${policyName} ON ${safeNs}_${table}
      `);

      await client.query(`
        CREATE POLICY ${policyName} ON ${safeNs}_${table}
        USING (${tenantColumn} = current_setting('app.current_tenant', true))
        WITH CHECK (${tenantColumn} = current_setting('app.current_tenant', true))
      `);
    }
  }

  private async ensureIndexes(client: PoolClient, namespace: string): Promise<void> {
    const safeNs = namespace.replace(/[^a-zA-Z0-9_]/g, '_');
    
    // Vector index for documents
    await client.query(`
      CREATE INDEX IF NOT EXISTS ${safeNs}_documents_embedding_idx 
      ON ${safeNs}_documents USING hnsw (embedding vector_cosine_ops)
    `).catch(() => {}); // hnsw may not be available

    await client.query(`
      CREATE INDEX IF NOT EXISTS ${safeNs}_documents_embedding_ivfflat_idx 
      ON ${safeNs}_documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)
    `).catch(() => {});

    // Vector index for entities
    await client.query(`
      CREATE INDEX IF NOT EXISTS ${safeNs}_entities_embedding_idx 
      ON ${safeNs}_entities USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)
    `).catch(() => {});

    // Standard indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS ${safeNs}_documents_namespace_tenant_idx 
      ON ${safeNs}_documents (namespace, tenant_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS ${safeNs}_entities_namespace_tenant_idx 
      ON ${safeNs}_entities (namespace, tenant_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS ${safeNs}_relations_namespace_tenant_idx 
      ON ${safeNs}_relations (namespace, tenant_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS ${safeNs}_relations_source_target_idx 
      ON ${safeNs}_relations (source_entity_id, target_entity_id)
    `);
  }

  async shutdown(): Promise<void> {
    await this.pool.end();
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const client = await this.pool.connect();
      try {
        await client.query('SELECT 1');
        return { healthy: true, latencyMs: Date.now() - start };
      } finally {
        client.release();
      }
    } catch {
      return { healthy: false, latencyMs: Date.now() - start };
    }
  }

  private setTenantContext(client: PoolClient, tenantId?: TenantId): Promise<void> {
    if (tenantId && this.config.rls?.enabled) {
      return client.query(`SET LOCAL app.current_tenant = $1`, [tenantId]).then(() => {});
    }
    return Promise.resolve();
  }

  private clearTenantContext(client: PoolClient): Promise<void> {
    if (this.config.rls?.enabled) {
      return client.query(`RESET app.current_tenant`).then(() => {});
    }
    return Promise.resolve();
  }

  private rowToDocument(row: PostgresDocumentRow): Document {
    return {
      id: row.id as DocumentRef,
      namespace: row.namespace as Namespace,
      tenantId: row.tenant_id as TenantId | undefined,
      content: row.content,
      metadata: row.metadata as unknown as DocumentMetadata,
      embedding: row.embedding ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private rowToEntity(row: PostgresEntityRow): Entity {
    return {
      id: row.id as EntityRef,
      namespace: row.namespace as Namespace,
      tenantId: row.tenant_id as TenantId | undefined,
      name: row.name,
      type: row.type as Entity['type'],
      description: row.description ?? undefined,
      properties: row.properties,
      embedding: row.embedding ?? undefined,
      metadata: row.properties as unknown as DocumentMetadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private rowToRelation(row: PostgresRelationRow): Relation {
    return {
      id: row.id as RelationRef,
      namespace: row.namespace as Namespace,
      tenantId: row.tenant_id as TenantId | undefined,
      sourceEntityId: row.source_entity_id as EntityRef,
      targetEntityId: row.target_entity_id as EntityRef,
      type: row.type as Relation['type'],
      properties: row.properties,
      confidence: row.confidence,
      metadata: row.properties as unknown as DocumentMetadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  // Document operations
  async ingestDocument(doc: Document): Promise<DocumentRef> {
    const client = await this.pool.connect();
    try {
      await this.setTenantContext(client, doc.tenantId);
      const safeNs = doc.namespace.replace(/[^a-zA-Z0-9_]/g, '_');
      
      const result = await client.query<{ id: string }>(`
        INSERT INTO ${safeNs}_documents (id, namespace, tenant_id, content, metadata, embedding)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          content = EXCLUDED.content,
          metadata = EXCLUDED.metadata,
          embedding = EXCLUDED.embedding,
          updated_at = now()
        RETURNING id
      `, [
        doc.id,
        doc.namespace,
        doc.tenantId ?? null,
        doc.content,
        JSON.stringify(doc.metadata),
        doc.embedding ? `[${doc.embedding.join(',')}]` : null,
      ]);
      
      return result.rows[0].id as DocumentRef;
    } finally {
      await this.clearTenantContext(client);
      client.release();
    }
  }

  async getDocument(ref: DocumentRef): Promise<Document | null> {
    const client = await this.pool.connect();
    try {
      // We need namespace to query - ref should include it or we search all
      const result = await client.query<PostgresDocumentRow>(`
        SELECT * FROM documents WHERE id = $1
      `, [ref]);
      
      return result.rows[0] ? this.rowToDocument(result.rows[0]) : null;
    } finally {
      client.release();
    }
  }

  async updateDocument(ref: DocumentRef, updates: Partial<Document>): Promise<void> {
    const client = await this.pool.connect();
    try {
      const setParts: string[] = [];
      const values: unknown[] = [];
      let paramIdx = 1;

      if (updates.content !== undefined) {
        setParts.push(`content = $${paramIdx++}`);
        values.push(updates.content);
      }
      if (updates.metadata !== undefined) {
        setParts.push(`metadata = $${paramIdx++}`);
        values.push(JSON.stringify(updates.metadata));
      }
      if (updates.embedding !== undefined) {
        setParts.push(`embedding = $${paramIdx++}`);
        values.push(updates.embedding ? `[${updates.embedding.join(',')}]` : null);
      }
      if (updates.tenantId !== undefined) {
        setParts.push(`tenant_id = $${paramIdx++}`);
        values.push(updates.tenantId);
      }

      setParts.push(`updated_at = now()`);
      values.push(ref);

      if (setParts.length > 1) {
        // Need namespace for table name - fallback to search all
        await client.query(`
          UPDATE documents SET ${setParts.join(', ')} WHERE id = $${paramIdx}
        `, values);
      }
    } finally {
      client.release();
    }
  }

  async deleteDocument(ref: DocumentRef): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(`DELETE FROM documents WHERE id = $1`, [ref]);
    } finally {
      client.release();
    }
  }

  async listDocuments(
    namespace: Namespace,
    tenantId: TenantId | undefined,
    filter?: Record<string, unknown>
  ): Promise<{ documents: Document[]; total: number }> {
    const client = await this.pool.connect();
    try {
      await this.setTenantContext(client, tenantId);
      const safeNs = namespace.replace(/[^a-zA-Z0-9_]/g, '_');
      
      let where = 'WHERE namespace = $1';
      const params: unknown[] = [namespace];
      let paramIdx = 2;

      if (tenantId) {
        where += ` AND tenant_id = $${paramIdx++}`;
        params.push(tenantId);
      }
      if (filter?.tags) {
        where += ` AND metadata->'tags' @> $${paramIdx++}`;
        params.push(JSON.stringify(filter.tags));
      }
      if (filter?.accessLevel) {
        where += ` AND metadata->>'accessLevel' = $${paramIdx++}`;
        params.push(filter.accessLevel);
      }

      const limit = (filter?.limit as number) ?? 50;
      const offset = (filter?.offset as number) ?? 0;

      const [dataResult, countResult] = await Promise.all([
        client.query<PostgresDocumentRow>(`
          SELECT * FROM ${safeNs}_documents ${where}
          ORDER BY created_at DESC
          LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
        `, [...params, limit, offset]),
        client.query<{ count: string }>(`
          SELECT COUNT(*) FROM ${safeNs}_documents ${where}
        `, params),
      ]);

      return {
        documents: dataResult.rows.map(r => this.rowToDocument(r)),
        total: parseInt(countResult.rows[0].count, 10),
      };
    } finally {
      await this.clearTenantContext(client);
      client.release();
    }
  }

  // Entity operations
  async upsertEntity(entity: Entity): Promise<EntityRef> {
    const client = await this.pool.connect();
    try {
      await this.setTenantContext(client, entity.tenantId);
      const safeNs = entity.namespace.replace(/[^a-zA-Z0-9_]/g, '_');
      
      const result = await client.query<{ id: string }>(`
        INSERT INTO ${safeNs}_entities (id, namespace, tenant_id, name, type, description, properties, embedding)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          type = EXCLUDED.type,
          description = EXCLUDED.description,
          properties = EXCLUDED.properties,
          embedding = EXCLUDED.embedding,
          updated_at = now()
        RETURNING id
      `, [
        entity.id,
        entity.namespace,
        entity.tenantId ?? null,
        entity.name,
        entity.type,
        entity.description ?? null,
        JSON.stringify(entity.properties),
        entity.embedding ? `[${entity.embedding.join(',')}]` : null,
      ]);
      
      return result.rows[0].id as EntityRef;
    } finally {
      await this.clearTenantContext(client);
      client.release();
    }
  }

  async getEntity(ref: EntityRef): Promise<Entity | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.query<PostgresEntityRow>(`
        SELECT * FROM entities WHERE id = $1
      `, [ref]);
      
      return result.rows[0] ? this.rowToEntity(result.rows[0]) : null;
    } finally {
      client.release();
    }
  }

  async updateEntity(ref: EntityRef, updates: Partial<Entity>): Promise<void> {
    const client = await this.pool.connect();
    try {
      const setParts: string[] = [];
      const values: unknown[] = [];
      let paramIdx = 1;

      if (updates.name !== undefined) { setParts.push(`name = $${paramIdx++}`); values.push(updates.name); }
      if (updates.type !== undefined) { setParts.push(`type = $${paramIdx++}`); values.push(updates.type); }
      if (updates.description !== undefined) { setParts.push(`description = $${paramIdx++}`); values.push(updates.description); }
      if (updates.properties !== undefined) { setParts.push(`properties = $${paramIdx++}`); values.push(JSON.stringify(updates.properties)); }
      if (updates.embedding !== undefined) { setParts.push(`embedding = $${paramIdx++}`); values.push(updates.embedding ? `[${updates.embedding.join(',')}]` : null); }

      setParts.push(`updated_at = now()`);
      values.push(ref);

      if (setParts.length > 1) {
        await client.query(`UPDATE entities SET ${setParts.join(', ')} WHERE id = $${paramIdx}`, values);
      }
    } finally {
      client.release();
    }
  }

  async deleteEntity(ref: EntityRef): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(`DELETE FROM entities WHERE id = $1`, [ref]);
    } finally {
      client.release();
    }
  }

  async listEntities(
    namespace: Namespace,
    tenantId: TenantId | undefined,
    filter?: Record<string, unknown>
  ): Promise<{ entities: Entity[]; total: number }> {
    const client = await this.pool.connect();
    try {
      await this.setTenantContext(client, tenantId);
      const safeNs = namespace.replace(/[^a-zA-Z0-9_]/g, '_');
      
      let where = 'WHERE namespace = $1';
      const params: unknown[] = [namespace];
      let paramIdx = 2;

      if (tenantId) { where += ` AND tenant_id = $${paramIdx++}`; params.push(tenantId); }
      if (filter?.type) { where += ` AND type = $${paramIdx++}`; params.push(filter.type); }
      if (filter?.name) { where += ` AND name ILIKE $${paramIdx++}`; params.push(`%${filter.name}%`); }

      const limit = (filter?.limit as number) ?? 50;
      const offset = (filter?.offset as number) ?? 0;

      const [dataResult, countResult] = await Promise.all([
        client.query<PostgresEntityRow>(`
          SELECT * FROM ${safeNs}_entities ${where}
          ORDER BY created_at DESC
          LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
        `, [...params, limit, offset]),
        client.query<{ count: string }>(`
          SELECT COUNT(*) FROM ${safeNs}_entities ${where}
        `, params),
      ]);

      return {
        entities: dataResult.rows.map(r => this.rowToEntity(r)),
        total: parseInt(countResult.rows[0].count, 10),
      };
    } finally {
      await this.clearTenantContext(client);
      client.release();
    }
  }

  // Relation operations
  async upsertRelation(relation: Relation): Promise<RelationRef> {
    const client = await this.pool.connect();
    try {
      await this.setTenantContext(client, relation.tenantId);
      const safeNs = relation.namespace.replace(/[^a-zA-Z0-9_]/g, '_');
      
      const result = await client.query<{ id: string }>(`
        INSERT INTO ${safeNs}_relations (id, namespace, tenant_id, source_entity_id, target_entity_id, type, properties, confidence)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          type = EXCLUDED.type,
          properties = EXCLUDED.properties,
          confidence = EXCLUDED.confidence,
          updated_at = now()
        RETURNING id
      `, [
        relation.id,
        relation.namespace,
        relation.tenantId ?? null,
        relation.sourceEntityId,
        relation.targetEntityId,
        relation.type,
        JSON.stringify(relation.properties),
        relation.confidence,
      ]);
      
      return result.rows[0].id as RelationRef;
    } finally {
      await this.clearTenantContext(client);
      client.release();
    }
  }

  async getRelation(ref: RelationRef): Promise<Relation | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.query<PostgresRelationRow>(`
        SELECT * FROM relations WHERE id = $1
      `, [ref]);
      
      return result.rows[0] ? this.rowToRelation(result.rows[0]) : null;
    } finally {
      client.release();
    }
  }

  async updateRelation(ref: RelationRef, updates: Partial<Relation>): Promise<void> {
    const client = await this.pool.connect();
    try {
      const setParts: string[] = [];
      const values: unknown[] = [];
      let paramIdx = 1;

      if (updates.type !== undefined) { setParts.push(`type = $${paramIdx++}`); values.push(updates.type); }
      if (updates.properties !== undefined) { setParts.push(`properties = $${paramIdx++}`); values.push(JSON.stringify(updates.properties)); }
      if (updates.confidence !== undefined) { setParts.push(`confidence = $${paramIdx++}`); values.push(updates.confidence); }

      setParts.push(`updated_at = now()`);
      values.push(ref);

      if (setParts.length > 1) {
        await client.query(`UPDATE relations SET ${setParts.join(', ')} WHERE id = $${paramIdx}`, values);
      }
    } finally {
      client.release();
    }
  }

  async deleteRelation(ref: RelationRef): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(`DELETE FROM relations WHERE id = $1`, [ref]);
    } finally {
      client.release();
    }
  }

  async listRelations(
    namespace: Namespace,
    tenantId: TenantId | undefined,
    filter?: Record<string, unknown>
  ): Promise<{ relations: Relation[]; total: number }> {
    const client = await this.pool.connect();
    try {
      await this.setTenantContext(client, tenantId);
      const safeNs = namespace.replace(/[^a-zA-Z0-9_]/g, '_');
      
      let where = 'WHERE namespace = $1';
      const params: unknown[] = [namespace];
      let paramIdx = 2;

      if (tenantId) { where += ` AND tenant_id = $${paramIdx++}`; params.push(tenantId); }
      if (filter?.type) { where += ` AND type = $${paramIdx++}`; params.push(filter.type); }
      if (filter?.sourceEntityId) { where += ` AND source_entity_id = $${paramIdx++}`; params.push(filter.sourceEntityId); }
      if (filter?.targetEntityId) { where += ` AND target_entity_id = $${paramIdx++}`; params.push(filter.targetEntityId); }

      const limit = (filter?.limit as number) ?? 50;
      const offset = (filter?.offset as number) ?? 0;

      const [dataResult, countResult] = await Promise.all([
        client.query<PostgresRelationRow>(`
          SELECT * FROM ${safeNs}_relations ${where}
          ORDER BY created_at DESC
          LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
        `, [...params, limit, offset]),
        client.query<{ count: string }>(`
          SELECT COUNT(*) FROM ${safeNs}_relations ${where}
        `, params),
      ]);

      return {
        relations: dataResult.rows.map(r => this.rowToRelation(r)),
        total: parseInt(countResult.rows[0].count, 10),
      };
    } finally {
      await this.clearTenantContext(client);
      client.release();
    }
  }

  // Retrieval
  async search(request: RetrievalRequest): Promise<RetrievalResult> {
    const client = await this.pool.connect();
    try {
      await this.setTenantContext(client, request.tenantId);
      const safeNs = request.namespace.replace(/[^a-zA-Z0-9_]/g, '_');
      
      // This requires embedding to be pre-computed or generated externally
      // In practice, you'd generate embedding from request.query first
      const embedding = request.embedding ?? [];
      
      if (embedding.length === 0) {
        // Fallback to keyword search
        return this.keywordSearch(client, safeNs, request);
      }

      const vectorStr = `[${embedding.join(',')}]`;
      const limit = request.limit ?? 10;
      const threshold = request.threshold ?? 0.7;

      let where = 'WHERE namespace = $1 AND embedding IS NOT NULL';
      const params: unknown[] = [request.namespace, vectorStr, threshold, limit];
      let paramIdx = 5;

      if (request.tenantId) { where += ` AND tenant_id = $${paramIdx++}`; params.splice(2, 0, request.tenantId); }
      if (request.filters?.accessLevels?.length) {
        where += ` AND metadata->>'accessLevel' = ANY($${paramIdx++})`;
        params.push(request.filters.accessLevels);
      }

      const result = await client.query<PostgresDocumentRow & { similarity: number }>(`
        SELECT *, 1 - (embedding <=> $2) AS similarity
        FROM ${safeNs}_documents ${where}
        AND 1 - (embedding <=> $2) > $3
        ORDER BY embedding <=> $2
        LIMIT $4
      `, params);

      const chunks: RetrievedChunk[] = result.rows.map(row => ({
        document: this.rowToDocument(row),
        score: row.similarity,
        chunkIndex: 0,
        chunkText: row.content,
      }));

      return {
        chunks,
        entities: [],
        relations: [],
        totalChunks: chunks.length,
        queryTimeMs: 0,
      };
    } finally {
      await this.clearTenantContext(client);
      client.release();
    }
  }

  private async keywordSearch(
    client: PoolClient,
    safeNs: string,
    request: RetrievalRequest
  ): Promise<RetrievalResult> {
    const limit = request.limit ?? 10;
    const query = request.query;
    
    let where = 'WHERE namespace = $1';
    const params: unknown[] = [request.namespace, `%${query}%`, limit];
    let paramIdx = 4;

    if (request.tenantId) { where += ` AND tenant_id = $${paramIdx++}`; params.splice(2, 0, request.tenantId); }

    const result = await client.query<PostgresDocumentRow>(`
      SELECT * FROM ${safeNs}_documents ${where}
      AND content ILIKE $${paramIdx - 2}
      ORDER BY created_at DESC
      LIMIT $${paramIdx - 1}
    `, params);

    const chunks: RetrievedChunk[] = result.rows.map(row => ({
      document: this.rowToDocument(row),
      score: 0.5, // Mock score for keyword match
      chunkIndex: 0,
      chunkText: row.content,
    }));

    return { chunks, entities: [], relations: [], totalChunks: chunks.length, queryTimeMs: 0 };
  }

  async hybridSearch(request: RetrievalRequest & { graphWeight?: number; vectorWeight?: number }): Promise<RetrievalResult> {
    const vectorResult = await this.search(request);
    
    // Also get graph context for top entities
    if (request.includeGraph && vectorResult.chunks.length > 0) {
      const entityIds = [...new Set(vectorResult.chunks.flatMap(c => 
        c.matchedEntities?.map(e => e.id) ?? []
      ))];
      
      if (entityIds.length > 0) {
        const graphResult = await this.queryGraph({
          namespace: request.namespace,
          tenantId: request.tenantId,
          startEntityIds: entityIds,
          maxDepth: request.graphDepth ?? 2,
        });
        
        return {
          ...vectorResult,
          entities: graphResult.entities,
          relations: graphResult.relations,
        };
      }
    }
    
    return vectorResult;
  }

  // Graph queries
  async queryGraph(query: GraphQuery): Promise<GraphQueryResult> {
    const client = await this.pool.connect();
    try {
      await this.setTenantContext(client, query.tenantId);
      const safeNs = query.namespace.replace(/[^a-zA-Z0-9_]/g, '_');
      
      // For AGE, use Cypher; for now use recursive SQL
      const startIds = query.startEntityIds ?? [];
      const maxDepth = query.maxDepth ?? 3;
      const relationTypes = query.relationTypes?.join("','") ?? '';
      
      let relationFilter = '';
      if (relationTypes) {
        relationFilter = `AND r.type IN ('${relationTypes}')`;
      }

      // Recursive CTE for graph traversal
      const result = await client.query(`
        WITH RECURSIVE traversal AS (
          SELECT e.*, 0 as depth, ARRAY[]::uuid[] as path
          FROM ${safeNs}_entities e
          WHERE e.id = ANY($1) AND e.namespace = $2
          
          UNION ALL
          
          SELECT e.*, t.depth + 1, t.path || r.id
          FROM ${safeNs}_entities e
          JOIN ${safeNs}_relations r ON r.target_entity_id = e.id
          JOIN traversal t ON t.id = r.source_entity_id
          WHERE t.depth < $3
          AND e.namespace = $2
          ${relationFilter}
          AND NOT r.id = ANY(t.path)
        )
        SELECT DISTINCT ON (e.id) e.*, t.depth
        FROM traversal t
        JOIN ${safeNs}_entities e ON e.id = t.id
        WHERE e.namespace = $2
      `, [startIds, query.namespace, maxDepth]);

      const entities = result.rows.map(r => this.rowToEntity(r));
      
      // Get relations between these entities
      const entityIds = entities.map(e => e.id);
      const relationsResult = await client.query<PostgresRelationRow>(`
        SELECT * FROM ${safeNs}_relations
        WHERE source_entity_id = ANY($1) AND target_entity_id = ANY($1)
        AND namespace = $2
      `, [entityIds, query.namespace]);

      const relations = relationsResult.rows.map(r => this.rowToRelation(r));

      return { entities, relations, paths: [] };
    } finally {
      await this.clearTenantContext(client);
      client.release();
    }
  }

  async getEntityNeighbors(
    namespace: Namespace,
    tenantId: TenantId | undefined,
    entityId: string,
    options?: Record<string, unknown>
  ): Promise<{ entities: Entity[]; relations: Relation[] }> {
    return this.queryGraph({
      namespace,
      tenantId,
      startEntityIds: [entityId as EntityId],
      maxDepth: (options?.depth as number) ?? 1,
      relationTypes: options?.relationTypes as Relation['type'][],
    });
  }

  async getPath(
    namespace: Namespace,
    tenantId: TenantId | undefined,
    sourceEntityId: string,
    targetEntityId: string,
    options?: Record<string, unknown>
  ): Promise<Relation[] | null> {
    const client = await this.pool.connect();
    try {
      await this.setTenantContext(client, tenantId);
      const safeNs = namespace.replace(/[^a-zA-Z0-9_]/g, '_');
      const maxDepth = (options?.maxDepth as number) ?? 5;
      
      const result = await client.query(`
        WITH RECURSIVE path_search AS (
          SELECT r.*, ARRAY[r.id] as path, 1 as depth
          FROM ${safeNs}_relations r
          WHERE r.source_entity_id = $1 AND r.namespace = $2
          
          UNION ALL
          
          SELECT r.*, ps.path || r.id, ps.depth + 1
          FROM ${safeNs}_relations r
          JOIN path_search ps ON ps.target_entity_id = r.source_entity_id
          WHERE ps.depth < $3
          AND r.namespace = $2
          AND NOT r.id = ANY(ps.path)
        )
        SELECT * FROM path_search
        WHERE target_entity_id = $4
        ORDER BY depth ASC
        LIMIT 1
      `, [sourceEntityId, namespace, maxDepth, targetEntityId]);

      if (result.rows.length === 0) return null;
      
      // Reconstruct full path
      const path = result.rows[0].path as string[];
      const relationsResult = await client.query<PostgresRelationRow>(`
        SELECT * FROM ${safeNs}_relations WHERE id = ANY($1)
      `, [path]);

      return relationsResult.rows.map(r => this.rowToRelation(r));
    } finally {
      await this.clearTenantContext(client);
      client.release();
    }
  }

  async getSubgraph(
    namespace: Namespace,
    tenantId: TenantId | undefined,
    entityIds: string[],
    options?: Record<string, unknown>
  ): Promise<{ entities: Entity[]; relations: Relation[] }> {
    const client = await this.pool.connect();
    try {
      await this.setTenantContext(client, tenantId);
      const safeNs = namespace.replace(/[^a-zA-Z0-9_]/g, '_');
      const depth = (options?.depth as number) ?? 1;
      
      const entitiesResult = await client.query<PostgresEntityRow>(`
        WITH RECURSIVE subgraph_entities AS (
          SELECT e.*, 0 as depth FROM ${safeNs}_entities e WHERE e.id = ANY($1) AND e.namespace = $2
          UNION ALL
          SELECT e.*, se.depth + 1
          FROM ${safeNs}_entities e
          JOIN ${safeNs}_relations r ON r.target_entity_id = e.id
          JOIN subgraph_entities se ON se.id = r.source_entity_id
          WHERE se.depth < $3 AND e.namespace = $2
        )
        SELECT DISTINCT ON (e.id) e.* FROM subgraph_entities e
      `, [entityIds, namespace, depth]);

      const entities = entitiesResult.rows.map(r => this.rowToEntity(r));
      const foundEntityIds = entities.map(e => e.id);

      const relationsResult = await client.query<PostgresRelationRow>(`
        SELECT * FROM ${safeNs}_relations
        WHERE source_entity_id = ANY($1) AND target_entity_id = ANY($1)
        AND namespace = $2
      `, [foundEntityIds, namespace]);

      const relations = relationsResult.rows.map(r => this.rowToRelation(r));

      return { entities, relations };
    } finally {
      await this.clearTenantContext(client);
      client.release();
    }
  }

  // Utilities
  async getStats(namespace: Namespace, tenantId: TenantId | undefined): Promise<{
    documents: number;
    entities: number;
    relations: number;
    storageSizeBytes: number;
  }> {
    const client = await this.pool.connect();
    try {
      await this.setTenantContext(client, tenantId);
      const safeNs = namespace.replace(/[^a-zA-Z0-9_]/g, '_');
      
      const [docCount, entityCount, relCount, sizeResult] = await Promise.all([
        client.query<{ count: string }>(`SELECT COUNT(*) FROM ${safeNs}_documents WHERE namespace = $1`, [namespace]),
        client.query<{ count: string }>(`SELECT COUNT(*) FROM ${safeNs}_entities WHERE namespace = $1`, [namespace]),
        client.query<{ count: string }>(`SELECT COUNT(*) FROM ${safeNs}_relations WHERE namespace = $1`, [namespace]),
        client.query<{ size: string }>(`
          SELECT pg_total_relation_size('${safeNs}_documents') + 
                 pg_total_relation_size('${safeNs}_entities') + 
                 pg_total_relation_size('${safeNs}_relations') as size
        `),
      ]);

      return {
        documents: parseInt(docCount.rows[0].count, 10),
        entities: parseInt(entityCount.rows[0].count, 10),
        relations: parseInt(relCount.rows[0].count, 10),
        storageSizeBytes: parseInt(sizeResult.rows[0].size, 10),
      };
    } finally {
      await this.clearTenantContext(client);
      client.release();
    }
  }

  async createIndex(namespace: Namespace, tenantId: TenantId | undefined, indexType: string, config?: Record<string, unknown>): Promise<void> {
    const client = await this.pool.connect();
    try {
      const safeNs = namespace.replace(/[^a-zA-Z0-9_]/g, '_');
      
      if (indexType === 'vector') {
        await client.query(`
          CREATE INDEX IF NOT EXISTS ${safeNs}_documents_embedding_hnsw_idx 
          ON ${safeNs}_documents USING hnsw (embedding vector_cosine_ops)
          WITH (m = 16, ef_construction = 64)
        `).catch(() => {}); // hnsw may not be available
      }
    } finally {
      client.release();
    }
  }

  async dropIndex(namespace: Namespace, tenantId: TenantId | undefined, indexType: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      const safeNs = namespace.replace(/[^a-zA-Z0-9_]/g, '_');
      
      if (indexType === 'vector') {
        await client.query(`DROP INDEX IF EXISTS ${safeNs}_documents_embedding_hnsw_idx`);
        await client.query(`DROP INDEX IF EXISTS ${safeNs}_documents_embedding_ivfflat_idx`);
        await client.query(`DROP INDEX IF EXISTS ${safeNs}_entities_embedding_ivfflat_idx`);
      }
    } finally {
      client.release();
    }
  }
}

export function createPostgresProvider(config: PostgresConfig, name?: string): PostgresProvider {
  return new PostgresProvider(config, name);
}