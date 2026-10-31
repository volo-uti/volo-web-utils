/**
 * Reads the public API of @volo-uti/volo-web-utils with the TypeScript checker.
 *
 * Every symbol exported by a package entry (`src/index.ts`) is resolved through
 * `export … from` re-exports to its declaration, so the index and the per-file
 * docs are derived from one model and cannot drift from each other.
 */

import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

export const PACKAGES = [
  { id: "utils", name: "@volo-uti/volo-web-utils", dir: ".", block: "volo-web-utils-index" },
];

const posix = (p) => p.split(sep).join("/");

/** Collapses every whitespace run to one space. */
export const flat = (text) => text.replace(/\s+/g, " ").trim();

/** First sentence of a doc text: whitespace collapsed, cut at the first ". ", ending in ".". */
export const firstSentence = (text) => {
  const one = flat(text);
  if (!one) return null;
  const end = one.indexOf(". ");
  const sentence = end === -1 ? one : one.slice(0, end + 1);
  return sentence.endsWith(".") ? sentence : `${sentence}.`;
};

/** Where the doc file of a source file lives, relative to the package `docs/` folder. */
const docPathOf = (srcRel) =>
  `${srcRel
    .split("/")
    .at(-1)
    .replace(/\.tsx?$/, "")}.md`;

export function buildModel() {
  const configPath = join(ROOT, "tsconfig.json");
  const parsed = ts.getParsedCommandLineOfConfigFile(
    configPath,
    {},
    {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic: (d) => {
        throw new Error(ts.flattenDiagnosticMessageText(d.messageText, "\n"));
      },
    },
  );
  const options = {
    ...parsed.options,
    noEmit: true,
    rootDir: undefined,
    outDir: undefined,
    declaration: false,
    declarationMap: false,
    sourceMap: false,
  };
  const program = ts.createProgram(
    PACKAGES.map((p) => join(ROOT, p.dir, "src/index.ts")),
    options,
  );
  const checker = program.getTypeChecker();

  /** A declaration file that belongs to the package whose API is being read. */
  const isOwn = (sf, srcDir) =>
    sf.fileName.startsWith(`${srcDir}/`) && !program.isSourceFileDefaultLibrary(sf);

  const docOf = (symbol) => {
    const text = ts.displayPartsToString(symbol.getDocumentationComment(checker));
    return text
      .split("\n")
      .map((l) => l.trimEnd())
      .join("\n")
      .trim();
  };

  const tagsOf = (symbol) =>
    symbol.getJsDocTags(checker).map((t) => ({
      name: t.name,
      text: ts.displayPartsToString(t.text ?? []).trim(),
    }));

  /** Own (non-inherited) members of an object type, in declaration order. */
  const membersOf = (symbol, srcDir) => {
    const type = checker.getDeclaredTypeOfSymbol(symbol);
    return checker
      .getPropertiesOfType(type)
      .filter((p) => p.declarations?.some((d) => isOwn(d.getSourceFile(), srcDir)))
      .map((p) => {
        const decl = p.declarations.find((d) => isOwn(d.getSourceFile(), srcDir));
        const typeText = decl.type
          ? flat(decl.type.getText())
          : flat(checker.typeToString(checker.getTypeOfSymbolAtLocation(p, decl)));
        const tags = tagsOf(p);
        return {
          name: p.name,
          type: typeText,
          required: !(p.flags & ts.SymbolFlags.Optional),
          default: tags.find((t) => t.name === "default")?.text || null,
          description: flat(docOf(p)),
        };
      });
  };

  const packages = PACKAGES.map((pkg) => {
    const srcDir = join(ROOT, pkg.dir, "src");
    const entry = program.getSourceFile(join(srcDir, "index.ts"));
    const moduleSymbol = checker.getSymbolAtLocation(entry);
    const symbols = [];
    for (const exported of checker.getExportsOfModule(moduleSymbol)) {
      const resolved =
        exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
      const decls = resolved.declarations ?? [];
      if (decls.length === 0) continue;
      const decl =
        decls.find((d) => ts.getJSDocCommentsAndTags(d).some((n) => ts.isJSDoc(n))) ?? decls[0];
      const sf = decl.getSourceFile();
      const srcRel = posix(relative(srcDir, sf.fileName));
      const isValue = Boolean(resolved.flags & ts.SymbolFlags.Value);
      let summary = docOf(resolved);
      if (!summary) {
        // Destructured declarations (`const [A, B] = …`) carry their doc on the statement.
        let node = decl;
        while (node && !ts.isVariableStatement(node)) node = node.parent;
        const doc =
          node &&
          ts
            .getJSDocCommentsAndTags(node)
            .filter((n) => ts.isJSDoc(n))
            .at(-1);
        if (doc) summary = ts.getTextOfJSDocComment(doc.comment)?.trim() ?? "";
      }
      const docPath = docPathOf(srcRel);
      const isMembered =
        !isValue &&
        (/Props$/.test(exported.name) || Boolean(resolved.flags & ts.SymbolFlags.Interface));
      symbols.push({
        name: exported.name,
        isValue,
        isProps: /Props$/.test(exported.name),
        file: posix(relative(ROOT, sf.fileName)),
        line: sf.getLineAndCharacterOfPosition(decl.getStart(sf)).line + 1,
        pos: decl.getStart(sf),
        docPath,
        summary,
        sentence: firstSentence(summary),
        tags: tagsOf(resolved),
        members: isMembered ? membersOf(resolved, srcDir) : null,
        source: isValue || isMembered ? null : decl.getText(sf).replace(/^export\s+/, ""),
      });
    }
    // Declaration order inside a file keeps the output stable.
    symbols.sort((a, b) => (a.file < b.file ? -1 : a.file > b.file ? 1 : a.pos - b.pos));

    const units = new Map();
    for (const s of symbols) {
      if (!units.has(s.docPath)) {
        units.set(s.docPath, { pkg, docPath: s.docPath, symbols: [] });
      }
      units.get(s.docPath).symbols.push(s);
    }
    for (const unit of units.values()) unit.main = unit.symbols.filter((s) => s.isValue);
    return {
      pkg,
      symbols,
      units: [...units.values()].sort((a, b) => (a.docPath < b.docPath ? -1 : 1)),
    };
  });

  return { packages };
}

/** Exported values and non-Props types that have no first doc sentence, as `file:line Name`. */
export function missingSentences(model) {
  return model.packages.flatMap(({ symbols }) =>
    symbols
      .filter((s) => (s.isValue || !s.isProps) && !s.sentence)
      .map((s) => `${s.file}:${s.line} ${s.name}`),
  );
}
