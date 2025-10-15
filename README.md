# Vite Convex LINE Chat

English | [日本語](README-ja.md)

## Overview

This project provides a LINE-inspired chat console built with React 19 and Convex. It combines a real-time conversation timeline with contact management so support teams can triage LINE messages from a single workspace.

## Key Features

- Interactive chat layout with conversation list, message bubble components, and a responsive sidebar.
- Convex backend for storing contacts, threads, and webhook events from the LINE Messaging API.
- LINE Bot SDK integration for validating requests and sending replies.
- Utility library in `src/lib/` with shared theming tokens and helpers.

## Tech Stack

- React 19 + TypeScript on top of Vite 7 (Rolldown build).
- Convex functions and database for real-time data access.
- Tailwind CSS for styling with design tokens in `src/lib/theme/tokens.ts`.
- Biome for linting/formatting, Knip for unused code detection, Vitest for future tests.

## Project Structure

- `src/`: React application entry (`main.tsx`, `App.tsx`), chat UI components, hooks, and assets.
- `public/`: Static files served as-is by Vite.
- `convex/`: Convex schema, queries, and mutations (do not edit `convex/_generated/`).
- `shared/`: Cross-runtime types such as LINE user definitions.
- `env.ts`: Zod schema that enforces required LINE credentials at startup.
- Tooling configs (`biome.jsonc`, `knip.json`, `tsconfig.*`, `lefthook.yml`) live at the repository root.

## Getting Started

1. Install dependencies: `npm install`.
2. Export the required environment variables or place them in a `.env.local` file consumed by your shell:
   - `LINE_CHANNEL_SECRET`
   - `LINE_CHANNEL_ACCESS_TOKEN`
3. Start the development servers in one command: `npm run dev`. This runs `convex dev` and `vite --open` in parallel.
4. Open the browser tab launched by Vite to inspect the chat interface. Convex will expose functions at `http://localhost:7878` by default.

## Development Workflow

- `npm run lint`: Check code style with Biome.
- `npm run format`: Apply Biome fixes.
- `npm run build`: Type-check and create a production bundle.
- `npm run preview`: Serve the last production build locally.
- `npm run knip`: Detect unused modules or exports.

Before opening a pull request, run `npm run build` and `npm run lint`, test LINE chat flows against a local Convex deployment (`npx convex dev`), and capture screenshots or terminal output in the PR description.

Refer to `todo.md` for near-term implementation tasks and backlog items.

## Message Retry Flow

Outgoing messages persist to Convex with delivery metadata so both automatic and manual retries share the same path. The diagram below summarizes the flow:

```mermaid
flowchart TD
  A[Agent sends from chat UI] --> B[sendTextMessage action]
  B --> C[createOutgoingTextMessage mutation<br/>status = pending]
  C --> D[deliverTextMessage helper]
  D -->|success| E[updateMessageStatus status = sent<br/>applyEventToUserState]
  D -->|failure| F[updateMessageStatus status = failed<br/>retryCount++, nextRetryAt]
  F --> G{Retry trigger}
  G -->|Retry button| H[resendTextMessage action]
  G -->|Scheduler interval| I[retryFailedMessages internal action]
  H --> D
  I --> D
```

### Implementation Notes

- `deliverTextMessage` centralizes the LINE Push API call and status updates so Convex stays consistent regardless of success or failure.
- Failed deliveries track `retryCount`, `nextRetryAt`, and `lastAttemptAt`, which the `retryFailedMessages` worker uses every minute to decide which records to retry.
- The chat UI exposes a “Retry” button on failed bubbles; manual retries run the same helper, keeping behavior aligned with the scheduled job.
