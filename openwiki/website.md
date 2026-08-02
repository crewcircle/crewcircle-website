---
type: Application Documentation
title: Next.js Website Application
description: Documentation for the main Next.js web application, serving as the marketing site and user-facing interfaces.
tags: [application, nextjs, react, frontend, website, marketing]
---
# Next.js Website Application

This directory (`src/app/`) contains the main Next.js web application. It serves as the primary marketing website for CrewCircle and hosts various user-facing interfaces and content.

## Purpose

This application is built with Next.js to provide a fast, SEO-friendly, and scalable platform for CrewCircle's online presence, marketing efforts, and potentially core product features.

## Getting Started

To run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. You can edit pages in `app/` and the changes will hot-reload.

## Structure Overview

The `src/app` directory follows Next.js's App Router conventions:

```
src/app/
├── admin/                   ← Admin-related pages and APIs
├── api/                     ← API routes (e.g., admin, registry)
├── blog/                    ← Blog posts
├── cardsnap/                ← CardSnap specific pages (e.g., privacy-policy)
├── documentation/           ← General documentation page
├── locations/               ← Location-specific pages
├── pricing/                 ← Pricing page
├── privacy/                 ← Privacy policy page
├── solutions/               ← Solutions overview page
├── terms/                   ← Terms and conditions page
├── globals.css              ← Global styles
├── layout.tsx               ← Root layout for the application
├── page.tsx                 ← Main landing page
├── favicon.ico              ← Favicon
├── robots.ts                ← Robots.txt generation
└── sitemap.ts               ← Sitemap generation
```

## Key Technologies

*   **Next.js**: React framework for building server-rendered and statically generated web applications.
*   **React**: JavaScript library for building user interfaces.
*   **TypeScript**: Statically typed superset of JavaScript.
*   **Tailwind CSS (implied)**: Often used with Next.js for utility-first styling (indicated by `globals.css` and `postcss.config.mjs`).

## Deployment

This Next.js application is designed for deployment on platforms like Vercel, which provides seamless integration and optimization for Next.js projects.

For more details on Next.js, refer to the [Next.js Documentation](https://nextjs.org/docs).
