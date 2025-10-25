# Codex Execution Plans (ExecPlans):
 
This document describes the requirements for an execution plan ("ExecPlan"), a design document that a coding agent can follow to deliver a working feature or system change. Treat the reader as a complete beginner to this repository: they have only the current working tree and the single ExecPlan file you provide. There is no memory of prior plans and no external context.
 
## How to use ExecPlans and PLANS.md
 
When authoring an executable specification (ExecPlan), follow PLANS.md _to the letter_. If it is not in your context, refresh your memory by reading the entire PLANS.md file. Be thorough in reading (and re-reading) source material to produce an accurate specification. When creating a spec, start from the skeleton and flesh it out as you do your research.
 
When implementing an executable specification (ExecPlan), do not prompt the user for "next steps"; simply proceed to the next milestone. Keep all sections up to date, add or split entries in the list at every stopping point to affirmatively state the progress made and next steps. Resolve ambiguities autonomously, and commit frequently.
 
When discussing an executable specification (ExecPlan), record decisions in a log in the spec for posterity; it should be unambiguously clear why any change to the specification was made. ExecPlans are living documents, and it should always be possible to restart from _only_ the ExecPlan and no other work.
 
When researching a design with challenging requirements or significant unknowns, use milestones to implement proof of concepts, "toy implementations", etc., that allow validating whether the user's proposal is feasible. Read the source code of libraries by finding or acquiring them, research deeply, and include prototypes to guide a fuller implementation.
 
## Requirements
 
NON-NEGOTIABLE REQUIREMENTS:
 
* Every ExecPlan must be fully self-contained. Self-contained means that in its current form it contains all knowledge and instructions needed for a novice to succeed.
* Every ExecPlan is a living document. Contributors are required to revise it as progress is made, as discoveries occur, and as design decisions are finalized. Each revision must remain fully self-contained.
* Every ExecPlan must enable a complete novice to implement the feature end-to-end without prior knowledge of this repo.
* Every ExecPlan must produce a demonstrably working behavior, not merely code changes to "meet a definition".
* Every ExecPlan must define every term of art in plain language or do not use it.
 
Purpose and intent come first. Begin by explaining, in a few sentences, why the work matters from a user's perspective: what someone can do after this change that they could not do before, and how to see it working. Then guide the reader through the exact steps to achieve that outcome, including what to edit, what to run, and what they should observe.
 
The agent executing your plan can list files, read files, search, run the project, and run tests. It does not know any prior context and cannot infer what you meant from earlier milestones. Repeat any assumption you rely on. Do not point to external blogs or docs; if knowledge is required, embed it in the plan itself in your own words. If an ExecPlan builds upon a prior ExecPlan and that file is checked in, incorporate it by reference. If it is not, you must include all relevant context from that plan.
 
## Formatting
 
Format and envelope are simple and strict. Each ExecPlan must be one single fenced code block labeled as `md` that begins and ends with triple backticks. Do not nest additional triple-backtick code fences inside; when you need to show commands, transcripts, diffs, or code, present them as indented blocks within that single fence. Use indentation for clarity rather than code fences inside an ExecPlan to avoid prematurely closing the ExecPlan's code fence. Use two newlines after every heading, use # and ## and so on, and correct syntax for ordered and unordered lists.
 
When writing an ExecPlan to a Markdown (.md) file where the content of the file *is only* the single ExecPlan, you should omit the triple backticks.
 
Write in plain prose. Prefer sentences over lists. Avoid checklists, tables, and long enumerations unless brevity would obscure meaning. Checklists are permitted only in the `Progress` section, where they are mandatory. Narrative sections must remain prose-first.
 
## Guidelines
 
Self-containment and plain language are paramount. If you introduce a phrase that is not ordinary English ("daemon", "middleware", "RPC gateway", "filter graph"), define it immediately and remind the reader how it manifests in this repository (for example, by naming the files or commands where it appears). Do not say "as defined previously" or "according to the architecture doc." Include the needed explanation here, even if you repeat yourself.
 
Avoid common failure modes. Do not rely on undefined jargon. Do not describe "the letter of a feature" so narrowly that the resulting code compiles but does nothing meaningful. Do not outsource key decisions to the reader. When ambiguity exists, resolve it in the plan itself and explain why you chose that path. Err on the side of over-explaining user-visible effects and under-specifying incidental implementation details.
 
