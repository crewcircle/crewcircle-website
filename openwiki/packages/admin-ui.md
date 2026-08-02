---
type: Package Documentation
title: Admin UI Package
description: Documentation for the admin-ui package, containing shared UI components for CrewCircle internal administrative tools.
tags: [package, admin, ui, react, components, shared]
---
# Admin UI Package

The `@crewcircle/admin-ui` package (`packages/admin-ui`) provides a collection of shared UI components specifically designed for CrewCircle's internal administrative tools. This package is private, meaning its intended use is within the monorepo for building consistent and efficient admin interfaces.

## Purpose

The primary goal of this package is to establish a consistent look and feel and to reuse common UI patterns across different administrative applications. By centralizing these components, development effort is reduced, and the user experience for internal tools is improved.

## Structure

```
packages/admin-ui/
├── package.json          ← npm package metadata
├── src/                  ← Source code for UI components
│   ├── admin-shell.tsx   ← Admin shell layout component
│   ├── admin-topbar.tsx  ← Admin top bar component
│   ├── cost-chart.tsx    ← Component for displaying cost charts
│   ├── data-table.tsx    ← Generic data table component
│   ├── index.ts          ← Barrel export for components
│   ├── project-card.tsx  ← Component for displaying project information
│   ├── stat-card.tsx     ← Component for displaying statistics
│   ├── status-badge.tsx  ← Component for displaying status badges
│   └── types.ts          ← TypeScript type definitions
└── tsconfig.json         ← TypeScript configuration
```

## Key Functionality and Components

*   **Layout Components**: `admin-shell.tsx` and `admin-topbar.tsx` provide the fundamental layout and navigation for admin applications.
*   **Data Visualization**: `cost-chart.tsx` is a specialized component for presenting cost-related data graphically.
*   **Data Display**: `data-table.tsx` offers a reusable solution for presenting tabular data, while `project-card.tsx` and `stat-card.tsx` are designed for displaying specific types of information in a card format.
*   **Status Indicators**: `status-badge.tsx` provides a visual cue for various statuses.

## Usage

Components from this package are consumed by other CrewCircle applications that require administrative interfaces, such as the `src/app/admin` pages in the main Next.js website. Developers would import and utilize these React components to build their admin UIs.

```tsx
import { AdminShell, DataTable, StatCard } from "@crewcircle/admin-ui";

function MyAdminPage() {
  return (
    <AdminShell>
      <StatCard title="Total Projects" value="15" />
      {/* ... other admin content */}
    </AdminShell>
  );
}
```

## Technologies

*   **React**: For building user interfaces.
*   **TypeScript**: Ensures type safety and improves developer experience.
*   **Tailwind CSS Utilities**: `class-variance-authority`, `clsx`, and `tailwind-merge` indicate the use of utility-first CSS principles, likely with Tailwind CSS for styling.
