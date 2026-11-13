#!/usr/bin/env jiti
/**
 * Regenerates `src/shared/typia-tags.generated.ts` from `@typia/interface`.
 * Run via `pnpm sync-tags` after bumping typia. Output is committed.
 */

import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parseSync, type Statement, type TSType } from "oxc-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const interfacePkgJson = require.resolve("@typia/interface/package.json");
const interfaceRoot = path.dirname(interfacePkgJson);
const tagsDir = path.join(interfaceRoot, "lib", "tags");

const outputPath = path.resolve(
  __dirname,
  "..",
  "src",
  "shared",
  "typia-tags.generated.ts",
);

interface TagMetadata {
  kind: string | null;
  targets: ReadonlyArray<string>;
}

function parseFile(file: string): ReadonlyArray<Statement> {
  const { program, errors } = parseSync(file, fs.readFileSync(file, "utf8"));
  if (errors.length > 0) {
    throw new Error(`Could not parse ${file}: ${errors[0]!.message}`);
  }
  return program.body;
}

function findTypeAlias(
  statements: ReadonlyArray<Statement>,
  name: string,
): Extract<Statement, { type: "TSTypeAliasDeclaration" }> | null {
  for (const node of statements) {
    const stmt =
      node.type === "ExportNamedDeclaration" ? node.declaration : node;
    if (stmt?.type === "TSTypeAliasDeclaration" && stmt.id.name === name) {
      return stmt;
    }
  }
  return null;
}

function stringLiteral(node: TSType): string | null {
  if (node.type !== "TSLiteralType" || node.literal.type !== "Literal") {
    return null;
  }
  return typeof node.literal.value === "string" ? node.literal.value : null;
}

/** Tag names come from the barrel's `export * from './<TagName>'` filenames. */
function readTagNames(): ReadonlyArray<string> {
  const names: Array<string> = [];
  for (const stmt of parseFile(path.join(tagsDir, "index.d.ts"))) {
    if (stmt.type !== "ExportAllDeclaration") continue;
    const basename = path.basename(stmt.source.value);
    if (basename === "index") continue;
    names.push(basename);
  }
  return names.sort();
}

type TypeLiteral = Extract<TSType, { type: "TSTypeLiteral" }>;

/** Extracts `{ kind, targets }` from `TagBase<{...}>`; empty when shape doesn't match. */
function readTagMetadata(tagName: string): TagMetadata {
  const alias = findTypeAlias(
    parseFile(path.join(tagsDir, `${tagName}.d.ts`)),
    tagName,
  );
  const body = alias ? extractTagBaseArgument(alias.typeAnnotation) : null;
  if (!body) return { kind: null, targets: [] };

  const kindType = findPropertyType(body, "kind");
  const kind = kindType ? stringLiteral(kindType) : null;
  const targetType = findPropertyType(body, "target");
  const targets = new Set<string>();
  if (targetType) collectLiteralLeaves(targetType, targets);

  return { kind, targets: [...targets] };
}

function extractTagBaseArgument(node: TSType): TypeLiteral | null {
  if (node.type !== "TSTypeReference") return null;
  if (node.typeName.type !== "Identifier" || node.typeName.name !== "TagBase")
    return null;
  const arg = node.typeArguments?.params[0];
  return arg?.type === "TSTypeLiteral" ? arg : null;
}

function findPropertyType(literal: TypeLiteral, name: string): TSType | null {
  for (const member of literal.members) {
    if (member.type !== "TSPropertySignature") continue;
    if (member.key.type !== "Identifier" || member.key.name !== name) continue;
    return member.typeAnnotation?.typeAnnotation ?? null;
  }
  return null;
}

/** Collects string-literal leaves from literal/union/conditional type nodes. */
function collectLiteralLeaves(node: TSType, out: Set<string>): void {
  const literal = stringLiteral(node);
  if (literal !== null) {
    out.add(literal);
  } else if (node.type === "TSUnionType") {
    for (const member of node.types) collectLiteralLeaves(member, out);
  } else if (node.type === "TSConditionalType") {
    collectLiteralLeaves(node.trueType, out);
    collectLiteralLeaves(node.falseType, out);
  }
}

