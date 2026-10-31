# Principles

The choices this repository makes, why they were made, and the tool that keeps each one true. A principle without an enforcing tool is a habit we try to keep and cannot prove.

## Latest stable only

Every tool and dependency is its newest stable release; no canary, beta or release candidates. Old pins hide problems until they are expensive. Versions are written once, in the manifests (`package.json`, `pnpm-workspace.yaml`, `.nvmrc`), and prose never repeats them, so they cannot disagree.

Enforced by: `pnpm outdated -r` (the `update-deps` skill runs it) and `pnpm verify`, whose container reads the Node and pnpm versions from the manifests.

## Libraries lead no further than their consumers

The versions we ask consumers to have (`peerDependencies`, `engines`) are never raised ahead of the ecosystem they run in. Raising them early breaks installs for people who did nothing wrong.

Enforced by: the `update-deps` skill's rule on consumer ranges, reviewed in pull requests.

## Rules are kept by tools, not by prose

If a rule can be measured, a script or lint rule measures it and fails the build. If it cannot be measured, we should be able to say what breaks when it is ignored; if we cannot, it does not belong in the docs.

Enforced by: ESLint, TypeScript `strict`, Prettier, and the `check:*` scripts.

## One gate

A single command runs formatting, lint with zero warnings, typecheck, index and docs checks, tests and the build. People and agents run it, the `pre-push` hook runs it, so "done" means the same thing to all of them, and its output is the evidence.

Enforced by: `pnpm check`, run by the `pre-push` hook (lefthook) and, for `main` and `develop`, by `pnpm verify` in a clean Docker container.

## What exists must be findable

Duplicated helpers happen when people cannot find the existing one. Every export carries a JSDoc first sentence; from it a generated index and per-file docs are built. A missing or stale sentence fails the gate.

Enforced by: `pnpm check:index`, `pnpm check:docs`; regenerate with `pnpm index`.

## Neutral about coding agents

Instructions for coding agents live in `AGENTS.md` and `.agents/skills/`, the files most agents already read. A tool-specific file exists only where a tool cannot read these, and it adds no content of its own: `.claude/skills` is a link to the skills folder and `CLAUDE.md` is a single line importing `AGENTS.md`.

Enforced by: review; the files are small enough to check at a glance.

## Only the final state is kept

Documents and code describe how things are now. History belongs to `git log`, not to changelogs, "formerly" sections or deprecated aliases. When a name changes, the old name is removed.

Enforced by: code review.

## Choices

| Concern             | Choice                                  | Why                                                             |
| ------------------- | --------------------------------------- | --------------------------------------------------------------- |
| Repository layout   | One repository, one package             | The repository root is the package: no workspace to maintain    |
| Language            | TypeScript, `strict`                    | Types are the source for generated docs                         |
| Bundling            | tsup                                    | ESM and CJS builds with type declarations from one small config |
| Tests               | vitest                                  | Fast unit tests with a coverage threshold in the same run       |
| Lint and formatting | ESLint with typescript-eslint, Prettier | One lint pass with zero warnings, one formatter                 |