Anchor the plan with observable outcomes. State what the user can do after implementation, the commands to run, and the outputs they should see. Acceptance should be phrased as behavior a human can verify ("after starting the server, navigating to [http://localhost:8080/health](http://localhost:8080/health) returns HTTP 200 with body OK") rather than internal attributes ("added a HealthCheck struct"). If a change is internal, explain how its impact can still be demonstrated (for example, by running tests that fail before and pass after, and by showing a scenario that uses the new behavior).
 
Specify repository context explicitly. Name files with full repository-relative paths, name functions and modules precisely, and describe where new files should be created. If touching multiple areas, include a short orientation paragraph that explains how those parts fit together so a novice can navigate confidently. When running commands, show the working directory and exact command line. When outcomes depend on environment, state the assumptions and provide alternatives when reasonable.
 
Be idempotent and safe. Write the steps so they can be run multiple times without causing damage or drift. If a step can fail halfway, include how to retry or adapt. If a migration or destructive operation is necessary, spell out backups or safe fallbacks. Prefer additive, testable changes that can be validated as you go.
 
Validation is not optional. Include instructions to run tests, to start the system if applicable, and to observe it doing something useful. Describe comprehensive testing for any new features or capabilities. Include expected outputs and error messages so a novice can tell success from failure. Where possible, show how to prove that the change is effective beyond compilation (for example, through a small end-to-end scenario, a CLI invocation, or an HTTP request/response transcript). State the exact test commands appropriate to the project’s toolchain and how to interpret their results.
 
Capture evidence. When your steps produce terminal output, short diffs, or logs, include them inside the single fenced block as indented examples. Keep them concise and focused on what proves success. If you need to include a patch, prefer file-scoped diffs or small excerpts that a reader can recreate by following your instructions rather than pasting large blobs.
 
## Milestones
 
Milestones are narrative, not bureaucracy. If you break the work into milestones, introduce each with a brief paragraph that describes the scope, what will exist at the end of the milestone that did not exist before, the commands to run, and the acceptance you expect to observe. Keep it readable as a story: goal, work, result, proof. Progress and milestones are distinct: milestones tell the story, progress tracks granular work. Both must exist. Never abbreviate a milestone merely for the sake of brevity, do not leave out details that could be crucial to a future implementation.
 
Each milestone must be independently verifiable and incrementally implement the overall goal of the execution plan.
 
## Living plans and design decisions
 
* ExecPlans are living documents. As you make key design decisions, update the plan to record both the decision and the thinking behind it. Record all decisions in the `Decision Log` section.
* ExecPlans must contain and maintain a `Progress` section, a `Surprises & Discoveries` section, a `Decision Log`, and an `Outcomes & Retrospective` section. These are not optional.
* When you discover optimizer behavior, performance tradeoffs, unexpected bugs, or inverse/unapply semantics that shaped your approach, capture those observations in the `Surprises & Discoveries` section with short evidence snippets (test output is ideal).
* If you change course mid-implementation, document why in the `Decision Log` and reflect the implications in `Progress`. Plans are guides for the next contributor as much as checklists for you.
* At completion of a major task or the full plan, write an `Outcomes & Retrospective` entry summarizing what was achieved, what remains, and lessons learned.
 
# Prototyping milestones and parallel implementations
 
It is acceptable—-and often encouraged—-to include explicit prototyping milestones when they de-risk a larger change. Examples: adding a low-level operator to a dependency to validate feasibility, or exploring two composition orders while measuring optimizer effects. Keep prototypes additive and testable. Clearly label the scope as “prototyping”; describe how to run and observe results; and state the criteria for promoting or discarding the prototype.
 
Prefer additive code changes followed by subtractions that keep tests passing. Parallel implementations (e.g., keeping an adapter alongside an older path during migration) are fine when they reduce risk or enable tests to continue passing during a large migration. Describe how to validate both paths and how to retire one safely with tests. When working with multiple new libraries or feature areas, consider creating spikes that evaluate the feasibility of these features _independently_ of one another, proving that the external library performs as expected and implements the features we need in isolation.
 
## Skeleton of a Good ExecPlan
 
