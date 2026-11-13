/**
 * Handler file generation and patching.
 * New code is built with Hey API's TypeScript DSL; existing handler files
 * are read with oxc-parser so user code is never reprinted.
 */

import { $, type TsDsl, TypeScriptRenderer } from "@hey-api/openapi-ts";
import { parseSync } from "oxc-parser";

import type { HandlerMode, ProxyHandlerConfig } from "../../types.js";

export type {
  PropertyInfo,
  ResponseSchemaInfo,
} from "../../../faker/core/index.js";

// ============================================================================
// Context for file generation
// ============================================================================

export interface FileGenContext {
  tag: string;
  procedures: string[];
  implementer: { name: string; from: string };
  mode: HandlerMode;
  clientName: string;
  proxyConfig?: ProxyHandlerConfig;
  fakerFactoryNames?: Map<string, string>;
  fakerGenImport?: string;
}

// ============================================================================
// Constants
// ============================================================================

/** JS reserved words that cannot be used as variable names. */
const JS_RESERVED = new Set([
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "enum",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "function",
  "if",
  "import",
  "in",
  "instanceof",
  "let",
  "new",
  "null",
  "return",
  "static",
  "super",
  "switch",
  "this",
  "throw",
  "true",
  "try",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "yield",
  "implements",
  "interface",
  "package",
  "private",
  "protected",
  "public",
]);

/** Returns a safe variable/export name — appends `Handlers` when tag is reserved. */
export function safeVarName(tag: string): string {
  return JS_RESERVED.has(tag) ? `${tag}Handlers` : tag;
}

type ModuleImport = NonNullable<
  Parameters<typeof TypeScriptRenderer.astToString>[0]["imports"]
>[number][number];

function makeImport(names: string[], from: string): ModuleImport {
  return {
    imports: names.map((name) => ({
      isTypeOnly: false,
      localName: name,
      sourceName: name,
    })),
    isTypeOnly: false,
    kind: "named",
    modulePath: from,
  };
}

function print(nodes: ReadonlyArray<TsDsl>, imports?: ModuleImport[]): string {
  return TypeScriptRenderer.astToString({
    imports: imports?.length ? [imports] : undefined,
    nodes,
  }).trim();
}

// ============================================================================
// Handler builders
// ============================================================================

interface HandlerOpts {
  tag: string;
  procedure: string;
  implementerName: string;
  mode: HandlerMode;
  clientName: string;
  factoryName?: string;
}

/**
 * `os.tag.procedure.handler(async … => …)`, with the body chosen by mode:
 * - stub: `async () => { throw new ORPCError('NOT_IMPLEMENTED'); }`
 * - faker: `async () => mockProcedure()`
 * - proxy: `async ({ input }) => client.tag.procedure(input)`
 */
function makeHandler({
  tag,
  procedure,
  implementerName,
  mode,
  clientName,
  factoryName,
}: HandlerOpts) {
  const fn = $.func().async();
  switch (mode) {
    case "faker":
      fn.do(
        $.return(
          $(
            factoryName ??
              `mock${procedure.charAt(0).toUpperCase()}${procedure.slice(1)}`,
          ).call(),
        ),
      );
      break;
    case "proxy":
      fn.param((p) => p.object("input")).do(
        $.return($(clientName).attr(tag).attr(procedure).call("input")),
      );
      break;
    default:
      fn.do($.throw($.new("ORPCError", $.literal("NOT_IMPLEMENTED")), false));
      break;
  }
  return $(implementerName).attr(tag).attr(procedure).attr("handler").call(fn);
}

function handlerOpts(ctx: FileGenContext, procedure: string): HandlerOpts {
  return {
    tag: ctx.tag,
    procedure,
    implementerName: ctx.implementer.name,
    mode: ctx.mode,
    clientName: ctx.clientName,
    factoryName: ctx.fakerFactoryNames?.get(procedure),
  };
}

function handlerObject(ctx: FileGenContext, procedures: string[]) {
  const obj = $.object().pretty();
  for (const p of procedures) obj.prop(p, makeHandler(handlerOpts(ctx, p)));
  return obj;
}

