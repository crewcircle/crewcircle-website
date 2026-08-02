---
type: Package Documentation
title: Observability Package
description: Documentation for the observability package, providing tools for monitoring, logging, and performance tracking.
tags: [package, observability, monitoring, logging, metrics, llm-cost, sentry, uptime]
---
# Observability Package

The `@crewcircle/observability` package (`packages/observability`) provides a suite of tools and utilities for monitoring, logging, and tracking the health and performance of CrewCircle applications. It includes functionalities for LLM cost tracking, health checks, metrics collection, Sentry integration, and uptime monitoring.

## Purpose

This package centralizes observability concerns, enabling developers to gain insights into application behavior, identify issues, track resource usage, and ensure system reliability.

## Structure

```
packages/observability/
├── README.md             ← Package documentation (this file)
├── llm_cost/             ← LLM cost tracking utilities
│   └── tracker.py        ← Python script for tracking LLM costs
├── nextjs/               ← Next.js specific observability integrations
│   └── sentry.ts         ← Sentry integration for Next.js applications
├── python/               ← Python utilities for observability
│   ├── crewcircle_observability/
│   │   ├── __init__.py
│   │   ├── health.py     ← Health check utilities
│   │   ├── logging.py    ← Logging configurations and helpers
│   │   ├── metrics.py    ← Metrics collection and reporting
│   │   └── sentry.py     ← Sentry integration for Python applications
│   └── pyproject.toml
├── uptime/               ← Uptime monitoring utilities
│   └── check.py          ← Python script for uptime checks
└── .gitignore
```

## Key Functionality

*   **LLM Cost Tracking**: The `llm_cost/tracker.py` module helps in monitoring and tracking the costs associated with Large Language Model (LLM) usage.
*   **Health Checks**: Provides utilities (`python/crewcircle_observability/health.py`) to implement and report on application health, crucial for readiness and liveness probes in deployment environments.
*   **Logging**: Offers centralized logging configurations and helpers (`python/crewcircle_observability/logging.py`) to ensure consistent and effective log collection.
*   **Metrics**: Facilitates the collection and reporting of application metrics (`python/crewcircle_observability/metrics.py`) for performance monitoring and alerting.
*   **Sentry Integration**: Integrates with Sentry for error tracking and performance monitoring. Dedicated modules for Next.js (`nextjs/sentry.ts`) and Python (`python/crewcircle_observability/sentry.py`) applications.
*   **Uptime Monitoring**: Includes scripts (`uptime/check.py`) for performing uptime checks, potentially integrating with external monitoring services like Uptime Robot.
