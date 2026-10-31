---
name: add-component
description: "Adds a helper function to @volo-uti/volo-web-utils: look it up in the index first, then follow the steps for file, JSDoc, export, test, index and gate. Use when a framework-free helper is missing."
---

# Add a helper

Replace `<subject>`. The rules are in `AGENTS.md`.

1. Look in the index in `AGENTS.md` first. If nothing fits, say what you looked for, then add one.
2. Write the function in `src/extensions/<subject>-utils.ts` (or a new file there), or in `src/helpers/v-<name>.ts` when it is a class or carries behavior. Give every export a JSDoc first sentence (at most 90 characters) and an `@example`. Return a new value; do not change the input.
3. Add the export to `src/index.ts`.
4. Write the tests next to it as `<file>.test.ts` (vitest). Keep coverage at 90%.
5. Run `pnpm index` to regenerate the index and the package `docs/`.
6. Make `pnpm check` pass.