function getImports(ctx: FileGenContext): ModuleImport[] {
  const imports: ModuleImport[] = [];

  switch (ctx.mode) {
    case "stub":
      imports.push(makeImport(["ORPCError"], "@orpc/server"));
      break;
    case "faker": {
      const factoryNames = ctx.procedures
        .map((p) => ctx.fakerFactoryNames?.get(p))
        .filter((n): n is string => !!n);
      if (factoryNames.length > 0 && ctx.fakerGenImport) {
        imports.push(makeImport(factoryNames, ctx.fakerGenImport));
      }
      break;
    }
    case "proxy": {
      const clientImport = ctx.proxyConfig?.clientImport;
      if (clientImport) {
        imports.push(makeImport([clientImport.name], clientImport.from));
      }
      break;
    }
  }
  imports.push(makeImport([ctx.implementer.name], ctx.implementer.from));

  return imports;
}

// ============================================================================
// File builders
// ============================================================================

/** Generates a complete handler file. */
export function buildFile(ctx: FileGenContext): string {
  const varName = safeVarName(ctx.tag);
  const body = print(
    [$.const(varName).assign(handlerObject(ctx, ctx.procedures))],
    getImports(ctx),
  );
  return `${body}\n\nexport default ${varName};\n`;
}

// ============================================================================
// File analysis & patching
// ============================================================================

export interface HandlerObjectInfo {
  /** Property names already declared in the handler object. */
  existingNames: Set<string>;
  /**
   * Character position of the closing `}` of the handler object literal.
   * New properties are inserted just before this position.
   */
  closingBracePos: number;
  /** True when the last existing property has no trailing comma. */
  needsComma: boolean;
  /** End of the last existing property, where a missing comma goes. */
  lastPropEnd: number;
}

/**
 * Parses the source file and locates the top-level handler object
 * (`const <tag> = { ... }`), returning the existing property names
 * and the insertion position for new properties.
 */
export function analyzeHandlerFile(
  source: string,
  varName: string,
): HandlerObjectInfo | null {
  const { program } = parseSync("handler.ts", source);

  for (const node of program.body) {
    const stmt =
      node.type === "ExportNamedDeclaration" ? node.declaration : node;
    if (stmt?.type !== "VariableDeclaration") continue;
    const decl = stmt.declarations[0];
    if (decl?.id.type !== "Identifier" || decl.id.name !== varName) continue;
    const init = decl.init;
    if (init?.type !== "ObjectExpression") continue;

    const existingNames = new Set<string>();
    for (const prop of init.properties) {
      if (prop.type !== "Property" || prop.computed) continue;
      if (prop.key.type === "Identifier") existingNames.add(prop.key.name);
      else if (
        prop.key.type === "Literal" &&
        typeof prop.key.value === "string"
      )
        existingNames.add(prop.key.value);
    }

    const last = init.properties.at(-1);
    // Only whitespace, comments and an optional comma can follow the last property.
    const afterLast = last
      ? source
          .slice(last.end, init.end - 1)
          .replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, "")
      : "";
    const needsComma = !!last && !afterLast.includes(",");
    return {
      existingNames,
      closingBracePos: init.end - 1,
      needsComma,
      lastPropEnd: last?.end ?? 0,
    };
  }

  return null;
}

/**
 * Detects the indentation unit (tabs or N spaces) used in a source file.
 * Falls back to two spaces.
 */
function detectIndent(source: string): string {
  const m = source.match(/^([ \t]+)\S/m);
  return m ? m[1] : "  ";
}

/**
 * Prints the handler properties for `procedures`, re-indented from the
 * printer's two spaces to the file's own indent unit.
 */
function printProperties(
  ctx: FileGenContext,
  procedures: string[],
  indent: string,
): string {
  const lines = print([$.const("_").assign(handlerObject(ctx, procedures))])
    .split("\n")
    .slice(1, -1);
  return lines
    .map((line) => {
      const leading = line.match(/^( {2})*/)?.[0] ?? "";
      return indent.repeat(leading.length / 2) + line.slice(leading.length);
    })
    .join("\n");
}

/**
 * Inserts missing procedure stubs into an existing handler file.
 * Existing code is left as written; the new properties are spliced in
 * just before the handler object's closing `}`.
 */
export function patchFile(
  source: string,
  ctx: FileGenContext,
  missing: string[],
): string {
  const info = analyzeHandlerFile(source, safeVarName(ctx.tag));
  if (!info) return source; // can't locate the object — leave the file untouched

  const insertion = `\n${printProperties(ctx, missing, detectIndent(source))},\n`;

  const { closingBracePos, lastPropEnd, needsComma } = info;
  const head = needsComma
    ? `${source.slice(0, lastPropEnd)},${source.slice(lastPropEnd, closingBracePos)}`
    : source.slice(0, closingBracePos);
  return head + insertion + source.slice(closingBracePos);
}
