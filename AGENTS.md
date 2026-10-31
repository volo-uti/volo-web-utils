# volo-web-utils: framework-free helpers

The repository is the `@volo-uti/volo-web-utils` package. TypeScript (strict). No runtime dependencies and no framework. Node 26 or newer is needed to work on this repository (`.nvmrc`, `packageManager`), not to use the published package.
Read the rules below and the index at the bottom before changing anything. Do not rebuild a helper that already exists.

| Path       | What it holds                                                         |
| ---------- | --------------------------------------------------------------------- |
| `src/`     | The helpers, one file per subject, exported from `src/index.ts`       |
| `docs/`    | One doc per export and `index.txt`, written by `pnpm index` (npm)     |
| `bin/`     | `volo-web-utils-index`, which writes the index block into a product   |
| `scripts/` | Repository checks and generators behind `pnpm check` and `pnpm index` |

## Commands

```bash
pnpm check    # the gate: format · lint (0 warnings) · typecheck · check:index · check:docs · test · build
pnpm verify   # the same gate in a clean Docker container (run before pushing main or develop)
pnpm index    # regenerates the index (block below, `docs/index.txt`) and `docs/`
```

## Adding a helper

Follow the `add-component` skill for the steps. The rules to keep are:

- **Every export gets a JSDoc first sentence.** The index and `docs/` are built from it. Without it `check:index` and `check:docs` fail. The first sentence is at most 90 characters up to the period (`check:index` reports longer ones as `file:line name (N chars)`); put details from the second sentence on.
- Add an `@example` to the JSDoc; it becomes the example in the generated doc.
- A helper returns a new value and leaves its input unchanged.
- Stay framework-free: no React, no DOM, no runtime dependency. Number and date formatting, Result and HTTP are left to `Intl` and the standard APIs.
- Group helpers by subject in `src/extensions/<subject>-utils.ts`; classes and wrappers that carry behavior go in `src/helpers/v-<name>.ts`. Export everything from `src/index.ts`.
- Tests sit next to the source as `*.test.ts` (vitest, node environment). Coverage must stay at 90% (`pnpm test:coverage`).
- Log through `VLog`; lint rejects `console.log`.
- `@deprecated` alias: do not create one; when you rename, delete the old name.

## Skills

| Task                    | Skill           |
| ----------------------- | --------------- |
| Add a helper (function) | `add-component` |
| Update deps             | `update-deps`   |

There is no test CI. The `pre-push` hook (lefthook) runs `pnpm check`, and `pnpm verify` on `main` and `develop`. Remote GitHub Actions only build and deploy.

Skills live in `.agents/skills/` (`.claude/skills` links to it).

## Index

The block below is written by `pnpm index`; do not edit it by hand.

<!-- BEGIN:volo-web-utils-index -->

## Index of @volo-uti/volo-web-utils

`pnpm index` builds this from the first JSDoc sentence of each export; do not edit it by hand. Before writing a new helper, find it here and read its doc file. The doc of each entry is `docs/<section>/<name>.md` (`[.]` is the docs folder itself). Types are in each doc.

```text
[.]
date-utils|isToday: True when the date falls on today. isYesterday: True when the date falls on yesterday. isTomorrow: True when the date falls on tomorrow. isSameDay: True when both dates fall on the same calendar day. isThisWeek: True when the date is within the current week (Sunday to Saturday). isThisMonth: True when the date is within the current month. isThisYear: True when the date is within the current year. isWeekend: True when the date is a Saturday or Sunday. isWeekday: True when the date is Monday to Friday. startOfDay: Returns a copy of the date set to 00:00:00.000. endOfDay: Returns a copy of the date set to 23:59:59.999. startOfMonth: Returns the first day of the date's month at 00:00:00.000. endOfMonth: Returns the last day of the date's month at 23:59:59.999. addMonths: Returns a copy moved by whole months; negative goes back. getDaysInMonth: Number of days in the date's month.
map-utils|getOrDefault: Reads an own key, or the default when missing, nullish or unsafe. pick: Returns a new object with only the given keys that exist on the object. omit: Returns a new object without the given keys. mapValues: Returns a new object with each value transformed by the function. mapKeys: Returns a new object with each key transformed by the function. omitNullish: Returns a new object without the entries whose value is null or undefined. merge: Returns a new object with the source entries laid over the target (shallow). invert: Returns a new object with keys and values swapped.
number-utils|isBetween: True when the value lies between min and max, inclusive; NaN is never between. clampTo: Limits a number to the range from min to max.
string-utils|capitalize: Upper-cases the first character of a string. isBlank: True when the string is null, undefined, empty or only whitespace. isNotBlank: True when the string has a non-whitespace character. isNumeric: True when the string is non-empty and has only the digits 0-9. isAlpha: True when the string is non-empty and has only ASCII letters. isAlphanumeric: True when the string is non-empty and has only ASCII letters and digits. isValidEmail: Pragmatic email shape check, not full RFC 5322 validation. isValidUrl: True when the string parses as an absolute http or https URL with a host. isStrongPassword: True when the string has 8+ characters with lower, upper and digit. isValidKoreanPhone: True for a Korean mobile number such as 010-1234-5678 (hyphens optional). isValidIpAddress: True when the string is a valid dotted-quad IPv4 address; IPv6 is not supported.
v-delay|VDebouncer: Runs a callback once the duration has passed since the last call(). VThrottler: Runs a callback at most once per duration. debounce: Wraps a function so it runs only after the delay without another call. throttle: Wraps a function so it runs on the first call, then at most once per window. delay: Returns a promise that resolves after the given milliseconds.
v-log|VLog: Development-only logger (debug, info, warn, error) that is silent in production.
```

<!-- END:volo-web-utils-index -->
