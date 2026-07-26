import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
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
  RetrievedChunk, 
  GraphQuery, 
  GraphQueryResult, 
  ProviderConfig,
  Namespace,
  TenantId 
} from '../../core/types';

export interface EmbeddedConfig {
  dataDir: string;
  pythonPath: string;
  cogneeConfig?: Record<string, unknown>;
}

interface PythonRequest {
  id: number;
  method: string;
  params: unknown[];
}

interface PythonResponse {
  id?: number;
  method?: string;
  params?: unknown[];
  result?: unknown;
  error?: { message: string; code: number };
}

export class EmbeddedBridge extends EventEmitter {
  private process: ChildProcess | null = null;
  private requestId = 0;
  private pendingRequests = new Map<number, { resolve: (value: unknown) => void; reject: (error: Error) => void }>();
  private buffer = '';
  private ready = false;
  private config: EmbeddedConfig;

  constructor(config: EmbeddedConfig) {
    super();
    this.config = config;
  }

  async start(): Promise<void> {
    if (this.process) return;

    const args = [
      '-m', 'cognee.embedded',
      '--data-dir', this.config.dataDir,
      '--stdio',
    ];

    if (this.config.cogneeConfig) {
      args.push('--config', JSON.stringify(this.config.cogneeConfig));
    }

    this.process = spawn(this.config.pythonPath, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, PYTHONUNBUFFERED: '1' },
    });

    this.process.stdout?.on('data', (data: Buffer) => this.handleStdout(data));
    this.process.stderr?.on('data', (data: Buffer) => this.emit('stderr', data.toString()));
    this.process.on('exit', (code) => this.handleExit(code));
    this.process.on('error', (err) => this.emit('error', err));

    // Wait for ready signal
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Embedded provider startup timeout')), 30000);
      this.once('ready', () => {
        clearTimeout(timeout);
        resolve();
      });
    });
  }

  private handleStdout(data: Buffer): void {
    this.buffer += data.toString();
    let newlineIndex;
    while ((newlineIndex = this.buffer.indexOf('\n')) !== -1) {
      const line = this.buffer.slice(0, newlineIndex).trim();
      this.buffer = this.buffer.slice(newlineIndex + 1);
      if (line) this.handleMessage(line);
    }
  }

  private handleMessage(line: string): void {
    try {
      const msg = JSON.parse(line) as PythonResponse;
      if (msg.id) {
        const pending = this.pendingRequests.get(msg.id);
        if (pending) {
          this.pendingRequests.delete(msg.id);
          if (msg.error) {
            pending.reject(new Error(msg.error.message));
          } else {
            pending.resolve(msg.result);
          }
        }
      } else if (msg.method === 'ready') {
        this.ready = true;
        this.emit('ready');
      } else if (msg.method === 'log') {
        this.emit('log', msg.params);
      }
    } catch {
      // Ignore non-JSON lines
    }
  }

  private handleExit(code: number | null): void {
    this.ready = false;
    this.process = null;
    // Reject all pending requests
    for (const [, pending] of this.pendingRequests) {
      pending.reject(new Error(`Process exited with code ${code}`));
    }
    this.pendingRequests.clear();
    this.emit('exit', code);
  }

  async call<T>(method: string, ...params: unknown[]): Promise<T> {
    if (!this.process || !this.ready) {
      throw new Error('Embedded provider not ready');
    }

    const id = ++this.requestId;
    const request: PythonRequest = { id, method, params };

    return new Promise<T>((resolve, reject) => {
      this.pendingRequests.set(id, { resolve: resolve as (value: unknown) => void, reject });
      this.process!.stdin!.write(JSON.stringify(request) + '\n');
      
      // Timeout after 60 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`Request ${method} timed out`));
        }
      }, 60000);
    });
  }

  async stop(): Promise<void> {
    if (this.process) {
      this.process.kill('SIGTERM');
      await new Promise<void>(resolve => this.once('exit', resolve));
    }
  }

  isReady(): boolean {
    return this.ready && this.process !== null;
  }
}

export class EmbeddedProvider implements IKnowledgeProvider {
  readonly name = 'embedded';
  readonly type = 'embedded' as const;
  
  private bridge: EmbeddedBridge;
  private config: EmbeddedConfig;
  private initialized = false;

  constructor(config: EmbeddedConfig) {
    this.config = config;
    this.bridge = new EmbeddedBridge(config);
  }

  async initialize(config: KnowledgeGraphConfig): Promise<void> {
    if (this.initialized) return;
    await this.bridge.start();
    await this.bridge.call('initialize', config.namespace, config.tenantId);
    this.initialized = true;
  }

  async shutdown(): Promise<void> {
    if (this.initialized) {
      await this.bridge.stop();
      this.initialized = false;
    }
  }

