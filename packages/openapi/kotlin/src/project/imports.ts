import { kt } from "@ir-kit/compiler-kotlin";

import type { KtDecl } from "../ast/index.js";

const K = kt.KotlinNodeKind;
const NAME_TOKEN = /[A-Za-z_][A-Za-z0-9_]*/g;

/**
 * Every identifier, type and annotation name the declarations reference,
 * collected from the AST (string literals and comments never count).
 */
export function referencedNames(
  decls: ReadonlyArray<KtDecl>,
): ReadonlySet<string> {
  const names = new Set<string>();
  const visit = (value: unknown): void => {
    if (Array.isArray(value)) {
      for (const item of value) visit(item);
      return;
    }
    if (!value || typeof value !== "object") return;
    const node = value as { kind?: unknown; name?: unknown };
    if (
      (node.kind === K.Identifier ||
        node.kind === K.UserType ||
        node.kind === K.Annotation) &&
      typeof node.name === "string"
    ) {
      for (const m of node.name.matchAll(NAME_TOKEN)) names.add(m[0]);
    }
    for (const child of Object.values(value)) visit(child);
  };
  for (const decl of decls) visit(decl.node);
  return names;
}

/**
 * Import list for one Kotlin file. Names shared across packages (e.g.
 * `Response` in `okhttp3` vs. a user model) are disambiguated by file
 * kind: API-layer files pull `okhttp3.Response`, model files never do.
 */
export function importsFor(
  names: ReadonlySet<string>,
  ctx: {
    isApiSurface: boolean;
    /** Package of every generated declaration, by name. */
    declared: ReadonlyMap<string, string>;
    rootPkg: string;
    subPkg: string;
  },
): ReadonlyArray<string> {
  const set = new Set<string>();
  const when = (name: string, imp: string) => {
    if (names.has(name)) set.add(imp);
  };

  when("Serializable", "kotlinx.serialization.Serializable");
  when("SerialName", "kotlinx.serialization.SerialName");
  when("Instant", "kotlinx.datetime.Instant");
  when("LocalDate", "kotlinx.datetime.LocalDate");
  when("ListSerializer", "kotlinx.serialization.builtins.ListSerializer");
  when("MapSerializer", "kotlinx.serialization.builtins.MapSerializer");
  when(
    "ByteArraySerializer",
    "kotlinx.serialization.builtins.ByteArraySerializer",
  );
  when("nullable", "kotlinx.serialization.builtins.nullable");
  when("JsonElement", "kotlinx.serialization.json.JsonElement");

  if (ctx.isApiSurface) {
    // `String.serializer()` etc.; model files use generated companions.
    when("serializer", "kotlinx.serialization.builtins.serializer");
    when("HttpUrl", "okhttp3.HttpUrl");
    when("Request", "okhttp3.Request");
    when("Response", "okhttp3.Response");
    when("FormBody", "okhttp3.FormBody");
    when("toMediaType", "okhttp3.MediaType.Companion.toMediaType");
    when("toRequestBody", "okhttp3.RequestBody.Companion.toRequestBody");
  }
  for (const name of names) {
    const pkg = ctx.declared.get(name);
    if (pkg && pkg !== ctx.subPkg) set.add(`${pkg}.${name}`);
  }

  return [...set].filter((i) => !i.startsWith(`${ctx.subPkg}.`)).sort();
}

/** API-surface predicate, exposed for the build orchestrator. */
export function isApiSurface(decl: KtDecl): boolean {
  if (decl.kind === "interface") return true;
  if (decl.kind === "class") return true;
  if (decl.kind === "topLevelFun") return true;
  return Boolean(
    (decl.kind === "enum" ||
      decl.kind === "sealedClass" ||
      decl.kind === "dataClass" ||
      decl.kind === "object") &&
      decl.runtime,
  );
}
