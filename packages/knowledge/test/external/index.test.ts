import { describe, it, expect, beforeEach } from 'vitest';
import { MockProvider } from '../../src/providers/mock/mock-provider';
import { KnowledgeGraph } from '../../src/core/knowledge-graph';
import { AccessLevel } from '../../src/core/types';
import type { KnowledgeGraphConfig, Namespace, TenantId } from '../../src/core/types';

describe('External Domain', () => {
  let kg: KnowledgeGraph;
  let provider: MockProvider;
  const namespace = 'taxflow' as Namespace;
  const tenantId = 'taxflow-app' as TenantId;
  const config: KnowledgeGraphConfig = { namespace, tenantId, provider: 'mock', defaultAccessLevel: AccessLevel.PUBLIC };

  beforeEach(async () => {
    provider = new MockProvider({ seed: 789 }, 'external-test');
    await provider.initialize(config);
    kg = new KnowledgeGraph({ namespace, tenantId, provider });
    await kg.initialize();
  });

  describe('TaxFlow domain', () => {
    it('should add tax rule', async () => {
      const entityId = await kg.addEntity({
        type: 'TaxRule' as any,
        name: 'GST-001: GST on Digital Services',
        description: '10% GST applies to digital services supplied to Australian consumers',
        properties: {
          ruleCode: 'GST-001',
          jurisdiction: 'AU',
          effectiveFrom: new Date('2024-01-01').toISOString(),
          rate: 0.10,
          category: 'GST',
          tags: ['digital', 'consumer'],
          source: 'ATO',
        },
      });

      expect(entityId).toBeDefined();
      const retrieved = await kg.getEntity(entityId);
      expect(retrieved?.properties.ruleCode).toBe('GST-001');
      expect(retrieved?.properties.rate).toBe(0.10);
    });

    it('should list tax rules by category', async () => {
      await kg.addEntity({ type: 'TaxRule' as any, name: 'GST Digital', properties: { category: 'GST', ruleCode: 'GST-001' } });
      await kg.addEntity({ type: 'TaxRule' as any, name: 'GST Import', properties: { category: 'GST', ruleCode: 'GST-002' } });
      await kg.addEntity({ type: 'TaxRule' as any, name: 'Income Tax', properties: { category: 'Income Tax', ruleCode: 'IT-001' } });

      const allRules = await kg.findEntities({ type: 'TaxRule' as any });
      const gstFiltered = allRules.filter(r => r.properties.category === 'GST');
      const incomeTaxFiltered = allRules.filter(r => r.properties.category === 'Income Tax');

      expect(gstFiltered).toHaveLength(2);
      expect(incomeTaxFiltered).toHaveLength(1);
    });

    it('should add ATO ruling', async () => {
      const entityId = await kg.addEntity({
        type: 'ATORuling' as any,
        name: 'ATO-2024-001: Crypto Asset Taxation',
        description: 'Crypto-to-crypto trades are CGT events',
        properties: {
          rulingId: 'ATO-2024-001',
          fullText: 'Detailed ruling text...',
          topic: 'crypto',
          dateIssued: new Date('2024-07-01').toISOString(),
          status: 'current',
          relatedRules: [],
        },
      });

      expect(entityId).toBeDefined();
      const retrieved = await kg.getEntity(entityId);
      expect(retrieved?.properties.rulingId).toBe('ATO-2024-001');
      expect(retrieved?.properties.topic).toBe('crypto');
    });

    it('should add lodgment rule', async () => {
      const entityId = await kg.addEntity({
        type: 'LodgmentRule' as any,
        name: 'BAS: Business Activity Statement',
        description: 'Monthly/quarterly GST reporting',
        properties: {
          ruleId: 'BAS',
          formName: 'BAS',
          frequency: 'quarterly',
          dueDateRule: '28th day after quarter end',
          penalties: ['Late lodgment penalty', 'GIC on unpaid amounts'],
          applicableEntities: ['company', 'trust', 'partnership'],
        },
      });

      expect(entityId).toBeDefined();
      const retrieved = await kg.getEntity(entityId);
      expect(retrieved?.properties.formName).toBe('BAS');
      expect(retrieved?.properties.frequency).toBe('quarterly');
    });

    it('should add workflow', async () => {
      const workflowId = await kg.addEntity({
        type: 'Workflow' as any,
        name: 'Quarterly BAS Preparation',
        description: 'End-to-end BAS preparation workflow',
        properties: {
          workflowId: 'wf-bas-prep',
          steps: [
            { name: 'Gather Data', description: 'Collect transactions', order: 1, responsible: 'bookkeeper', estimatedHours: 2 },
            { name: 'Reconcile', description: 'Reconcile GST', order: 2, responsible: 'accountant', estimatedHours: 4 },
            { name: 'Lodge', description: 'Submit to ATO', order: 3, responsible: 'tax-agent', estimatedHours: 1 },
          ],
          triggers: ['quarter-end'],
          tags: ['compliance', 'automation'],
        },
      });

      expect(workflowId).toBeDefined();
      const retrieved = await kg.getEntity(workflowId);
      expect(retrieved?.properties.steps).toHaveLength(3);
      expect(retrieved?.properties.steps[0].order).toBe(1);
    });
  });

  describe('CrewCircle domain', () => {
    let crewKg: KnowledgeGraph;
    let crewProvider: MockProvider;

    beforeEach(async () => {
      crewProvider = new MockProvider({ seed: 999 }, 'crewcircle-test');
      const crewConfig: KnowledgeGraphConfig = { namespace: 'crewcircle' as Namespace, tenantId: 'crewcircle' as TenantId, provider: 'mock', defaultAccessLevel: AccessLevel.ORG_INTERNAL };
      await crewProvider.initialize(crewConfig);
      crewKg = new KnowledgeGraph({ namespace: 'crewcircle' as Namespace, tenantId: 'crewcircle' as TenantId, provider: crewProvider });
      await crewKg.initialize();
    });

    it('should add feature spec', async () => {
      const entityId = await crewKg.addEntity({
        type: 'FeatureSpec' as any,
        name: 'FC-001: Real-time Collaboration',
        description: 'Multi-user editing with conflict resolution',
        properties: {
          featureId: 'FC-001',
          status: 'design',
          priority: 'high',
          acceptanceCriteria: ['User sees other cursors', 'Conflicts auto-merge', 'Offline support'],
          dependencies: ['auth', 'websocket'],
          tags: ['collaboration', 'real-time'],
        },
      });

      expect(entityId).toBeDefined();
      const retrieved = await crewKg.getEntity(entityId);
      expect(retrieved?.properties.featureId).toBe('FC-001');
      expect(retrieved?.properties.acceptanceCriteria).toHaveLength(3);
    });

    it('should add incident', async () => {
      const entityId = await crewKg.addEntity({
        type: 'Incident' as any,
        name: 'INC-2024-001: Database Connection Pool Exhaustion',
        description: 'Connection pool exhausted during peak load',
        properties: {
          incidentId: 'INC-2024-001',
          severity: 'high',
          status: 'resolved',
          rootCause: 'Missing connection release in error path',
          resolution: 'Added finally block to release connections',
          timeline: [
            { timestamp: new Date('2024-01-15T10:00:00Z').toISOString(), event: 'Alert triggered' },
            { timestamp: new Date('2024-01-15T10:15:00Z').toISOString(), event: 'Mitigation applied' },
            { timestamp: new Date('2024-01-15T11:00:00Z').toISOString(), event: 'Root cause identified' },
          ],
          tags: ['database', 'performance'],
        },
      });

      expect(entityId).toBeDefined();
      const retrieved = await crewKg.getEntity(entityId);
      expect(retrieved?.properties.incidentId).toBe('INC-2024-001');
      expect(retrieved?.properties.severity).toBe('high');
      expect(retrieved?.properties.timeline).toHaveLength(3);
    });

    it('should add runbook', async () => {
      const entityId = await crewKg.addEntity({
        type: 'Runbook' as any,
        name: 'RB-001: Database Failover',
        description: 'Manual failover procedure for primary DB',
        properties: {
          runbookId: 'RB-001',
          steps: [
            { order: 1, action: 'Verify replica health', command: 'pg_isready -h replica', expectedResult: 'Accepting connections' },
            { order: 2, action: 'Promote replica', command: 'pg_ctl promote -D /var/lib/postgresql/data', expectedResult: 'Replica becomes primary' },
            { order: 3, action: 'Update DNS', command: 'aws route53 change-resource-record-sets...', expectedResult: 'DNS points to new primary' },
          ],
          prerequisites: ['AWS CLI configured', 'SSH access to replica'],
          tags: ['database', 'disaster-recovery'],
        },
      });

      expect(entityId).toBeDefined();
      const retrieved = await crewKg.getEntity(entityId);
      expect(retrieved?.properties.runbookId).toBe('RB-001');
      expect(retrieved?.properties.steps).toHaveLength(3);
    });
  });
});