  async healthCheck(): Promise<HealthCheckResult> {
    if (!this.initialized || !this.bridge.isReady()) {
      return { healthy: false, latencyMs: -1 };
    }
    const start = Date.now();
    try {
      await this.bridge.call('health_check');
      return { healthy: true, latencyMs: Date.now() - start };
    } catch {
      return { healthy: false, latencyMs: Date.now() - start };
    }
  }

  // Document operations
  async ingestDocument(doc: Document): Promise<DocumentRef> {
    return this.bridge.call('ingest_document', doc);
  }

  async getDocument(ref: DocumentRef): Promise<Document | null> {
    return this.bridge.call('get_document', ref);
  }

  async updateDocument(ref: DocumentRef, updates: Partial<Document>): Promise<void> {
    return this.bridge.call('update_document', ref, updates);
  }

  async deleteDocument(ref: DocumentRef): Promise<void> {
    return this.bridge.call('delete_document', ref);
  }

  async listDocuments(namespace: Namespace, tenantId: TenantId | undefined, filter?: Record<string, unknown>): Promise<{ documents: Document[]; total: number }> {
    return this.bridge.call('list_documents', namespace, tenantId, filter);
  }

  // Entity operations
  async upsertEntity(entity: Entity): Promise<EntityRef> {
    return this.bridge.call('upsert_entity', entity);
  }

  async getEntity(ref: EntityRef): Promise<Entity | null> {
    return this.bridge.call('get_entity', ref);
  }

  async updateEntity(ref: EntityRef, updates: Partial<Entity>): Promise<void> {
    return this.bridge.call('update_entity', ref, updates);
  }

  async deleteEntity(ref: EntityRef): Promise<void> {
    return this.bridge.call('delete_entity', ref);
  }

  async listEntities(namespace: Namespace, tenantId: TenantId | undefined, filter?: Record<string, unknown>): Promise<{ entities: Entity[]; total: number }> {
    return this.bridge.call('list_entities', namespace, tenantId, filter);
  }

  // Relation operations
  async upsertRelation(relation: Relation): Promise<RelationRef> {
    return this.bridge.call('upsert_relation', relation);
  }

  async getRelation(ref: RelationRef): Promise<Relation | null> {
    return this.bridge.call('get_relation', ref);
  }

  async updateRelation(ref: RelationRef, updates: Partial<Relation>): Promise<void> {
    return this.bridge.call('update_relation', ref, updates);
  }

  async deleteRelation(ref: RelationRef): Promise<void> {
    return this.bridge.call('delete_relation', ref);
  }

  async listRelations(namespace: Namespace, tenantId: TenantId | undefined, filter?: Record<string, unknown>): Promise<{ relations: Relation[]; total: number }> {
    return this.bridge.call('list_relations', namespace, tenantId, filter);
  }

  // Retrieval
  async search(request: RetrievalRequest): Promise<RetrievalResult> {
    return this.bridge.call('search', request);
  }

  async hybridSearch(request: RetrievalRequest & { graphWeight?: number; vectorWeight?: number }): Promise<RetrievalResult> {
    return this.bridge.call('hybrid_search', request);
  }

  // Graph queries
  async queryGraph(query: GraphQuery): Promise<GraphQueryResult> {
    return this.bridge.call('query_graph', query);
  }

  async getEntityNeighbors(namespace: Namespace, tenantId: TenantId | undefined, entityId: string, options?: Record<string, unknown>): Promise<{ entities: Entity[]; relations: Relation[] }> {
    return this.bridge.call('get_entity_neighbors', namespace, tenantId, entityId, options);
  }

  async getPath(namespace: Namespace, tenantId: TenantId | undefined, sourceEntityId: string, targetEntityId: string, options?: Record<string, unknown>): Promise<Relation[] | null> {
    return this.bridge.call('get_path', namespace, tenantId, sourceEntityId, targetEntityId, options);
  }

  async getSubgraph(namespace: Namespace, tenantId: TenantId | undefined, entityIds: string[], options?: Record<string, unknown>): Promise<{ entities: Entity[]; relations: Relation[] }> {
    return this.bridge.call('get_subgraph', namespace, tenantId, entityIds, options);
  }

  // Utilities
  async getStats(namespace: Namespace, tenantId: TenantId | undefined): Promise<{ documents: number; entities: number; relations: number; storageSizeBytes: number }> {
    return this.bridge.call('get_stats', namespace, tenantId);
  }

  async createIndex(namespace: Namespace, tenantId: TenantId | undefined, indexType: string, config?: Record<string, unknown>): Promise<void> {
    return this.bridge.call('create_index', namespace, tenantId, indexType, config);
  }

  async dropIndex(namespace: Namespace, tenantId: TenantId | undefined, indexType: string): Promise<void> {
    return this.bridge.call('drop_index', namespace, tenantId, indexType);
  }
}

export function createEmbeddedProvider(config: EmbeddedConfig): EmbeddedProvider {
  return new EmbeddedProvider(config);
}