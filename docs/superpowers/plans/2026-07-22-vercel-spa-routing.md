# Vercel SPA Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Vite SPA load correctly at `/`, on direct navigation to React Router paths, and after browser refreshes on Vercel.

**Architecture:** Vercel rewrites non-API paths to `index.html`, allowing `BrowserRouter` to resolve client routes. React Router maps `/` to the authenticated landing page and maps unknown client paths back to `/`.

**Tech Stack:** Vite 8, React 19, React Router 7, Vercel rewrites

## Global Constraints

- Keep `BrowserRouter`.
- Preserve the external `/api/:path*` reverse proxy before the SPA catch-all rewrite.
- Do not change API or WebSocket runtime configuration.

---

### Task 1: Vercel SPA fallback

**Files:**
- Create: `vercel.json`

**Interfaces:**
- Consumes: incoming Vercel request paths
- Produces: external API proxying and `index.html` fallback for client routes

- [ ] Add the `/api/:path*` external rewrite followed by the `/(.*)` SPA fallback.
- [ ] Validate the JSON structure and run the production build.

### Task 2: Root and unknown client routes

**Files:**
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: React Router locations `/` and unmatched paths
- Produces: authenticated root navigation to `/matching`; unauthenticated navigation remains controlled by `ProtectedRoute`

- [ ] Import `Navigate` from `react-router-dom`.
- [ ] Add `/` inside `ProtectedRoute`, redirecting authenticated users to `/matching`.
- [ ] Add a final wildcard route redirecting unknown client paths to `/`.
- [ ] Run lint and production build.

