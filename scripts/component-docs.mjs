#!/usr/bin/env node
/**
 * Writes one markdown doc per source file into each package's
 * `docs/` folder, from the JSDoc and types of the public API.
 * `--check` fails when a doc is stale or exists for something no longer exported.
 *
 * Usage: node scripts/component-docs.mjs [--check]
 */

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { buildModel, ROOT } from "./lib/api-model.mjs";

const check = process.argv.includes("--check");

const cell = (text) => text.replace(/\|/g, "\\|");
const code = (text) => `\`${cell(text)}\``;

function table(kind, members) {
  if (members.length === 0) return ["_No own members; see the types it extends._", ""];
  return [
    `| ${kind} | Type | Default | Required | Description |`,
    "| --- | --- | --- | --- | --- |",
    ...members.map(
      (m) =>
        `| ${code(m.name)} | ${code(m.type)} | ${m.default ? code(m.default) : "—"} | ${m.required ? "yes" : "no"} | ${cell(m.description) || "—"} |`,
    ),
    "",
  ];
}

function examplesOf(symbol) {
  return symbol.tags
    .filter((t) => t.name === "example" && t.text)
    .map((t) => (t.text.startsWith("```") ? t.text : `\`\`\`tsx\n${t.text}\n\`\`\``));
}

function render(unit) {
  const out = [];
  out.push(`# ${unit.docPath.replace(/\.md$/, "")}`, "");
  for (const s of unit.main) out.push(`## ${s.name}`, "", s.summary, "");

  const withExamples = unit.symbols.filter(
    (s) => (s.isValue || !s.isProps) && examplesOf(s).length > 0,
  );
  if (withExamples.length > 0) {
    out.push("## Examples", "");
    for (const s of withExamples) {
      out.push(`### ${s.name}`, "");
      for (const ex of examplesOf(s)) out.push(ex, "");
    }
  }

  const props = unit.symbols.filter((s) => !s.isValue && s.isProps);
  if (props.length > 0) {
    out.push("## Props", "");
    for (const s of props) {
      out.push(`### ${s.name}`, "");
      if (s.summary) out.push(s.summary, "");
      out.push(...table("Prop", s.members ?? []));
    }
  }

  const types = unit.symbols.filter((s) => !s.isValue && !s.isProps);
  if (types.length > 0) {
    out.push("## Types", "");
    for (const s of types) {
      out.push(`### ${s.name}`, "");
      if (s.summary) out.push(s.summary, "");
      if (s.members) out.push(...table("Member", s.members));
      else out.push("```ts", s.source, "```", "");
    }
  }
  return `${out
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd()}\n`;
}

const walk = (dir) =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
      )
    : [];

const model = buildModel();
const problems = [];
let written = 0;

for (const { pkg, units } of model.packages) {
  const docsDir = join(ROOT, pkg.dir, "docs");
  const expected = new Map(units.map((u) => [join(docsDir, u.docPath), render(u)]));

  for (const [path, content] of expected) {
    const same = existsSync(path) && readFileSync(path, "utf8") === content;
    if (same) continue;
    if (check) problems.push(`${relative(ROOT, path)} is stale; run \`pnpm index\``);
    else {
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, content);
      written++;
    }
  }

  for (const path of walk(docsDir).filter((p) => p.endsWith(".md") && !expected.has(p))) {
    if (check) problems.push(`${relative(ROOT, path)} documents something no longer exported`);
    else rmSync(path);
  }
  if (!check) {
    // Drop folders left empty by removed docs.
    for (const dir of walk(docsDir).map(dirname).sort().reverse()) {
      if (existsSync(dir) && readdirSync(dir).length === 0) rmdirSync(dir);
    }
  }
}

if (check) {
  if (problems.length > 0) {
    for (const p of problems) console.error(p);
    process.exit(1);
  }
  console.log("docs: current");
} else {
  console.log(`docs: wrote ${written} files`);
}
