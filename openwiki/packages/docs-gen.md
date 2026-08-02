---
type: Package Documentation
title: Docs Generator Package
description: Documentation for the docs-gen package, a utility for generating documentation from templates.
tags: [package, docs, generation, templates]
---
# Docs Generator Package

The `@crewcircle/docs-gen` package (`packages/docs-gen`) is a utility designed to generate documentation from templates. It appears to support different documentation formats or audiences, as suggested by its template files.

## Purpose

This package automates the process of creating various documentation artifacts, likely using predefined templates and potentially injecting dynamic content.

## Structure

```
packages/docs-gen/
├── CHANGELOG.md          ← Change log for the package
├── package.json          ← npm package metadata
├── src/                  ← Source code for the documentation generator
│   ├── cli.ts            ← Command-line interface for the generator
│   ├── defaults.ts       ← Default configurations or content
│   └── index.ts          ← Main entry point for the generator logic
├── templates/            ← Documentation templates
│   ├── INSTRUCTIONS.client.md      ← Template for client-facing instructions
│   └── INSTRUCTIONS.engineering.md ← Template for engineering instructions
├── test/                 ← Unit tests for the package
└── tsconfig.json         ← TypeScript configuration
```

## Usage

Based on the `cli.ts` file, this package likely provides a command-line interface for generating documentation. Specific commands and options would be detailed within the CLI or its internal documentation.

Example (speculative):

```bash
npm run docs-gen generate --template client --output ./docs/client-instructions.md
```

## Key Functionality

*   **Template-based Generation**: Uses predefined Markdown templates to structure generated documents.
*   **Command-Line Interface**: Provides a CLI for easy execution and integration into build processes.
*   **Audience-specific Templates**: Supports different templates for various audiences (e.g., client, engineering) to tailor the content and tone.

