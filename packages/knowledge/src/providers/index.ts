import type { ProviderConfig, IKnowledgeProvider, KnowledgeGraphConfig, HealthCheckResult } from '../core/types';
import { KnowledgeGraph } from '../core/knowledge-graph';
import { namespace, tenantId } from '../core/types';

/**
 * Provider Registry - Central registry for knowledge providers
 */
export class ProviderRegistry {
  private providers = new Map<string, IKnowledgeProvider>();
  private defaultProviderName: string | null = null;
  private namespaceProviderMap = new Map<string, string>();

  register(provider: IKnowledgeProvider): void {
    if (this.providers.has(provider.name)) {
      throw new Error(`Provider ${provider.name} already registered`);
    }
    this.providers.set(provider.name, provider);
    if (!this.defaultProviderName) {
      this.defaultProviderName = provider.name;
    }
  }

  unregister(name: string): boolean {
    const deleted = this.providers.delete(name);
    if (this.defaultProviderName === name) {
      this.defaultProviderName = this.providers.keys().next().value ?? null;
    }
    for (const [ns, pn] of this.namespaceProviderMap.entries()) {
      if (pn === name) {
        this.namespaceProviderMap.delete(ns);
      }
    }
    return deleted;
  }

  get(name: string): IKnowledgeProvider | undefined {
    return this.providers.get(name);
  }

  getDefault(): IKnowledgeProvider {
    if (!this.defaultProviderName) {
      throw new Error('No default provider registered');
    }
    const provider = this.providers.get(this.defaultProviderName);
    if (!provider) {
      throw new Error(`Default provider ${this.defaultProviderName} not found`);
    }
    return provider;
  }

  setDefault(name: string): void {
    if (!this.providers.has(name)) {
      throw new Error(`Provider ${name} not registered`);
    }
    this.defaultProviderName = name;
  }

  setNamespaceProvider(namespaceStr: string, providerName: string): void {
    if (!this.providers.has(providerName)) {
      throw new Error(`Provider ${providerName} not registered`);
    }
    this.namespaceProviderMap.set(namespaceStr, providerName);
  }

  getForNamespace(namespaceStr: string): IKnowledgeProvider {
    const providerName = this.namespaceProviderMap.get(namespaceStr);
    if (providerName) {
      const provider = this.providers.get(providerName);
      if (provider) return provider;
    }
    return this.getDefault();
  }

  list(): string[] {
    return Array.from(this.providers.keys());
  }

  async healthCheckAll(): Promise<Map<string, HealthCheckResult>> {
    const results = new Map<string, HealthCheckResult>();
    for (const [name, provider] of this.providers.entries()) {
      try {
        results.set(name, await provider.healthCheck());
      } catch (error) {
        results.set(name, { healthy: false, latencyMs: -1, error: String(error) });
      }
    }
    return results;
  }
}

/**
 * Knowledge - Main entry point and singleton for the knowledge layer
 */
export class Knowledge {
  private registry = new ProviderRegistry();
  private graphCache = new Map<string, KnowledgeGraph>();

  registerProvider(provider: IKnowledgeProvider): void {
    this.registry.register(provider);
  }

  unregisterProvider(name: string): boolean {
    for (const [key, graph] of this.graphCache.entries()) {
      if (graph.provider === this.registry.get(name)) {
        this.graphCache.delete(key);
      }
    }
    return this.registry.unregister(name);
  }

  setDefaultProvider(name: string): void {
    this.registry.setDefault(name);
  }

  setNamespaceProvider(namespaceStr: string, providerName: string): void {
    this.registry.setNamespaceProvider(namespaceStr, providerName);
  }

  getProvider(name: string): IKnowledgeProvider | undefined {
    return this.registry.get(name);
  }

  getDefaultProvider(): IKnowledgeProvider {
    return this.registry.getDefault();
  }

getGraph(config: KnowledgeGraphConfig): KnowledgeGraph {
    const cacheKey = `${config.namespace}:${config.tenantId ?? 'default'}:${config.provider}`;
    let graph = this.graphCache.get(cacheKey);
    if (!graph) {
      const providerName = config.provider
        ? this.registry.get(config.provider)?.name ?? this.registry.getForNamespace(config.namespace).name
        : this.registry.getForNamespace(config.namespace).name;
      graph = new KnowledgeGraph({ ...config, provider: providerName });
      this.graphCache.set(cacheKey, graph);
    }
    return graph;
  }

  getOrgMemory(config?: Partial<KnowledgeGraphConfig>): KnowledgeGraph {
    return this.getGraph({
      namespace: namespace('crewcircle.org'),
      tenantId: tenantId('crewcircle'),
      provider: config?.provider ?? 'embedded',
      ...config,
    });
  }

  getAppGraph(appSlug: string, environment: string, tenantIdStr: string, config?: Partial<KnowledgeGraphConfig>): KnowledgeGraph {
    return this.getGraph({
      namespace: namespace(`${appSlug}.${environment}`),
      tenantId: tenantId(tenantIdStr),
      provider: config?.provider ?? 'postgres',
      ...config,
    });
  }

  getGraphForNamespace(namespaceStr: string, tenantIdStr?: string, providerName?: string): KnowledgeGraph {
    return this.getGraph({
      namespace: namespace(namespaceStr),
      tenantId: tenantIdStr ? tenantId(tenantIdStr) : undefined,
      provider: providerName ?? this.registry.getForNamespace(namespaceStr).name,
    });
  }

  listProviders(): string[] {
    return this.registry.list();
  }

  async healthCheckAll(): Promise<Map<string, HealthCheckResult>> {
    return this.registry.healthCheckAll();
  }

  clearCache(): void {
    this.graphCache.clear();
  }
}

// Singleton instance
export const knowledge = new Knowledge();

export function registerDefaultProviders(embeddedDataDir?: string, postgresConnectionString?: string): void {
  if (embeddedDataDir) {
    const { EmbeddedProvider } = require('./embedded');
    knowledge.registerProvider(new EmbeddedProvider({ dataDir: embeddedDataDir, pythonPath: 'python3' }));
  }
  if (postgresConnectionString) {
    const { PostgresProvider } = require('./postgres');
    knowledge.registerProvider(new PostgresProvider({ connectionString: postgresConnectionString }));
  }
}

export function getOrgMemory(config?: Partial<KnowledgeGraphConfig>): KnowledgeGraph {
  return knowledge.getOrgMemory(config);
}

export function getAppGraph(appSlug: string, environment: string, tenantIdStr: string, config?: Partial<KnowledgeGraphConfig>): KnowledgeGraph {
  return knowledge.getAppGraph(appSlug, environment, tenantIdStr, config);
}

export { KnowledgeGraph, KnowledgeGraphConfig };

export default knowledge;