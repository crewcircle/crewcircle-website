---
type: Overview
title: CrewCircle Monorepo Quickstart
description: A quickstart guide to the CrewCircle monorepo, outlining its key components and how to get started.
tags: [quickstart, monorepo, overview]
---
# CrewCircle Monorepo Quickstart

Welcome to the CrewCircle monorepo! This repository contains various services, applications, and infrastructure code designed to support CrewCircle's operations. This document provides a high-level overview of the monorepo's structure and guides you to more detailed documentation for each major component.

## Getting Started

To get a local development environment up and running, refer to the root [README.md](/README.md) for initial setup instructions, including prerequisites for Python, Node.js, Playwright, and Pulumi.

## Key Components

The monorepo is organized into several key packages and applications:

*   **[Account Setup](/openwiki/packages/account-setup.md)**: Tools for automating the creation and configuration of various vendor accounts.
*   **[Authentication](/openwiki/packages/auth.md)**: Centralized authentication services using Supabase, providing multi-tenant organization helpers for both TypeScript and Python applications.
*   **[Database](/openwiki/packages/database.md)**: Database client factories, Row-Level Security (RLS) helpers, and the base schema for multi-tenant applications using Supabase Postgres.
*   **[Docs Generator](/openwiki/packages/docs-gen.md)**: A utility for generating documentation within the monorepo.
*   **[Infrastructure](/openwiki/packages/infra.md)**: Pulumi-based Infrastructure as Code (IaC) for managing CrewCircle's cloud resources, including master and per-project stacks.
*   **[Knowledge Layer](/openwiki/packages/knowledge.md)**: An internal knowledge graph and external application context layer for AI memory and RAG (Retrieval Augmented Generation).
*   **[Observability](/openwiki/packages/observability.md)**: A suite of tools for monitoring, logging, and tracking the health and performance of applications, including LLM cost tracking, health checks, metrics, Sentry integration, and uptime monitoring.
*   **[Backstage Portal](/openwiki/backstage-portal.md)**: A developer portal built on Backstage, providing a centralized view for services, documentation, and tools.
*   **[Website (Next.js)](/openwiki/website.md)**: The main Next.js web application, serving as the marketing site and potentially other user-facing interfaces.

---

## Backlog

*   Explore `src/lib/admin` for potential admin-related documentation.
