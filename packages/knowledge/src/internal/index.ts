/**
 * Internal Domain - CrewCircle Organizational Memory
 * 
 * Provides high-level API for org-level knowledge:
 * - Standards, decisions, ADRs, retrospectives
 * - Project milestones, team knowledge
 * - Cross-app institutional knowledge
 * 
 * Uses 'crewcircle.org' namespace with 'crewcircle' tenant.
 * Auto-uses EmbeddedProvider in local dev, PostgresProvider in production.
 */

import { knowledge, KnowledgeGraph, type KnowledgeGraphConfig } from '../providers';
import type { Namespace, TenantId, Entity, EntityType, RelationType, Document, RetrievalRequest, RetrievalResult, EntityId, AccessLevel } from '../core/types';

export const INTERNAL_NAMESPACE = 'crewcircle.org' as Namespace;
export const INTERNAL_TENANT = 'crewcircle' as TenantId;

export const InternalEntityTypes = {
  STANDARD: 'Standard' as EntityType,
  DECISION: 'Decision' as EntityType,
  PROJECT: 'Project' as EntityType,
  MILESTONE: 'Milestone' as EntityType,
  TEAM_MEMBER: 'TeamMember' as EntityType,
  TECHNOLOGY: 'Technology' as EntityType,
  RETROSPECTIVE: 'Retrospective' as EntityType,
  ADR: 'ADR' as EntityType,
} as const;

export const InternalRelationTypes = {
  DEFINES: 'DEFINES' as RelationType,
  RELATES_TO: 'RELATES_TO' as RelationType,
  SUPERSEDES: 'SUPERSEDES' as RelationType,
  HAS_MILESTONE: 'HAS_MILESTONE' as RelationType,
  AUTHORED_BY: 'AUTHORED_BY' as RelationType,
  USES_TECHNOLOGY: 'USES_TECHNOLOGY' as RelationType,
  PART_OF: 'PART_OF' as RelationType,
} as const;

export interface InternalConfig extends Partial<KnowledgeGraphConfig> {
  provider?: 'embedded' | 'postgres' | 'mock';
  embeddedDataDir?: string;
  postgresConnectionString?: string;
}

let internalGraph: KnowledgeGraph | null = null;

export function getInternalGraph(config?: InternalConfig): KnowledgeGraph {
  if (internalGraph) return internalGraph;

  const provider = config?.provider ?? (process.env.NODE_ENV === 'production' ? 'postgres' : 'embedded');
  
  internalGraph = knowledge.getGraph({
    namespace: INTERNAL_NAMESPACE,
    tenantId: INTERNAL_TENANT,
    provider,
    ...config,
  });

  return internalGraph;
}

export async function initInternalKnowledge(config?: InternalConfig): Promise<KnowledgeGraph> {
  const graph = getInternalGraph(config);
  await graph.initialize();
  return graph;
}

export class InternalMemory {
  private graph: KnowledgeGraph;

  constructor(config?: InternalConfig) {
    this.graph = getInternalGraph(config);
  }

  async initialize(): Promise<void> {
    await this.graph.initialize();
  }

  async addStandard(standard: {
    name: string;
    description: string;
    content: string;
    tags?: string[];
    authorId?: string;
  }): Promise<string> {
    return this.graph.addEntity({
      type: InternalEntityTypes.STANDARD,
      name: standard.name,
      description: standard.description,
      properties: { content: standard.content, tags: standard.tags ?? [] },
    });
  }

  async addDecision(decision: {
    title: string;
    context: string;
    decision: string;
    consequences?: string;
    tags?: string[];
    authorId?: string;
    supersedes?: string;
  }): Promise<string> {
    const entityId = await this.graph.addEntity({
      type: InternalEntityTypes.DECISION,
      name: decision.title,
      description: decision.context,
      properties: { 
        decision: decision.decision, 
        consequences: decision.consequences,
        tags: decision.tags ?? [] 
      },
    });

    if (decision.supersedes) {
      await this.graph.addRelation({
        type: InternalRelationTypes.SUPERSEDES,
        sourceEntityId: entityId,
        targetEntityId: decision.supersedes as EntityId,
        properties: {},
        confidence: 1.0,
      });
    }

    return entityId;
  }

  async addADR(adr: {
    number: number;
    title: string;
    status: 'proposed' | 'accepted' | 'deprecated' | 'superseded';
    context: string;
    decision: string;
    consequences?: string;
    tags?: string[];
    authorId?: string;
    supersedes?: number;
  }): Promise<string> {
    const entityId = await this.graph.addEntity({
      type: InternalEntityTypes.ADR,
      name: `ADR-${adr.number}: ${adr.title}`,
      description: adr.context,
      properties: { 
        number: adr.number,
        status: adr.status,
        decision: adr.decision,
        consequences: adr.consequences,
        tags: adr.tags ?? [] 
      },
    });

    if (adr.supersedes) {
      await this.graph.addRelation({
        type: InternalRelationTypes.SUPERSEDES,
        sourceEntityId: entityId,
        targetEntityId: `ADR-${adr.supersedes}` as EntityId,
        properties: {},
        confidence: 1.0,
      });
    }

    return entityId;
  }

