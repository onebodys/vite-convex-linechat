Before submitting changes:
- Ensure `.env.local` contains required LINE credentials (`LINE_CHANNEL_SECRET`, `LINE_CHANNEL_ACCESS_TOKEN`) so Convex/LINE flows run locally.
- Run `npm run lint` and `npm run build` (per README) to verify formatting/type safety; run `npm run test` or targeted Vitest suites when applicable.
- For LINE/webhook changes, exercise flows against local Convex via `npm run dev` and capture console/browser output for the PR description.
- Reference `todo.md` for pending work and update as needed.