```md
# <Short, action-oriented description>
 
This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.
 
If PLANS.md file is checked into the repo, reference the path to that file here from the repository root and note that this document must be maintained in accordance with PLANS.md.
 
## Purpose / Big Picture
 
Explain in a few sentences what someone gains after this change and how they can see it working. State the user-visible behavior you will enable.
 
## Progress
 
Use a list with checkboxes to summarize granular steps. Every stopping point must be documented here, even if it requires splitting a partially completed task into two (“done” vs. “remaining”). This section must always reflect the actual current state of the work.
 
- [x] (2025-10-01 13:00Z) Example completed step.
- [ ] Example incomplete step.
- [ ] Example partially completed step (completed: X; remaining: Y).
 
Use timestamps to measure rates of progress.
 
## Surprises & Discoveries
 
Document unexpected behaviors, bugs, optimizations, or insights discovered during implementation. Provide concise evidence.
 
- Observation: …
  Evidence: …
 
## Decision Log
 
Record every decision made while working on the plan in the format:
 
- Decision: …
  Rationale: …
  Date/Author: …
 
## Outcomes & Retrospective
 
Summarize outcomes, gaps, and lessons learned at major milestones or at completion. Compare the result against the original purpose.
 
## Context and Orientation
 
Describe the current state relevant to this task as if the reader knows nothing. Name the key files and modules by full path. Define any non-obvious term you will use. Do not refer to prior plans.
 
## Plan of Work
 
Describe, in prose, the sequence of edits and additions. For each edit, name the file and location (function, module) and what to insert or change. Keep it concrete and minimal.
 
## Concrete Steps
 
State the exact commands to run and where to run them (working directory). When a command generates output, show a short expected transcript so the reader can compare. This section must be updated as work proceeds.
 
## Validation and Acceptance
 
Describe how to start or exercise the system and what to observe. Phrase acceptance as behavior, with specific inputs and outputs. If tests are involved, say "run <project’s test command> and expect <N> passed; the new test <name> fails before the change and passes after>".
 
## Idempotence and Recovery
 
If steps can be repeated safely, say so. If a step is risky, provide a safe retry or rollback path. Keep the environment clean after completion.
 
## Artifacts and Notes
 
Include the most important transcripts, diffs, or snippets as indented examples. Keep them concise and focused on what proves success.
 
## Interfaces and Dependencies

Be prescriptive. Name the libraries, modules, and services to use and why.

```md
# ExecPlan: Enable LINE Rich Media Messaging

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds. Maintain this plan in accordance with `.agents/PLANS.md` in the repository root.

## Purpose / Big Picture

We need to evolve the LINE chat prototype into a foundation that can store, resend, and present any LINE message type (text, images, documents) with reliable delivery records. After this change an operator can view mixed media conversations, resend failed pushes, and audit both inbound and outbound traffic from a single timeline.

## Milestones

Milestone 1 establishes the schema and backend storage model for rich message content and delivery attempts. Milestone 2 teaches the webhook and delivery actions to persist and replay media payloads. Milestone 3 updates the React UI to render the new content abstraction. Milestone 4 performs end-to-end validation, documents operational impacts, and removes dead fields.

## Progress

- [x] (2025-10-16 05:20Z) Reviewed current Convex schema and delivery pipeline to scope required refactors.
- [x] (2025-10-16 05:45Z) Finalized rich-content schema design and delivery logging data model within this plan.
- [x] (2025-10-16 06:05Z) Rewrote `convex/schema.ts` with content unions, delivery logging table, and updated indexes per Milestone 1.
- [x] (2025-10-16 07:05Z) Updated Convex mutations/actions to the new schema, introduced `messageDeliveries` retries, refreshed webhook/user-state logic, and migrated legacy data via `internal.maintenance.migrations.migrateRichMessaging`.
- [x] (2025-10-16 07:45Z) Added LINE media ingestion pipeline (`convex/line/content.ts`), stored incoming media/sticker/location messages with rich metadata, and updated webhook persistence accordingly.
- [x] (2025-10-16 08:25Z) Surfaced media in the UI via timeline query, storage URLs, and chat bubble previews for images/video/audio/files.
- [ ] (2025-10-16 08:25Z) Update README(ja/en) with rich media workflow and outline manual verification steps.
- [ ] (2025-10-16 05:20Z) Adapt React chat components to consume the new message model.
- [ ] (2025-10-16 05:20Z) Run validation steps, capture evidence, and update documentation.

## Surprises & Discoveries

- Observation: Convex rejected the new schema because the existing dev deployment still stored `messages.text`, `lineEvents` without `source`, and `lineUserStates.lastMessageText`.
  Evidence: `npx convex dev --once` failures followed by `npx convex run internal.maintenance.migrations.migrateRichMessaging` returning `{ migratedMessages: 11, patchedEvents: 10, patchedStates: 1 }`.
