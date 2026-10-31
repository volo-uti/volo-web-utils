# Contributing

Thank you for helping improve this repository. It is the `@volo-uti/volo-web-utils` package, a set of framework-free helpers.

By taking part you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md). The ideas behind the choices made here are in [PRINCIPLES.md](PRINCIPLES.md).

## Setup

1. Install the Node version in `.nvmrc` (for example with `nvm use`). Node 26 or newer is required to work on this repository; the published package does not require it.
2. Install the pnpm version named by `packageManager` in `package.json`. pnpm picks it up automatically.
3. Install dependencies:

   ```bash
   pnpm install
   ```

Tool and dependency versions live in the manifests (`.nvmrc`, `package.json`, `pnpm-workspace.yaml`) and nowhere else, so always read them there.

## The gate

One command decides whether a change is ready. Run it before every pull request:

```bash
pnpm check
```

It runs formatting, lint (warnings count as failures), typecheck, the index and docs checks, tests and the build. A change is done when `pnpm check` passes. The `pre-push` hook runs it for you, and on `main` and `develop` it runs `pnpm verify`, which runs the same gate in a clean Docker container. On Windows, work inside WSL2.

Other commands you will use:

```bash
pnpm index    # regenerate the agent index and docs/
```

## Project structure

| Path        | What it holds                                                                  |
| ----------- | ------------------------------------------------------------------------------ |
| `src/`      | The helpers, exported from `src/index.ts`                                      |
| `docs/`     | Generated docs, one per export                                                 |
| `bin/`      | `volo-web-utils-index`, which writes the index block into a product            |
| `scripts/`  | Repository checks and generators used by `pnpm check` and `pnpm index`         |
| `AGENTS.md` | The rules that agents and humans follow, plus a generated index of what exists |

## Conventions that matter

`AGENTS.md` holds the full rules; the points below are the ones a contributor most often needs.

- Look for an existing helper before writing a new one. The generated index at the bottom of `AGENTS.md` lists everything exported.
- Every export has a JSDoc comment. Its first sentence (at most 90 characters) becomes the index line and the generated docs. `check:index` and `check:docs` fail without it.
- A helper returns a new value and leaves its input unchanged. Keep the package framework-free: no React, no DOM, no runtime dependency.
- Do not edit generated files by hand: the block between the `BEGIN`/`END` markers in `AGENTS.md` and `docs/`. Run `pnpm index` instead.
- Write tests next to the source as `*.test.ts` using vitest, and keep coverage at 90%.
- Code style is set by Prettier and ESLint. `pnpm fmt` fixes formatting. The `.editorconfig` file covers the rest.

Skills for common tasks (adding a helper, updating dependencies) are in `.agents/skills/`.

## Pull requests

1. Fork the repository and create a branch from the default branch.
2. Make one focused change.
3. Run `pnpm check` and make sure it passes with zero warnings.
4. Commit with [Conventional Commits](https://www.conventionalcommits.org/) in English, for example `feat(utils): add startOfWeek` or `fix(utils): handle invalid dates`.
5. Open a pull request and fill in the template. Explain what changed and why.

Documentation, code comments and commit messages are written in English.

## Reporting bugs and requesting features

Use the issue forms: choose **Bug report** or **Feature request** under the Issues tab. Include the version, what you expected, what happened, and the smallest example that shows it.

Do not report security problems in public issues. Follow [SECURITY.md](SECURITY.md) instead.