  async addRetrospective(retro: {
    projectId: string;
    sprint?: string;
    date: Date;
    whatWentWell: string[];
    whatDidntGoWell: string[];
    actionItems: string[];
    participants?: string[];
  }): Promise<string> {
    return this.graph.addEntity({
      type: InternalEntityTypes.RETROSPECTIVE,
      name: `Retro: ${retro.projectId}${retro.sprint ? ` - ${retro.sprint}` : ''}`,
      description: `Sprint retrospective for ${retro.projectId}`,
      properties: { 
        projectId: retro.projectId,
        sprint: retro.sprint,
        date: retro.date.toISOString(),
        whatWentWell: retro.whatWentWell,
        whatDidntGoWell: retro.whatDidntGoWell,
        actionItems: retro.actionItems,
        participants: retro.participants ?? []
      },
    });
  }

  async addProject(project: {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'archived' | 'planning';
    technologies?: string[];
    teamMembers?: string[];
    startDate?: Date;
    endDate?: Date;
  }): Promise<string> {
    const entityId = await this.graph.addEntity({
      type: InternalEntityTypes.PROJECT,
      name: project.name,
      description: project.description,
      properties: { 
        projectId: project.id,
        status: project.status,
        technologies: project.technologies ?? [],
        teamMembers: project.teamMembers ?? [],
        startDate: project.startDate?.toISOString(),
        endDate: project.endDate?.toISOString(),
      },
    });

    if (project.technologies) {
      for (const tech of project.technologies) {
        const techEntityId = await this.graph.addEntity({
          type: InternalEntityTypes.TECHNOLOGY,
          name: tech,
          description: `Technology used in ${project.name}`,
          properties: {},
        });
        await this.graph.addRelation({
          type: InternalRelationTypes.USES_TECHNOLOGY,
          sourceEntityId: entityId,
          targetEntityId: techEntityId,
          properties: {},
          confidence: 1.0,
        });
      }
    }

    return entityId;
  }

  async addMilestone(milestone: {
    projectId: string;
    name: string;
    description: string;
    dueDate: Date;
    status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  }): Promise<string> {
    const projectEntities = await this.graph.search({ 
      query: `project:${milestone.projectId}`, 
      filters: { entityTypes: [InternalEntityTypes.PROJECT] },
      limit: 1 
    });
    
    const projectEntity = projectEntities.chunks[0]?.document?.metadata?.sourceId as EntityId | undefined;
    
    const entityId = await this.graph.addEntity({
      type: InternalEntityTypes.MILESTONE,
      name: milestone.name,
      description: milestone.description,
      properties: { 
        projectId: milestone.projectId,
        dueDate: milestone.dueDate.toISOString(),
        status: milestone.status,
      },
    });

    if (projectEntity) {
      await this.graph.addRelation({
        type: InternalRelationTypes.HAS_MILESTONE,
        sourceEntityId: projectEntity,
        targetEntityId: entityId,
        properties: {},
        confidence: 1.0,
      });
    }

    return entityId;
  }

  async searchStandards(query: string, options?: { limit?: number }): Promise<RetrievalResult> {
    return this.graph.search({
      query,
      filters: { entityTypes: [InternalEntityTypes.STANDARD] },
      limit: options?.limit ?? 10,
    });
  }

  async searchDecisions(query: string, options?: { limit?: number; status?: string }): Promise<RetrievalResult> {
    return this.graph.search({
      query,
      filters: { entityTypes: [InternalEntityTypes.DECISION] },
      limit: options?.limit ?? 10,
    });
  }

  async searchADRs(query: string, options?: { limit?: number; status?: string }): Promise<RetrievalResult> {
    return this.graph.search({
      query,
      filters: { entityTypes: [InternalEntityTypes.ADR] },
      limit: options?.limit ?? 10,
    });
  }

  async searchProjects(query: string, options?: { limit?: number }): Promise<RetrievalResult> {
    return this.graph.search({
      query,
      filters: { entityTypes: [InternalEntityTypes.PROJECT] },
      limit: options?.limit ?? 10,
    });
  }

  async searchRetrospectives(projectId: string, options?: { limit?: number }): Promise<RetrievalResult> {
    return this.graph.search({
      query: projectId,
      filters: { entityTypes: [InternalEntityTypes.RETROSPECTIVE] },
      limit: options?.limit ?? 20,
    });
  }

  async searchTechnologies(query: string, options?: { limit?: number }): Promise<RetrievalResult> {
    return this.graph.search({
      query,
      filters: { entityTypes: [InternalEntityTypes.TECHNOLOGY] },
      limit: options?.limit ?? 10,
    });
  }

  async getDecisionContext(decisionId: string, depth = 2) {
    return this.graph.getEntityNeighbors(
      decisionId,
      depth,
      [InternalRelationTypes.SUPERSEDES, InternalRelationTypes.RELATES_TO]
    );
  }

  async getProjectContext(projectId: string, depth = 2) {
    return this.graph.getEntityNeighbors(
      projectId,
      depth,
      [InternalRelationTypes.HAS_MILESTONE, InternalRelationTypes.USES_TECHNOLOGY, InternalRelationTypes.PART_OF]
    );
  }

  async getADRHistory(adrNumber: number, depth = 3) {
    return this.graph.getEntityNeighbors(
      `ADR-${adrNumber}`,
      depth,
      [InternalRelationTypes.SUPERSEDES, InternalRelationTypes.RELATES_TO]
    );
  }
}

export function createInternalMemory(config?: InternalConfig): InternalMemory {
  return new InternalMemory(config);
}

export async function getOrgMemory(): Promise<InternalMemory> {
  const memory = createInternalMemory();
  await memory.initialize();
  return memory;
}