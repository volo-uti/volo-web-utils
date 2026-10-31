#!/usr/bin/env node
/**
 * Writes the index of the public API (first doc sentence of every value export; types live in the docs) into
 * AGENTS.md and into the product-facing `docs/index.txt` of each package.
 * `--check` fails when a block or file is stale, an export has no doc sentence,
 * a first sentence is longer than 90 characters, or a block is too big.
 *
 * Usage: node scripts/agent-index.mjs [--check]
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildModel, missingSentences, ROOT } from "./lib/api-model.mjs";

const MAX_CHARS = 8000;
const MAX_SENTENCE = 90;
const AGENTS = join(ROOT, "AGENTS.md");
const check = process.argv.includes("--check");

const INTRO =
  "`pnpm index` builds this from the first JSDoc sentence of each export; do not edit it by hand. Before writing a new helper, find it here and read its doc file. The doc of each entry is `docs/<section>/<name>.md` (`[.]` is the docs folder itself). Types are in each doc.";

/** `[section]` heading lines followed by `name|text` lines; `[.]` is the docs folder itself. */
function indexLines(entries) {
  const lines = [];
  let section;
  for (const [doc, text] of entries) {
    const slash = doc.lastIndexOf("/");
    const next = slash < 0 ? "." : doc.slice(0, slash);
    if (next !== section) {
      section = next;
      lines.push(`[${section}]`);
    }
    lines.push(`${doc.slice(slash + 1).replace(/\.md$/, "")}|${text}`);
  }
  return lines;
}

/** One index entry per doc file: [docPath, text]. Only values are indexed; types live in the doc. */
const entriesOf = (units) =>
  units.map((unit) => [
    unit.docPath,
    unit.symbols
      .filter((s) => s.isValue)
      .map((s) => `${s.name}: ${s.sentence}`)
      .join(" "),
  ]);

const block = (id, title, intro, lines) =>
  [
    `<!-- BEGIN:${id} -->`,
    "",
    `## ${title}`,
    "",
    intro,
    "",
    "```text",
    ...lines,
    "```",
    "",
    `<!-- END:${id} -->`,
  ].join("\n");

const model = buildModel();
const problems = missingSentences(model).map((m) => `${m} has no doc comment sentence`);

for (const { units } of model.packages) {
  for (const unit of units) {
    for (const s of unit.main) {
      if (s.sentence && s.sentence.length > MAX_SENTENCE) {
        problems.push(
          `${s.file ?? unit.docPath}${s.line ? `:${s.line}` : ""} ${s.name} (${s.sentence.length} chars) first sentence is longer than ${MAX_SENTENCE}`,
        );
      }
    }
  }
}

const outputs = []; // { path, content }
const products = [];
const blocks = new Map(); // block id → text
for (const { pkg, units } of model.packages) {
  const entries = entriesOf(units.filter((u) => u.main.length > 0));
  const repoLines = indexLines(entries);
  const productLines = indexLines(entries);
  const text = block(pkg.block, `Index of ${pkg.name}`, INTRO, repoLines);
  if (text.length > MAX_CHARS) {
    problems.push(`${pkg.block} block is ${text.length} characters; the limit is ${MAX_CHARS}`);
  }
  blocks.set(pkg.block, text);
  // The block volo-<pkg>-index writes into a product: its intro is the one in the shipped bin.
  const bin = readFileSync(join(ROOT, pkg.dir, "bin", `${pkg.block}.mjs`), "utf8");
  // Prettier picks the quote that needs fewer escapes, so accept both.
  const introMatch = /const INTRO =\s*(?:'([^']*)'|"([^"]*)")/.exec(bin);
  const productIntro = introMatch[1] ?? introMatch[2];
  const productText = block(pkg.block, `Index of ${pkg.name}`, productIntro, productLines);
  if (productText.length > MAX_CHARS) {
    problems.push(
      `${pkg.block} product block is ${productText.length} characters; the limit is ${MAX_CHARS}`,
    );
  }
  products.push(`${pkg.block} product ${productText.length}`);
  outputs.push({
    path: join(ROOT, pkg.dir, "docs", "index.txt"),
    content: `${productLines.join("\n")}\n`,
  });
}

const replaceBlock = (source, id, text) => {
  const pattern = new RegExp(`<!-- BEGIN:${id} -->[\\s\\S]*?<!-- END:${id} -->`);
  return pattern.test(source)
    ? source.replace(pattern, () => text)
    : `${source.trimEnd()}\n\n${text}\n`;
};

const current = existsSync(AGENTS) ? readFileSync(AGENTS, "utf8") : "";
let next = current;
for (const [id, text] of blocks) next = replaceBlock(next, id, text);

if (check) {
  if (next !== current) problems.push("AGENTS.md index block is stale; run `pnpm index`");
  for (const { path, content } of outputs) {
    if (!existsSync(path) || readFileSync(path, "utf8") !== content) {
      problems.push(`${path.slice(ROOT.length + 1)} is stale; run \`pnpm index\``);
    }
  }
  if (problems.length > 0) {
    for (const p of problems) console.error(p);
    process.exit(1);
  }
  console.log(
    `index: current (${[...blocks].map(([id, t]) => `${id} ${t.length}`).join(", ")}; ${products.join(", ")} characters)`,
  );
} else {
  for (const p of problems) console.error(p);
  writeFileSync(AGENTS, next);
  for (const { path, content } of outputs) {
    mkdirSync(join(path, ".."), { recursive: true });
    writeFileSync(path, content);
  }
  console.log(
    `index: wrote AGENTS.md (${[...blocks].map(([id, t]) => `${id} ${t.length}`).join(", ")}; ${products.join(", ")} characters)`,
  );
  if (problems.length > 0) process.exit(1);
}
