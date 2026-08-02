---
type: Package Documentation
title: Knowledge Layer Package
description: Documentation for the knowledge package, providing an internal organization memory and external application context layer.
tags: [package, knowledge-graph, rag, ai-memory, vector-database, postgres]
---
# Knowledge Layer Package

The `@crewcircle/knowledge` package (`packages/knowledge`) serves as CrewCircle's internal organization memory and external application context layer. It is designed to support AI functionalities, including Retrieval Augmented Generation (RAG).

## Purpose

This package aims to create a centralized, queryable knowledge base by ingesting data from various sources. It facilitates enhanced AI capabilities by providing relevant context to large language models.

## Structure

```
packages/knowledge/
├── package.json          ← npm package metadata
├── src/                  ← Source code
│   ├── backup/           ← R2 backup utilities (e.g., r2-backup.ts)
│   ├── core/             ← Core knowledge graph logic (e.g., knowledge-graph.ts, types.ts)
│   ├── external/         ← Integrations with external knowledge sources
│   ├── internal/         ← Logic for internal knowledge sources
│   └── providers/        ← Data storage and retrieval providers
│       ├── embedded/     ← Embedded data providers
│       ├── mock/         ← Mock provider for testing
│       └── postgres/     ← Postgres provider (likely utilizing pgvector)
├── test/                 ← Unit and integration tests
├── tsconfig.json         ← TypeScript configuration
└── vitest.config.ts      ← Vitest test configuration
```

## Key Functionality

*   **Knowledge Graph**: Central component for organizing and querying knowledge.
*   **RAG (Retrieval Augmented Generation)**: Provides context to AI models for generating more informed responses.
*   **Data Ingestion**: Supports ingestion from various internal and external sources.
*   **Vector Database Integration**: Likely uses `pgvector` with PostgreSQL for efficient semantic search and retrieval.
*   **Backup**: Includes utilities for backing up knowledge data, e.g., to Cloudflare R2 storage.
*   **Providers**: Modular design allowing different storage and retrieval backends (e.g., PostgreSQL, mock).

## Technologies Used

*   **TypeScript**: Primary development language.
*   **PostgreSQL with `pgvector`**: For storing and querying vector embeddings.
*   **OpenAI/AI SDK**: For interacting with large language models.
*   **Cloudflare R2**: For object storage and backups.

