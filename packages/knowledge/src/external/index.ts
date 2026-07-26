/**
 * External Domain - Per-App Knowledge Graphs
 * 
 * Provides isolated knowledge graphs per client app:
 * - TaxFlow: Australian tax knowledge, lodgment rules, ATO rulings
 * - CrewCircle: Team ops, project docs, decisions
 * - Custom apps: Any client-specific knowledge base
 * 
 * Uses 'app.{appId}' namespace with clientId as tenant.
 * Always uses PostgresProvider for production multi-tenancy with RLS.
 */

import { knowledge, KnowledgeGraph, type KnowledgeGraphConfig } from '../providers';
import { AccessLevel } from '../core/types';
import type { Namespace, TenantId, EntityType, RelationType, RetrievalResult, EntityId } from '../core/types';

export interface ExternalAppConfig {
  appId: string;
  displayName: string;
  description?: string;
}

export interface ClientContext {
  clientId: string;
  clientName?: string;
  environment: 'development' | 'staging' | 'production';
  customConfig?: Record<string, unknown>;
}

export const ExternalEntityTypes = {
  DOCUMENT: 'Document' as EntityType,
  ENTITY: 'Entity' as EntityType,
  RELATION: 'Relation' as RelationType,
  TAX_RULE: 'TaxRule' as EntityType,
  ATO_RULING: 'ATORuling' as EntityType,
  LODGMENT_RULE: 'LodgmentRule' as EntityType,
  CLIENT_ENTITY: 'ClientEntity' as EntityType,
  WORKFLOW: 'Workflow' as EntityType,
  TEMPLATE: 'Template' as EntityType,
} as const;

export const ExternalRelationTypes = {
  RELATES_TO: 'RELATES_TO' as RelationType,
  CITES: 'CITES' as RelationType,
  SUPERSEDES: 'SUPERSEDES' as RelationType,
  APPLIES_TO: 'APPLIES_TO' as RelationType,
  PART_OF: 'PART_OF' as RelationType,
  HAS_STEP: 'HAS_STEP' as RelationType,
  GENERATED_FROM: 'GENERATED_FROM' as RelationType,
} as const;

export interface ExternalGraphConfig extends Partial<KnowledgeGraphConfig> {
  app: ExternalAppConfig;
  client: ClientContext;
  postgresConnectionString: string;
}

const appGraphs = new Map<string, KnowledgeGraph>();

export function getAppGraph(config: ExternalGraphConfig): KnowledgeGraph {
  const key = `${config.client.clientId}:${config.app.appId}:${config.client.environment}`;
  
  if (appGraphs.has(key)) {
    return appGraphs.get(key)!;
  }

  const namespace = `app.${config.app.appId}` as Namespace;
  const tenantId = config.client.clientId as TenantId;

  const graph = knowledge.getGraph({
    namespace,
    tenantId,
    provider: 'postgres',
    ...config,
  });

  appGraphs.set(key, graph);
  return graph;
}

export async function initAppGraph(config: ExternalGraphConfig): Promise<KnowledgeGraph> {
  const graph = getAppGraph(config);
  await graph.initialize();
  return graph;
}

export class AppKnowledgeGraph {
  private graph: KnowledgeGraph;
  private appId: string;
  private clientId: string;

  constructor(config: ExternalGraphConfig) {
    this.graph = getAppGraph(config);
    this.appId = config.app.appId;
    this.clientId = config.client.clientId;
  }

  async initialize(): Promise<void> {
    await this.graph.initialize();
  }

  async addDocument(doc: {
    title: string;
    content: string;
    sourceType: 'manual' | 'sync' | 'file';
    sourceId: string;
    tags?: string[];
    accessLevel?: AccessLevel;
    metadata?: Record<string, unknown>;
  }): Promise<string> {
    return this.graph.addDocument(
      doc.content,
      {
        sourceId: doc.sourceId,
        sourceType: doc.sourceType,
        title: doc.title,
        tags: doc.tags ?? [],
        accessLevel: doc.accessLevel ?? AccessLevel.PUBLIC,
        ...doc.metadata,
      }
    );
  }

  async search(query: string, options?: {
    limit?: number;
    entityTypes?: EntityType[];
    accessLevels?: AccessLevel[];
    tags?: string[];
  }): Promise<RetrievalResult> {
    return this.graph.search({
      query,
      limit: options?.limit ?? 10,
      filters: {
        entityTypes: options?.entityTypes,
        accessLevels: options?.accessLevels,
        tags: options?.tags,
      },
    });
  }

