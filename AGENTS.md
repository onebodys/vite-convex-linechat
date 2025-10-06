# Repository Guidelines

## Project Structure & Module Organization
- `src/` houses the React 19 front end (`main.tsx`, `App.tsx`, local state) and `src/assets/` for bundled media.
- `public/` serves static assets untouched by Vite; place favicons or LINE branding imagery here.
- `convex/` contains the Convex backend: author queries/mutations beside `schema.ts`; never modify `convex/_generated/` manually.
- Tooling roots live at the repo top-level (`biome.jsonc`, `lefthook.yml`, `tsconfig.*`); update these before large structural shifts.
- Environment variables required by Convex live in `env.ts`; this module validates `LINE_CHANNEL_SECRET` と `LINE_CHANNEL_ACCESS_TOKEN` at load time, so keep it in sync with any new secrets.

## Build, Test, and Development Commands
- `npm run dev` launches the Vite dev server; start `npx convex dev` in a second terminal to emulate the backend.
- `npm run build` performs a TypeScript project build (`tsc -b`) then produces the optimized Vite bundle.
- `npm run preview` serves the last production build for smoke testing.
- `npm run lint` checks style with Biome; `npm run format` applies fixes. `npm run knip` flags unused modules and exports.
- Install lefthook once via `npx lefthook install` so `pre-commit` runs `npx @biomejs/biome check --write` on staged files.

## Coding Style & Naming Conventions
- Biome enforces 2-space indentation and a 100-character line width—run the formatter before committing.
- Use PascalCase for React components (`ChatPanel.tsx`), camelCase for functions and hooks, and kebab-case for asset filenames.
- Keep shared types in TypeScript modules close to their usage; export Convex validators from `convex/` to avoid drift between client and server.
- Prefer pure functions and descriptive names over comments; document non-obvious Convex data flows in code docblocks when required.

## Testing Guidelines
- Automated tests are not yet configured; when adding `vitest` or Convex test utilities, colocate specs as `*.test.ts(x)` near implementations.
- Until then, verify changes by running `npm run build`, `npm run lint`, exercising chat flows against `npx convex dev`, and recording manual results in the PR description.

## Commit & Pull Request Guidelines
- Follow the observed `<scope>: <summary>` convention (`convex: add message status index`); use present tense and keep scopes short (`docs`, `ui`, `convex`).
- Group related changes per commit, include TypeScript or schema migrations in the same commit when tightly coupled, and avoid noisy formatting-only diffs.
- PRs must describe motivation, testing evidence, linked issues, and include screenshots or terminal captures for UI/backend changes. Note any new env vars (`CONVEX_DEPLOYMENT`, LINE secrets) and rollout steps.
- When adding new backend secrets, register them with Convex and extend `env.ts` so deployments fail fast if they’re missing.
