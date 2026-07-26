import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KnowledgeGraph } from '../../src/core/knowledge-graph';
import { MockProvider } from '../../src/providers/mock/mock-provider';
import { knowledge } from '../../src/providers';
import { AccessLevel } from '../../src/core/types';
import type { KnowledgeGraphConfig, Namespace, TenantId } from '../../src/core/types';

describe('KnowledgeGraph Facade', () => {
  let kg: KnowledgeGraph;
  let provider: MockProvider;
  const namespace = 'test' as Namespace;
  const tenantId = 'tenant-1' as TenantId;
  const config: KnowledgeGraphConfig = { namespace, tenantId, provider: 'mock', defaultAccessLevel: AccessLevel.ORG_INTERNAL };

  beforeEach(async () => {
    provider = new MockProvider({}, 'test-provider');
    await provider.initialize(config);
    kg = new KnowledgeGraph({ namespace, tenantId, provider });
    await kg.initialize();
  });

  describe('document operations', () => {
    it('should add and retrieve document', async () => {
      const ref = await kg.addDocument('Facade test content', {
        sourceId: 'test-1',
        sourceType: 'manual',
        title: 'Test Doc',
        tags: ['test'],
        accessLevel: AccessLevel.PUBLIC,
      });

      expect(ref).toBeDefined();

      const retrieved = await kg.getDocument(ref);
      expect(retrieved?.content).toBe('Facade test content');
      expect(retrieved?.metadata.title).toBe('Test Doc');
    });

    it('should search documents', async () => {
      await kg.addDocument('TypeScript best practices guide', {
        sourceId: 'test-2',
        sourceType: 'manual',
        title: 'TS Guide',
        tags: ['typescript'],
        accessLevel: AccessLevel.PUBLIC,
      });

      const results = await kg.search({ query: 'TypeScript', limit: 5 });
      expect(results.chunks.length).toBeGreaterThan(0);
      expect(results.chunks[0].chunkText).toContain('TypeScript');
    });
  });

  describe('entity operations', () => {
    it('should add and retrieve entity', async () => {
      const ref = await kg.addEntity({
        type: 'Standard' as any,
        name: 'Facade Entity',
        description: 'Test standard',
        properties: { category: 'code-style' },
      });

      expect(ref).toBeDefined();

      const retrieved = await kg.getEntity(ref);
      expect(retrieved?.name).toBe('Facade Entity');
      expect(retrieved?.type).toBe('Standard');
    });

    it('should find entities by filter', async () => {
      await kg.addEntity({ type: 'Person' as any, name: 'Entity A', properties: {} });
      await kg.addEntity({ type: 'Organization' as any, name: 'Entity B', properties: {} });

      const entities = await kg.findEntities({ type: 'Person' as any });
      expect(entities.length).toBeGreaterThanOrEqual(1);
      expect(entities[0].type).toBe('Person');
    });
  });

  describe('relation operations', () => {
    it('should add and retrieve relation', async () => {
      const sourceRef = await kg.addEntity({ type: 'Concept' as any, name: 'Source', properties: {} });
      const targetRef = await kg.addEntity({ type: 'Concept' as any, name: 'Target', properties: {} });

      const relRef = await kg.addRelation({
        type: 'IMPLEMENTS' as any,
        sourceEntityId: sourceRef,
        targetEntityId: targetRef,
        properties: {},
        confidence: 0.9,
      });

      expect(relRef).toBeDefined();

      const retrieved = await kg.getRelation(relRef);
      expect(retrieved?.type).toBe('IMPLEMENTS');
    });

    it('should find relations by filter', async () => {
      const sourceRef = await kg.addEntity({ type: 'Concept' as any, name: 'Source', properties: {} });
      const targetRef = await kg.addEntity({ type: 'Concept' as any, name: 'Target', properties: {} });

      await kg.addRelation({ type: 'CONTAINS' as any, sourceEntityId: sourceRef, targetEntityId: targetRef, properties: {}, confidence: 1.0 });

      const relations = await kg.findRelations({ type: 'CONTAINS' as any });
      expect(relations.length).toBeGreaterThanOrEqual(1);
      expect(relations[0].type).toBe('CONTAINS');
    });
  });

  describe('graph queries', () => {
    it('should get entity neighbors', async () => {
      const centerRef = await kg.addEntity({ type: 'Concept' as any, name: 'Center', properties: {} });
      const neighborRef = await kg.addEntity({ type: 'Concept' as any, name: 'Neighbor', properties: {} });
      await kg.addRelation({ type: 'RELATES_TO' as any, sourceEntityId: centerRef, targetEntityId: neighborRef, properties: {}, confidence: 1.0 });

      const neighbors = await kg.getEntityNeighbors(centerRef);
      expect(neighbors.entities.length).toBeGreaterThanOrEqual(1);
      expect(neighbors.relations.length).toBeGreaterThanOrEqual(1);
    });

    it('should find path between entities', async () => {
      const startRef = await kg.addEntity({ type: 'Concept' as any, name: 'Start', properties: {} });
      const midRef = await kg.addEntity({ type: 'Concept' as any, name: 'Middle', properties: {} });
      const endRef = await kg.addEntity({ type: 'Concept' as any, name: 'End', properties: {} });

      await kg.addRelation({ type: 'NEXT' as any, sourceEntityId: startRef, targetEntityId: midRef, properties: {}, confidence: 1.0 });
      await kg.addRelation({ type: 'NEXT' as any, sourceEntityId: midRef, targetEntityId: endRef, properties: {}, confidence: 1.0 });

      const paths = await kg.getPath(startRef, endRef);
      expect(paths.length).toBeGreaterThanOrEqual(1);
      expect(paths[0].length).toBe(2);
    });
  });

  describe('stats', () => {
    it('should return stats', async () => {
      await kg.addDocument('test', { sourceId: 's1', sourceType: 'manual', title: 't', tags: [], accessLevel: AccessLevel.PUBLIC });
      await kg.addEntity({ type: 'Concept' as any, name: 'Test', properties: {} });

      const stats = await kg.stats();
      expect(stats.documentCount).toBeGreaterThanOrEqual(1);
      expect(stats.entityCount).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('Knowledge Singleton (Provider Registry)', () => {
  beforeEach(() => {
    knowledge.unregisterProvider('mock');
    knowledge.unregisterProvider('test-provider');
    knowledge.unregisterProvider('registry-test');
  });

  it('should register and retrieve provider', async () => {
    const provider = new MockProvider({}, 'mock');
    knowledge.registerProvider(provider);
    const retrieved = knowledge.getGraph({ namespace: 'test' as Namespace, provider: 'mock' });
    expect(retrieved).toBeDefined();
  });

  it('should list registered providers', () => {
    const provider = new MockProvider({}, 'registry-test');
    knowledge.registerProvider(provider);
    const names = knowledge.listProviders();
    expect(names).toContain('registry-test');
  });

  it('should health check all providers', async () => {
    const provider = new MockProvider({}, 'health-test');
    const config: KnowledgeGraphConfig = { namespace: 'test' as Namespace, tenantId: 'test' as TenantId, provider: 'mock', defaultAccessLevel: AccessLevel.ORG_INTERNAL };
    await provider.initialize(config);
    knowledge.registerProvider(provider);
    const results = await knowledge.healthCheckAll();
    expect(results.size).toBeGreaterThan(0);
    for (const [, health] of results) {
      expect(health.healthy).toBe(true);
    }
  });
});