- Observation: The JSON client from `@line/bot-sdk` does not expose `getMessageContent`, so binary fetches require the blob client.
  Evidence: TypeScript errors during `npm run build` resolved by introducing `MessagingApiBlobClient` and a dedicated helper in `convex/line/content.ts`.

## Decision Log

- Decision: Capture outgoing push message attempts inside `lineEvents` with a new `source` discriminator and shared identifiers.
  Rationale: Housing inbound webhooks and outbound pushes in one indexed table simplifies incident audits and aligns with the operator needs surfaced in README diagrams.
  Date/Author: 2025-10-16 / Codex.
- Decision: Represent message bodies with a `content` union (`text`, `media`, `template`) and move retry metadata into a dedicated `messageDeliveries` table keyed by attempt order.
  Rationale: Separating immutable message content from mutable delivery attempts keeps schema extensible for future content types and prevents status fields from being overloaded.
  Date/Author: 2025-10-16 / Codex.
- Decision: Ship an internal maintenance migration to patch legacy documents before enforcing required fields.
  Rationale: The existing dev deployment contained historical webhook data lacking `source` and `content`, so automated migration keeps production parity while allowing a strict schema afterwards.
  Date/Author: 2025-10-16 / Codex.
- Decision: Use LINEの `MessagingApiBlobClient` for mediaダウンロード while keeping `MessagingApiClient` for JSON API calls.
  Rationale: `MessagingApiClient` lacks `getMessageContent`, and separating clients avoids re-authenticating for every request.
  Date/Author: 2025-10-16 / Codex.

## Outcomes & Retrospective

To be completed after milestones finish; summarize observed behavior, operator feedback, and any follow-up work.

## Context and Orientation

The Convex backend exposes tables defined in `convex/schema.ts`. Incoming LINE webhooks are processed in `convex/line/webhook.ts`, which records events via `convex/line/events.ts` and inserts text messages with `convex/line/messages.ts`. Outgoing messages originate from `convex/line/actions.ts` and are delivered through `convex/line/message_delivery.ts`, with retries scheduled in `convex/line/tasks.ts` and `convex/scheduler.ts`. The React chat UI in `src/components/chat/` assumes `messages` documents contain plain `text`. Convex Storage is available via `_storage` but is not yet leveraged for media payloads. The application is not in production, so destructive schema changes are acceptable once the plan provides a clean rebuild path.

## Plan of Work

For Milestone 1, execute a comprehensive rewrite of `convex/schema.ts`. Introduce `const messageContent = v.union(...)` describing three content families: a `text` variant with `{ text: v.string() }`; a `media` variant with `mediaType` (`image`, `video`, `audio`, `file`, `sticker`), LINE `lineContentId`, optional Convex `storageId`, `previewStorageId`, `fileName`, `mimeType`, `sizeBytes`, `durationMs`, and pixel dimensions; and a `template` variant capturing `templateType`, `altText`, and a JSON-serialised `payload` (store as `v.string()` containing a stable stringified object created elsewhere to keep the validator simple). Replace the existing `messages` definition with fields `lineUserId`, `direction`, `content`, `status` (`pending`, `sent`, `failed`, `canceled`), `deliveryState` (`queued`, `delivering`), `lineMessageId`, `replyToken`, `createdAt`, and `updatedAt`. Drop legacy retry fields that will migrate to a new table, and keep indexes on `byUserCreatedAt` plus add `byLineUserDirectionCreatedAt` (`lineUserId`, `direction`, `createdAt`) for UI filters.

Still in Milestone 1, create a new `messageDeliveries` table holding per-attempt metadata: `messageId`, `attempt` (1-based), `requestedAt`, `completedAt`, `status` (`pending`, `success`, `failed`), `errorMessage`, `responseStatus`, `responseBody`, `nextRetryAt`, and `retryStrategy` (`immediate`, `backoff`, `manual`). Index this table by (`messageId`, `attempt`) and by (`status`, `nextRetryAt`) to power retry scans. Extend `lineEvents` with required fields `source` (`webhook`, `push`, `system`), optional `messageId`, optional `deliveryAttemptId`, optional `deliveryStatusSnapshot` (`pending`, `success`, `failed`), and optional `payloadSummary` string. Keep current indexes and add `byMessage` over (`messageId`, `timestamp`) for cross-linking outbound actions. Update `lineUserStates` to remove `lastMessageText`, add `lastMessageId`, `lastMessageSummary`, and `lastMessagePreviewType` (text, media, template) so the UI can reference the new union without violating MAX length; ensure `summary` is a 140-character max string created downstream, but validated as `v.string()` here.

