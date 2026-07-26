import { describe, it, expect, beforeEach } from 'vitest';
import { MockProvider } from '../../src/providers/mock/mock-provider';
import type { KnowledgeGraphConfig, Namespace, TenantId } from '../../src/core/types';

describe('MockProvider', () => {
  let provider: MockProvider;
  const namespace = 'test' as Namespace;
  const tenantId = 'tenant-1' as TenantId;
  const config: KnowledgeGraphConfig = { namespace, tenantId, provider: 'mock' };

  beforeEach(async () => {
    provider = new MockProvider({ seed: 123 }, 'test-mock');
    await provider.initialize(config);
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      const health = await provider.healthCheck();
      expect(health.healthy).toBe(true);
      expect(health.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it('should have correct name and type', () => {
      expect(provider.name).toBe('test-mock');
      expect(provider.type).toBe('mock');
    });
  });

  describe('document operations', () => {
    it('should ingest and retrieve a document', async () => {
      const doc = {
        id: 'doc-1' as any,
        namespace,
        tenantId,
        content: 'Test document content',
        metadata: { 
          sourceId: 'test-1',
          sourceType: 'manual' as const,
          title: 'Test',
          tags: ['test'],
          accessLevel: 'public' as const,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const ref = await provider.ingestDocument(doc);
      expect(ref).toBe('doc-1');

      const retrieved = await provider.getDocument(ref);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.content).toBe('Test document content');
      expect(retrieved?.metadata.tags).toEqual(['test']);
    });

    it('should update a document', async () => {
      const doc = {
        id: 'doc-2' as any,
        namespace,
        tenantId,
        content: 'Original content',
        metadata: { 
          sourceId: 'test-2',
          sourceType: 'manual' as const,
          title: 'Test',
          tags: [],
          accessLevel: 'public' as const,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await provider.ingestDocument(doc);
      await provider.updateDocument('doc-2', { content: 'Updated content' });

      const retrieved = await provider.getDocument('doc-2');
      expect(retrieved?.content).toBe('Updated content');
    });

    it('should delete a document', async () => {
      const doc = {
        id: 'doc-3' as any,
        namespace,
        tenantId,
        content: 'To be deleted',
        metadata: { 
          sourceId: 'test-3',
          sourceType: 'manual' as const,
          title: 'Test',
          tags: [],
          accessLevel: 'public' as const,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await provider.ingestDocument(doc);
      await provider.deleteDocument('doc-3');

      const retrieved = await provider.getDocument('doc-3');
      expect(retrieved).toBeNull();
    });

    it('should list documents with filters', async () => {
      await provider.ingestDocument({
        id: 'doc-4' as any,
        namespace,
        tenantId,
        content: 'Doc 1',
        metadata: { 
          sourceId: 'test-4',
          sourceType: 'manual' as const,
          title: 'Test',
          tags: ['tag1'],
          accessLevel: 'public' as const,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await provider.ingestDocument({
        id: 'doc-5' as any,
        namespace,
        tenantId,
        content: 'Doc 2',
        metadata: { 
          sourceId: 'test-5',
          sourceType: 'manual' as const,
          title: 'Test',
          tags: ['tag2'],
          accessLevel: 'internal' as const,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const { documents, total } = await provider.listDocuments(namespace, tenantId, { tags: ['tag1'], limit: 10 });
      expect(total).toBe(1);
      expect(documents).toHaveLength(1);
      expect(documents[0].metadata.tags).toContain('tag1');
    });
  });

  describe('entity operations', () => {
    it('should upsert and retrieve an entity', async () => {
      const entity = {
        id: 'ent-1' as any,
        namespace,
        tenantId,
        name: 'Test Entity',
        type: 'Concept',
        description: 'A test entity',
        properties: { domain: 'testing' },
        metadata: { 
          sourceId: 'test-e1',
          sourceType: 'manual' as const,
          title: 'Test Entity',
          tags: [],
          accessLevel: 'public' as const,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const ref = await provider.upsertEntity(entity);
      expect(ref).toBe('ent-1');

      const retrieved = await provider.getEntity(ref);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.name).toBe('Test Entity');
      expect(retrieved?.type).toBe('Concept');
    });

    it('should update an entity', async () => {
      const entity = {
        id: 'ent-2' as any,
        namespace,
        tenantId,
        name: 'Original',
        type: 'Concept',
        properties: {},
        metadata: { 
          sourceId: 'test-e2',
          sourceType: 'manual' as const,
          title: 'Original',
          tags: [],
          accessLevel: 'public' as const,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await provider.upsertEntity(entity);
      await provider.updateEntity('ent-2', { name: 'Updated', description: 'New description' });

      const retrieved = await provider.getEntity('ent-2');
      expect(retrieved?.name).toBe('Updated');
      expect(retrieved?.description).toBe('New description');
    });

    it('should delete an entity', async () => {
      const entity = {
        id: 'ent-3' as any,
        namespace,
        tenantId,
        name: 'To Delete',
        type: 'Concept',
        properties: {},
        metadata: { 
          sourceId: 'test-e3',
          sourceType: 'manual' as const,
          title: 'To Delete',
          tags: [],
          accessLevel: 'public' as const,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await provider.upsertEntity(entity);
      await provider.deleteEntity('ent-3');

      const retrieved = await provider.getEntity('ent-3');
      expect(retrieved).toBeNull();
    });

    it('should list entities with filters', async () => {
      await provider.upsertEntity({
        id: 'ent-4' as any,
        namespace,
        tenantId,
        name: 'Entity A',
        type: 'Person',
        properties: {},
        metadata: { sourceId: 'test-e4', sourceType: 'manual' as const, title: 'A', tags: [], accessLevel: 'public' as const },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await provider.upsertEntity({
        id: 'ent-5' as any,
        namespace,
        tenantId,
        name: 'Entity B',
        type: 'Organization',
        properties: {},
        metadata: { sourceId: 'test-e5', sourceType: 'manual' as const, title: 'B', tags: [], accessLevel: 'public' as const },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const { entities, total } = await provider.listEntities(namespace, tenantId, { type: 'Person' });
      expect(total).toBe(1);
      expect(entities).toHaveLength(1);
      expect(entities[0].type).toBe('Person');
    });
  });

  describe('relation operations', () => {
    it('should upsert and retrieve a relation', async () => {
      await provider.upsertEntity({
        id: 'ent-10' as any,
        namespace,
        tenantId,
        name: 'Source',
        type: 'Concept',
        properties: {},
        metadata: { sourceId: 'test-r1', sourceType: 'manual' as const, title: 'Source', tags: [], accessLevel: 'public' as const },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await provider.upsertEntity({
        id: 'ent-11' as any,
        namespace,
        tenantId,
        name: 'Target',
        type: 'Concept',
        properties: {},
        metadata: { sourceId: 'test-r2', sourceType: 'manual' as const, title: 'Target', tags: [], accessLevel: 'public' as const },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const relation = {
        id: 'rel-1' as any,
        namespace,
        tenantId,
        sourceEntityId: 'ent-10' as any,
        targetEntityId: 'ent-11' as any,
        type: 'RELATES_TO',
        properties: { weight: 0.8 },
        confidence: 0.8,
        metadata: { sourceId: 'test-r1', sourceType: 'manual' as const, title: 'RELATES_TO', tags: [], accessLevel: 'public' as const },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const ref = await provider.upsertRelation(relation);
      expect(ref).toBe('rel-1');

      const retrieved = await provider.getRelation(ref);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.type).toBe('RELATES_TO');
      expect(retrieved?.confidence).toBe(0.8);
    });

    it('should list relations with filters', async () => {
      await provider.upsertEntity({
        id: 'ent-20' as any,
        namespace,
        tenantId,
        name: 'A',
        type: 'Concept',
        properties: {},
        metadata: { sourceId: 'test-r3', sourceType: 'manual' as const, title: 'A', tags: [], accessLevel: 'public' as const },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await provider.upsertEntity({
        id: 'ent-21' as any,
        namespace,
        tenantId,
        name: 'B',
        type: 'Concept',
        properties: {},
        metadata: { sourceId: 'test-r4', sourceType: 'manual' as const, title: 'B', tags: [], accessLevel: 'public' as const },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await provider.upsertRelation({
        id: 'rel-2' as any,
        namespace,
        tenantId,
        sourceEntityId: 'ent-20' as any,
        targetEntityId: 'ent-21' as any,
        type: 'CONTAINS',
        properties: {},
        confidence: 1.0,
        metadata: { sourceId: 'test-r3', sourceType: 'manual' as const, title: 'CONTAINS', tags: [], accessLevel: 'public' as const },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const { relations, total } = await provider.listRelations(namespace, tenantId, { type: 'CONTAINS' });
      expect(total).toBe(1);
      expect(relations[0].type).toBe('CONTAINS');
    });
  });

  describe('retrieval operations', () => {
    it('should perform keyword search when no embedding', async () => {
      await provider.ingestDocument({
        id: 'doc-search-1' as any,
        namespace,
        tenantId,
        content: 'This document contains TypeScript code examples',
        metadata: { 
          sourceId: 'test-s1',
          sourceType: 'manual' as const,
          title: 'TS Doc',
          tags: [],
          accessLevel: 'public' as const,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await provider.ingestDocument({
        id: 'doc-search-2' as any,
        namespace,
        tenantId,
        content: 'Another document about Python programming',
        metadata: { 
          sourceId: 'test-s2',
          sourceType: 'manual' as const,
          title: 'Python Doc',
          tags: [],
          accessLevel: 'internal' as const,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = {
        query: 'TypeScript',
        namespace,
        tenantId,
        limit: 5,
      };

      const result = await provider.search(request);
      expect(result.chunks.length).toBeGreaterThan(0);
      expect(result.chunks[0].chunkText).toContain('TypeScript');
    });

    it('should respect access level filters', async () => {
      await provider.ingestDocument({
        id: 'doc-filter-1' as any,
        namespace,
        tenantId,
        content: 'Public document',
        metadata: { 
          sourceId: 'test-f1',
          sourceType: 'manual' as const,
          title: 'Public',
          tags: [],
          accessLevel: 'public' as const,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await provider.ingestDocument({
        id: 'doc-filter-2' as any,
        namespace,
        tenantId,
        content: 'Internal document',
        metadata: { 
          sourceId: 'test-f2',
          sourceType: 'manual' as const,
          title: 'Internal',
          tags: [],
          accessLevel: 'internal' as const,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const publicResult = await provider.search({
        query: 'document',
        namespace,
        tenantId,
        filters: { accessLevels: ['public'] },
      });
      expect(publicResult.chunks.every(c => c.document.metadata.accessLevel === 'public')).toBe(true);
    });
  });

  describe('graph queries', () => {
    it('should traverse graph and return neighbors', async () => {
      await provider.upsertEntity({
        id: 'ent-graph-1' as any,
        namespace,
        tenantId,
        name: 'Center',
        type: 'Concept',
        properties: {},
        metadata: { sourceId: 'test-g1', sourceType: 'manual' as const, title: 'Center', tags: [], accessLevel: 'public' as const },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await provider.upsertEntity({
        id: 'ent-graph-2' as any,
        namespace,
        tenantId,
        name: 'Neighbor 1',
        type: 'Concept',
        properties: {},
        metadata: { sourceId: 'test-g2', sourceType: 'manual' as const, title: 'Neighbor 1', tags: [], accessLevel: 'public' as const },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await provider.upsertEntity({
        id: 'ent-graph-3' as any,
        namespace,
        tenantId,
        name: 'Neighbor 2',
        type: 'Concept',
        properties: {},
        metadata: { sourceId: 'test-g3', sourceType: 'manual' as const, title: 'Neighbor 2', tags: [], accessLevel: 'public' as const },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await provider.upsertRelation({
        id: 'rel-g-1' as any,
        namespace,
        tenantId,
        sourceEntityId: 'ent-graph-1' as any,
        targetEntityId: 'ent-graph-2' as any,
        type: 'RELATES_TO',
        properties: {},
        confidence: 1.0,
        metadata: { sourceId: 'test-g1', sourceType: 'manual' as const, title: 'RELATES_TO', tags: [], accessLevel: 'public' as const },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await provider.upsertRelation({
        id: 'rel-g-2' as any,
        namespace,
        tenantId,
        sourceEntityId: 'ent-graph-1' as any,
        targetEntityId: 'ent-graph-3' as any,
        type: 'CONTAINS',
        properties: {},
        confidence: 1.0,
        metadata: { sourceId: 'test-g1', sourceType: 'manual' as const, title: 'CONTAINS', tags: [], accessLevel: 'public' as const },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const neighbors = await provider.getEntityNeighbors(namespace, tenantId, 'ent-graph-1');
      expect(neighbors.entities.length).toBeGreaterThanOrEqual(2);
      expect(neighbors.relations.length).toBe(2);
    });

    it('should find path between entities', async () => {
      await provider.upsertEntity({
        id: 'ent-path-1' as any,
        namespace,
        tenantId,
        name: 'Start',
        type: 'Concept',
        properties: {},
        metadata: { sourceId: 'test-p1', sourceType: 'manual' as const, title: 'Start', tags: [], accessLevel: 'public' as const },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await provider.upsertEntity({
        id: 'ent-path-2' as any,
        namespace,
        tenantId,
        name: 'Middle',
        type: 'Concept',
        properties: {},
        metadata: { sourceId: 'test-p2', sourceType: 'manual' as const, title: 'Middle', tags: [], accessLevel: 'public' as const },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await provider.upsertEntity({
        id: 'ent-path-3' as any,
        namespace,
        tenantId,
        name: 'End',
        type: 'Concept',
        properties: {},
        metadata: { sourceId: 'test-p3', sourceType: 'manual' as const, title: 'End', tags: [], accessLevel: 'public' as const },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await provider.upsertRelation({
        id: 'rel-p-1' as any,
        namespace,
        tenantId,
        sourceEntityId: 'ent-path-1' as any,
        targetEntityId: 'ent-path-2' as any,
        type: 'NEXT',
        properties: {},
        confidence: 1.0,
        metadata: { sourceId: 'test-p1', sourceType: 'manual' as const, title: 'NEXT', tags: [], accessLevel: 'public' as const },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await provider.upsertRelation({
        id: 'rel-p-2' as any,
        namespace,
        tenantId,
        sourceEntityId: 'ent-path-2' as any,
        targetEntityId: 'ent-path-3' as any,
        type: 'NEXT',
        properties: {},
        confidence: 1.0,
        metadata: { sourceId: 'test-p2', sourceType: 'manual' as const, title: 'NEXT', tags: [], accessLevel: 'public' as const },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const path = await provider.getPath(namespace, tenantId, 'ent-path-1', 'ent-path-3');
      expect(path).not.toBeNull();
      expect(path?.length).toBe(2);
    });

    it('should get subgraph', async () => {
      await provider.upsertEntity({
        id: 'ent-sub-1' as any,
        namespace,
        tenantId,
        name: 'Root',
        type: 'Concept',
        properties: {},
        metadata: { sourceId: 'test-s1', sourceType: 'manual' as const, title: 'Root', tags: [], accessLevel: 'public' as const },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await provider.upsertEntity({
        id: 'ent-sub-2' as any,
        namespace,
        tenantId,
        name: 'Child',
        type: 'Concept',
        properties: {},
        metadata: { sourceId: 'test-s2', sourceType: 'manual' as const, title: 'Child', tags: [], accessLevel: 'public' as const },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await provider.upsertRelation({
        id: 'rel-s-1' as any,
        namespace,
        tenantId,
        sourceEntityId: 'ent-sub-1' as any,
        targetEntityId: 'ent-sub-2' as any,
        type: 'CONTAINS',
        properties: {},
        confidence: 1.0,
        metadata: { sourceId: 'test-s1', sourceType: 'manual' as const, title: 'CONTAINS', tags: [], accessLevel: 'public' as const },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const subgraph = await provider.getSubgraph(namespace, tenantId, ['ent-sub-1'], { depth: 1 });
      // getSubgraph returns only the entities in the input array
      expect(subgraph.entities.length).toBe(1);
      expect(subgraph.entities[0].id).toBe('ent-sub-1');
      expect(subgraph.relations.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('utilities', () => {
    it('should return stats', async () => {
      await provider.ingestDocument({
        id: 'doc-stats-1' as any,
        namespace,
        tenantId,
        content: 'Stats doc',
        metadata: { 
          sourceId: 'test-stats1',
          sourceType: 'manual' as const,
          title: 'Stats',
          tags: [],
          accessLevel: 'public' as const,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await provider.upsertEntity({
        id: 'ent-stats-1' as any,
        namespace,
        tenantId,
        name: 'Stats Entity',
        type: 'Concept',
        properties: {},
        metadata: { sourceId: 'test-stats2', sourceType: 'manual' as const, title: 'Stats Entity', tags: [], accessLevel: 'public' as const },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const stats = await provider.getStats(namespace, tenantId);
      expect(stats.documents).toBeGreaterThanOrEqual(1);
      expect(stats.entities).toBeGreaterThanOrEqual(1);
      // storageSizeBytes is 0 in mock provider
      expect(stats.storageSizeBytes).toBe(0);
    });

    it('should shutdown cleanly', async () => {
      await provider.shutdown();
      const health = await provider.healthCheck();
      expect(health.healthy).toBe(false);
    });
  });
});