function readFormatValues(): ReadonlyArray<string> {
  const file = path.join(tagsDir, "Format.d.ts");
  for (const node of parseFile(file)) {
    const stmt =
      node.type === "ExportNamedDeclaration" ? node.declaration : node;
    if (stmt?.type !== "TSModuleDeclaration") continue;
    if (stmt.id.type !== "Identifier" || stmt.id.name !== "Format") continue;
    if (stmt.body?.type !== "TSModuleBlock") continue;
    const value = findTypeAlias(stmt.body.body, "Value");
    if (value) return extractLiteralUnion(value.typeAnnotation);
  }
  throw new Error(`Could not extract Format.Value from ${file}`);
}

function readIntegerFormats(): ReadonlyArray<string> {
  const alias = findTypeAlias(
    parseFile(path.join(tagsDir, "Type.d.ts")),
    "Type",
  );
  const constraint = alias?.typeParameters?.params[0]?.constraint;
  if (!constraint) throw new Error("Could not extract Type<V> constraint");
  return extractLiteralUnion(constraint);
}

function extractLiteralUnion(node: TSType): ReadonlyArray<string> {
  const members = node.type === "TSUnionType" ? node.types : [node];
  return members.map((member) => {
    const literal = stringLiteral(member);
    if (literal === null) {
      throw new Error(`Expected a string literal, got ${member.type}`);
    }
    return literal;
  });
}

function emitArray(name: string, values: ReadonlyArray<string>): string {
  const body = values.map((v) => `  ${JSON.stringify(v)},`).join("\n");
  return `export const ${name} = [\n${body}\n] as const;`;
}

function emitTagMetadata(
  entries: ReadonlyArray<[string, TagMetadata]>,
): string {
  const lines = entries.map(([name, meta]) => {
    const kind = meta.kind === null ? "null" : JSON.stringify(meta.kind);
    const targets = meta.targets.map((t) => JSON.stringify(t)).join(", ");
    return `  ${name}: { kind: ${kind}, targets: [${targets}] as const },`;
  });
  return `export const TYPIA_TAG_META = {\n${lines.join("\n")}\n} as const;`;
}

function readTypiaVersion(): string {
  const typiaPkgJson = require.resolve("typia/package.json");
  return (
    JSON.parse(fs.readFileSync(typiaPkgJson, "utf8")) as { version: string }
  ).version;
}

function run(): void {
  const tagNames = readTagNames();
  const tagEntries: Array<[string, TagMetadata]> = tagNames.map((name) => [
    name,
    readTagMetadata(name),
  ]);
  const formatValues = readFormatValues();
  const integerFormats = readIntegerFormats();
  const typiaVersion = readTypiaVersion();

  const content = `/**
 * AUTO-GENERATED — do not edit.
 * Regenerate via \`pnpm sync-tags\` after bumping typia.
 *
 * Source: @typia/interface v${typiaVersion}
 */

${emitArray("TYPIA_TAGS", tagNames)}

${emitTagMetadata(tagEntries)}

${emitArray("TYPIA_FORMAT_VALUES", formatValues)}

${emitArray("TYPIA_INTEGER_FORMATS", integerFormats)}

export type TypiaTagName = (typeof TYPIA_TAGS)[number];
export type TypiaFormatValue = (typeof TYPIA_FORMAT_VALUES)[number];
export type TypiaIntegerFormat = (typeof TYPIA_INTEGER_FORMATS)[number];
`;

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content);

  console.log(`Wrote ${path.relative(process.cwd(), outputPath)}`);
  console.log(`  tags: ${tagNames.length}`);
  console.log(`  formats: ${formatValues.length}`);
  console.log(`  integer formats: ${integerFormats.length}`);
}

run();
