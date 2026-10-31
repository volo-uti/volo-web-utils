# @volo-uti/volo-web-utils

Framework-free TypeScript helpers: string, number, date and object helpers, debounce / throttle / delay, and a development logger. It has no runtime dependencies.

## Install

The package is published to GitHub Packages. Map the `@volo-uti` scope to it in the product's `.npmrc`, and put a token that can read packages in your user-level `~/.npmrc`. pnpm ignores credentials written in a project `.npmrc`, and GitHub Packages asks for a token even for public packages. In CI, `actions/setup-node` with `registry-url` writes the user-level file from `NODE_AUTH_TOKEN`.

```ini
# the product's .npmrc
@volo-uti:registry=https://npm.pkg.github.com
```

```ini
# ~/.npmrc (a token with read:packages)
//npm.pkg.github.com/:_authToken=<token>
```

pnpm waits `minimumReleaseAge` before it installs a new release. List the scope in the product's `pnpm-workspace.yaml` so releases of these packages install at once:

```yaml
minimumReleaseAgeExclude:
  - "@volo-uti/*"
```

```bash
pnpm add @volo-uti/volo-web-utils
```

## Public API

Every helper returns a new value and leaves its input unchanged. Dates use local time, and an invalid `Date` matches no check.

| Group   | Exports                                                                                                                                                                                                                       |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Strings | `capitalize` · `isBlank` · `isNotBlank` · `isNumeric` · `isAlpha` · `isAlphanumeric` · `isValidEmail` · `isValidUrl` · `isStrongPassword` · `isValidKoreanPhone` · `isValidIpAddress`                                         |
| Numbers | `isBetween` · `clampTo`                                                                                                                                                                                                       |
| Dates   | `isToday` · `isYesterday` · `isTomorrow` · `isSameDay` · `isThisWeek` · `isThisMonth` · `isThisYear` · `isWeekend` · `isWeekday` · `startOfDay` · `endOfDay` · `startOfMonth` · `endOfMonth` · `addMonths` · `getDaysInMonth` |
| Objects | `getOrDefault` · `pick` · `omit` · `mapValues` · `mapKeys` · `omitNullish` · `merge` · `invert`                                                                                                                               |
| Helpers | `VLog` · `VDebouncer` · `VThrottler` · `debounce` · `throttle` · `delay`                                                                                                                                                      |

- The validators are pragmatic shape checks. `isValidEmail` checks the common address shape, not the full RFC 5322, and `isValidIpAddress` accepts IPv4 only. Strict validation is for the server or zod.
- When the target month lacks the day, `addMonths` clamps to the last day of that month (Jan 31 + 1 month = Feb 29 in a leap year). Pass a negative number to subtract.
- Number formatting, date formatting, Result and HTTP are left to `Intl` and the standard APIs.

## Using it in a product

Write an index block into `AGENTS.md` so coding agents find the existing helpers, and add `--check` to the product's `check` so it never goes stale. Run it again after upgrading dependencies.

```bash
pnpm exec volo-web-utils-index           # writes the volo-web-utils-index block in ./AGENTS.md (appends it if missing)
pnpm exec volo-web-utils-index --check   # exits 1 if the block is missing or stale
```

The index has `name|description` lines under `[section]` heading lines. Each entry's doc is `node_modules/@volo-uti/volo-web-utils/docs/<section>/<name>.md`. `[.]` is the docs folder itself.

## Develop

```bash
pnpm install
pnpm check    # format, lint, typecheck, test, build and every other gate
pnpm verify   # the same gate in a clean Docker container (needs Docker)
pnpm test:coverage   # vitest with the 90% coverage threshold
```

Tests run locally, not on a remote CI. The `pre-push` hook runs `pnpm check`, and `pnpm verify` when you push `main` or `develop`. On Windows, use WSL2 and run everything inside it.

Read `AGENTS.md` before changing anything.

## Publishing

Push a tag named `v<version>`, where `<version>` equals `version` in `package.json`. `.github/workflows/publish.yml` then builds the package and publishes it to GitHub Packages with the workflow's own `GITHUB_TOKEN`. It posts the start and the result to Slack when the `SLACK_BOT_TOKEN` secret and the `SLACK_CICD_CHANNEL` variable are set. Tests do not run there: the `pre-push` hook runs `pnpm verify` before the code leaves your machine.

## Contributing

Contributions are welcome. [CONTRIBUTING.md](CONTRIBUTING.md) explains how to set up, run the gate and open a pull request. Everyone taking part is expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Security

Please report vulnerabilities privately, as described in [SECURITY.md](SECURITY.md). Do not open a public issue for them.

## Principles

[PRINCIPLES.md](PRINCIPLES.md) lists the principles this repository follows, why, and which tool enforces each one.

## License

[MIT](LICENSE)