  async addTaxRule(rule: {
    ruleId: string;
    title: string;
    description: string;
    financialYear: string;
    category: string;
    conditions: string;
    calculation: string;
    effectiveFrom: Date;
    effectiveTo?: Date;
    sourceUrl?: string;
  }): Promise<string> {
    const entityId = await this.graph.addEntity({
      type: ExternalEntityTypes.TAX_RULE,
      name: rule.title,
      description: rule.description,
      properties: {
        ruleId: rule.ruleId,
        financialYear: rule.financialYear,
        category: rule.category,
        conditions: rule.conditions,
        calculation: rule.calculation,
        effectiveFrom: rule.effectiveFrom.toISOString(),
        effectiveTo: rule.effectiveTo?.toISOString(),
        sourceUrl: rule.sourceUrl,
      },
    });

    return entityId;
  }

  async addATORuling(ruling: {
    rulingId: string;
    title: string;
    summary: string;
    fullText: string;
    topic: string;
    dateIssued: Date;
    status: 'current' | 'withdrawn' | 'superseded';
    relatedRules?: string[];
  }): Promise<string> {
    const entityId = await this.graph.addEntity({
      type: ExternalEntityTypes.ATO_RULING,
      name: ruling.title,
      description: ruling.summary,
      properties: {
        rulingId: ruling.rulingId,
        fullText: ruling.fullText,
        topic: ruling.topic,
        dateIssued: ruling.dateIssued.toISOString(),
        status: ruling.status,
        relatedRules: ruling.relatedRules ?? [],
      },
    });

    if (ruling.relatedRules) {
      for (const ruleId of ruling.relatedRules) {
        const ruleEntities = await this.graph.search({
          query: ruleId,
          filters: { entityTypes: [ExternalEntityTypes.TAX_RULE] },
          limit: 1,
        });
        const ruleEntity = ruleEntities.chunks[0]?.document?.metadata?.sourceId as EntityId | undefined;
        if (ruleEntity) {
          await this.graph.addRelation({
            type: ExternalRelationTypes.CITES,
            sourceEntityId: entityId,
            targetEntityId: ruleEntity,
            properties: {},
            confidence: 1.0,
          });
        }
      }
    }

    return entityId;
  }

  async addLodgmentRule(rule: {
    ruleId: string;
    formName: string;
    description: string;
    dueDateRule: string;
    lodgmentMethod: 'online' | 'paper' | 'agent';
    appliesTo: string[];
    penalties?: string;
  }): Promise<string> {
    return this.graph.addEntity({
      type: ExternalEntityTypes.LODGMENT_RULE,
      name: rule.formName,
      description: rule.description,
      properties: {
        ruleId: rule.ruleId,
        dueDateRule: rule.dueDateRule,
        lodgmentMethod: rule.lodgmentMethod,
        appliesTo: rule.appliesTo,
        penalties: rule.penalties,
      },
    });
  }

  async addWorkflow(workflow: {
    workflowId: string;
    name: string;
    description: string;
    steps: Array<{ stepId: string; name: string; description: string; order: number }>;
    triggers?: string[];
  }): Promise<string> {
    const entityId = await this.graph.addEntity({
      type: ExternalEntityTypes.WORKFLOW,
      name: workflow.name,
      description: workflow.description,
      properties: {
        workflowId: workflow.workflowId,
        steps: workflow.steps,
        triggers: workflow.triggers ?? [],
      },
    });

    for (const step of workflow.steps) {
      const stepEntityId = await this.graph.addEntity({
        type: ExternalEntityTypes.ENTITY,
        name: step.name,
        description: step.description,
        properties: { stepId: step.stepId, order: step.order, workflowId: workflow.workflowId },
      });
      await this.graph.addRelation({
        type: ExternalRelationTypes.HAS_STEP,
        sourceEntityId: entityId,
        targetEntityId: stepEntityId,
        properties: { order: step.order },
        confidence: 1.0,
      });
    }

    return entityId;
  }

  async getEntityContext(entityId: string, depth = 2) {
    return this.graph.getEntityNeighbors(entityId, depth);
  }

  async getGraphStats() {
    return this.graph.stats();
  }
}

export function createAppGraph(config: ExternalGraphConfig): AppKnowledgeGraph {
  return new AppKnowledgeGraph(config);
}

export async function getTaxFlowGraph(clientId: string, environment: ClientContext['environment'], connectionString: string): Promise<AppKnowledgeGraph> {
  return createAppGraph({
    app: { appId: 'taxflow', displayName: 'TaxFlow', description: 'Australian Tax Knowledge Base' },
    client: { clientId, environment },
    postgresConnectionString: connectionString,
  });
}

export async function getCrewCircleGraph(clientId: string, environment: ClientContext['environment'], connectionString: string): Promise<AppKnowledgeGraph> {
  return createAppGraph({
    app: { appId: 'crewcircle', displayName: 'CrewCircle', description: 'Team Operations Knowledge Base' },
    client: { clientId, environment },
    postgresConnectionString: connectionString,
  });
}