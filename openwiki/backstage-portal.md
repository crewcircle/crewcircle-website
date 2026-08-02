---
type: Application Documentation
title: Backstage Developer Portal
description: Documentation for the Backstage developer portal application.
tags: [application, backstage, developer-portal, frontend, typescript, yarn]
---
# Backstage Developer Portal

This directory (`backstage-portal/`) contains the Backstage developer portal application. Backstage is an open-source platform for building developer portals, providing a unified experience for managing services, tools, and documentation.

## Purpose

The Backstage portal serves as a central hub for developers within CrewCircle, offering a catalog of services, documentation, and various developer tools to streamline workflows and improve productivity.

## Getting Started

To start the Backstage application locally:

```bash
yarn install
yarn start
```

This will typically launch the Backstage frontend and backend services.

## Structure Overview

```
backstage-portal/
├── app-config.yaml              ← Main application configuration
├── app-config.production.yaml   ← Production specific application configuration
├── backstage.json               ← Backstage project metadata
├── catalog-info.yaml            ← Example catalog entity definitions
├── examples/                    ← Example entity and template definitions
├── packages/                    ← Internal Backstage packages (e.g., app, backend)
│   ├── app/                     ← Frontend application for Backstage UI
│   └── backend/                 ← Backend services for Backstage
├── plugins/                     ← Custom or external Backstage plugins
└── yarn.lock                    ← Yarn dependency lock file
```

## Key Features

*   **Software Catalog**: Discover and manage all software components, services, and APIs.
*   **Scaffolding**: Create new projects and components from templates.
*   **Documentation**: Centralized documentation for services and APIs.
*   **Integrations**: Extensible with various plugins for integrating with other developer tools.

## Configuration

The primary configuration files are `app-config.yaml` and `app-config.production.yaml`. These files define various aspects of the Backstage application, including:

*   Backend service settings.
*   Catalog entity providers.
*   Authentication providers.
*   Plugin configurations.

## Development

For local development, after cloning the repository, ensure all dependencies are installed with `yarn install` and then start the application with `yarn start`. The Backstage documentation provides comprehensive guides for extending and customizing the portal.
