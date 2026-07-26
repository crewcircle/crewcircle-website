import { describe, it, expect } from 'vitest';
import type {
  KnowledgeGraphConfig,
  Document,
  Entity,
  Relation,
  RetrievalRequest,
  RetrievalResult,
  GraphQuery,
  GraphQueryResult,
  HealthCheckResult,
  IKnowledgeProvider,
  Namespace,
  TenantId,
  DocumentRef,
  EntityRef,
  RelationRef,
  RetrievedChunk,
  SyncJob,
  SyncStatus,
  AISDKConfig,
  EmbeddingOptions,
  RerankOptions,
  KnowledgeGraphStats,
  ProviderConfig,
  EmbeddedProviderConfig,
  PostgresProviderConfig,
  MockProviderConfig,
} from '../src/core/types';

describe('Core Types', () => {
  it('should allow valid KnowledgeGraphConfig', () => {
    const config: KnowledgeGraphConfig = {
      namespace: 'test',
      tenantId: 'tenant-1',
      provider: 'mock',
      embeddingModel: 'text-embedding-3-small',
      dimensions: 1536,
    };
    expect(config.namespace).toBe('test');
    expect(config.provider).toBe('mock');
  });

  it('should allow valid Document', () => {
    const doc: Document = {
      id: 'doc-1' as DocumentRef,
      namespace: 'test' as Namespace,
      tenantId: 'tenant-1' as TenantId,
      content: 'Test content',
      metadata: { tags: ['test'], accessLevel: 'public' },
      embedding: new Array(1536).fill(0.1),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(doc.content).toBe('Test content');
    expect(doc.embedding).toHaveLength(1536);
  });

  it('should allow valid Entity', () => {
    const entity: Entity = {
      id: 'ent-1' as EntityRef,
      namespace: 'test' as Namespace,
      tenantId: 'tenant-1' as TenantId,
      name: 'Test Entity',
      type: 'Concept',
      description: 'A test entity',
      properties: { key: 'value' },
      embedding: new Array(1536).fill(0.1),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(entity.name).toBe('Test Entity');
    expect(entity.type).toBe('Concept');
  });

  it('should allow valid Relation', () => {
    const relation: Relation = {
      id: 'rel-1' as RelationRef,
      namespace: 'test' as Namespace,
      tenantId: 'tenant-1' as TenantId,
      sourceEntityId: 'ent-1' as EntityRef,
      targetEntityId: 'ent-2' as EntityRef,
      type: 'RELATES_TO',
      properties: { confidence: 0.9 },
      confidence: 0.9,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(relation.type).toBe('RELATES_TO');
    expect(relation.confidence).toBe(0.9);
  });

  it('should allow valid RetrievalRequest', () => {
    const request: RetrievalRequest = {
      query: 'test query',
      namespace: 'test' as Namespace,
      tenantId: 'tenant-1' as TenantId,
      limit: 10,
      threshold: 0.7,
      includeGraph: true,
      graphDepth: 2,
      filters: { accessLevels: ['public', 'internal'] },
    };
    expect(request.query).toBe('test query');
    expect(request.limit).toBe(10);
  });

  it('should allow valid RetrievalResult', () => {
    const result: RetrievalResult = {
      chunks: [{
        document: {} as Document,
        score: 0.9,
        chunkIndex: 0,
        chunkText: 'chunk content',
      }],
      entities: [],
      relations: [],
      totalChunks: 1,
      queryTimeMs: 50,
    };
    expect(result.chunks).toHaveLength(1);
    expect(result.queryTimeMs).toBe(50);
  });

  it('should allow valid GraphQuery', () => {
    const query: GraphQuery = {
      namespace: 'test' as Namespace,
      tenantId: 'tenant-1' as TenantId,
      startEntityIds: ['ent-1' as EntityRef],
      maxDepth: 3,
      relationTypes: ['RELATES_TO', 'CONTAINS'],
    };
    expect(query.maxDepth).toBe(3);
    expect(query.relationTypes).toHaveLength(2);
  });

  it('should allow valid HealthCheckResult', () => {
    const healthy: HealthCheckResult = { healthy: true, latencyMs: 10 };
    const unhealthy: HealthCheckResult = { healthy: false, latencyMs: 0, error: 'Connection refused' };
    expect(healthy.healthy).toBe(true);
    expect(unhealthy.error).toBe('Connection refused');
  });

  it('should allow valid SyncJob', () => {
    const job: SyncJob = {
      id: 'sync-1',
      namespace: 'test' as Namespace,
      status: 'running' as SyncStatus,
      source: 'github',
      startedAt: new Date(),
      stats: { documentsProcessed: 10, entitiesExtracted: 5, relationsExtracted: 3 },
    };
    expect(job.status).toBe('running');
    expect(job.stats.documentsProcessed).toBe(10);
  });

  it('should allow valid AISDKConfig', () => {
    const config: AISDKConfig = {
      provider: 'openai',
      embeddingModel: 'text-embedding-3-small',
      rerankModel: 'rerank-3',
      apiKey: 'sk-test',
      maxTokens: 8192,
      temperature: 0.1,
    };
    expect(config.provider).toBe('openai');
    expect(config.temperature).toBe(0.1);
  });

  it('should allow valid ProviderConfig variants', () => {
    const mockConfig: MockProviderConfig = { type: 'mock', name: 'test-mock', seed: 42 };
    const embeddedConfig: EmbeddedProviderConfig = {
      type: 'embedded',
      name: 'test-embedded',
      pythonPath: 'python3',
      scriptPath: '/path/to/embedded.py',
      workingDir: '/tmp/cognee',
    };
    const pgConfig: PostgresProviderConfig = {
      type: 'postgres',
      name: 'test-postgres',
      connectionString: 'postgresql://user:pass@localhost/db',
      graphExtension: 'age',
      vectorExtension: 'pgvector',
      rls: { enabled: true, tenantColumn: 'tenant_id' },
    };

    expect(mockConfig.type).toBe('mock');
    expect(embeddedConfig.type).toBe('embedded');
    expect(pgConfig.type).toBe('postgres');
    expect(pgConfig.rls?.enabled).toBe(true);
  });
});