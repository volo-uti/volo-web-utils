---
name: update-deps
description: "Updates dependencies: finds outdated packages, raises them, keeps the ranges promised to consumers, confirms with the gate, then reports what was raised and what is blocked. Use for the monthly check or whenever dependencies are updated."
---

# Update dependencies

1. Run `pnpm outdated -r` to list outdated dependencies.
2. Raise them. If Node or pnpm moved, also fix `.nvmrc` and `packageManager` in the root `package.json`, and bring the pinned action SHAs in `.github/workflows/ci.yml` to the latest release.
3. Do not raise the lower bound of a range promised to consumers (`peerDependencies`, `engines`) before the consumers themselves have moved up.
4. Run `pnpm install`, then `pnpm check`. Revert only the package that breaks the gate and note it as blocked.
5. Report: **raised** (name, old to new version) and **blocked** (name, error).