Add `convex/maintenance/migrations.ts` with an internal mutation that backfills `messages.content`, sets default `lineEvents.source`, and copies `lastMessageText` into `lastMessageSummary`. Run it once after deploying the relaxed schema, then tighten validators to make the new fields mandatory.

For Milestone 2, refactor `convex/line/messages.ts` to create reusable helpers for inserting text and media records, including generating storage entries via a new internal action in `convex/line/content.ts` that streams data from LINE using `client.getMessageContent`. Update `convex/line/webhook.ts` to branch across LINE message types (text, image, video, audio, file, sticker) and persist media metadata plus `_storage` IDs. Ensure follow-up calls to `applyEventToUserState` pass the new summary fields. Modify `convex/line/message_delivery.ts` and `convex/line/tasks.ts` to log each delivery attempt into `messageDeliveries`, set `deliveryState`, and emit matching outbound entries into `lineEvents`.

For Milestone 3, create a shared type guard in `shared/line-user.ts` or `src/lib` describing the `MessageContent` union so both backend and frontend agree. Update `src/components/chat/conversation-timeline.tsx`, `chat-message-bubble.tsx`, and related helpers to render new content kinds, including download links for files stored in Convex Storage and alt text placeholders for unsupported types. Adjust hooks like `use-line-contacts.ts` if they assume plain text. Provide fallbacks to avoid runtime crashes when legacy data is missing `content`.

For Milestone 4, remove now-unused fields (`text` root field, `lastMessageText`, etc.), backfill UI readers to rely on summary fields, update `README.md` and `README-ja.md` with the new capabilities, and document operational steps for resetting tables on development instances. Capture before/after screenshots or transcripts to illustrate mixed media conversation flow.

## Concrete Steps

Author and executor actions happen from `/Users/norxxx/ghq/github.com/onebodys/vite-convex-linechat` unless noted. After schema edits rerun Convex codegen if required.

    npm install
    npm run lint
    npm run build
    npx convex dev --once

If the dev deployment already contains legacy documents, first deploy the relaxed schema, run the migration, then redeploy the strict validators:

    npx convex dev --once --typecheck disable
    npx convex run internal.maintenance.migrations.migrateRichMessaging
    npx convex dev --once

During Milestone 3 testing, start the Vite dev server and Convex backend in separate terminals, send sample LINE messages (text and image) via the LINE sandbox, and verify UI rendering:

    npm run dev
    npx convex dev

If direct LINE sandbox access is unavailable, craft `curl` webhook payloads to `http://localhost:3000/api/line/webhook` using recorded JSON bodies saved under `fixtures/` and verify storage entries through Convex dashboard.

## Validation and Acceptance

Acceptance requires storing and rendering at least one inbound image and one PDF alongside text, with retry logging visible. Confirm that `messages` documents contain `content.kind` reflecting the payload, `messageDeliveries` reflects attempts with success or failure timestamps, and `lineEvents` includes both webhook and push entries with matching `messageId`. Run `npm run lint` and `npm run build` successfully, start both dev servers, trigger a text and image exchange, and observe the React timeline showing appropriate bubbles (image thumbnail or file download button). Simulate a failed push (for example by providing an invalid access token) to confirm `deliveryState` transitions to `failed` and `messageDeliveries` captures the error.

## Idempotence and Recovery

Because the application is pre-production, it is safe to wipe Convex tables between iterations. Running `npx convex dev --reset` recreates tables per the new schema. When storing media, the plan must note that `_storage` assets remain until explicitly deleted; provide a helper script to remove orphaned storage entries if necessary. All commands above can be repeated without side effects, and schema regeneration produces deterministic outputs.

## Artifacts and Notes

While implementing, capture short terminal snippets showing Convex inserts, retry logs, and UI screenshots. Embed key evidence here as indented logs so future contributors can recognize success criteria without reinventing verification steps.

## Interfaces and Dependencies

Use the existing `@line/bot-sdk` client already instantiated in `convex/line/messaging_client.ts` for both `pushMessage` and `getMessageContent`. Rely on Convex Storage (`ctx.storage`) for binary payload retention and reference stored blobs by `_storage` IDs. Ensure React components fetch binary URIs through Convex-provided URLs instead of embedding tokens. No additional npm dependencies are expected beyond those already present; if new types are needed, define them locally to keep the plan self-contained.
```
