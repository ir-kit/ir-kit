import { posix } from "node:path";

import type { RenderContext, Renderer } from "@hey-api/codegen-core";
import { type TsDsl, TypeScriptRenderer } from "@hey-api/openapi-ts";

import type { EmitTsExportGroup } from "../plugin.js";

import { RawTextNode } from "./raw-text-node.js";
import { TsStatementNode } from "./ts-node.js";

type RenderArgs = Parameters<typeof TypeScriptRenderer.astToString>[0];
type ModuleImport = NonNullable<RenderArgs["imports"]>[number][number];
type ModuleExport = NonNullable<RenderArgs["exports"]>[number][number];

/**
 * Renders TS files: optional header (passed in by the orchestrator,
 * keyed on logical path) prints first, then imports declared via
 * codegen-core's File graph (`file.imports`), then re-exports, then body
 * nodes (`TsStatementNode`s) through Hey API's TypeScript renderer.
 */
export class TsStatementRenderer implements Renderer {
  constructor(
    private readonly headers: Map<string, string>,
    private readonly reexports: Map<string, ReadonlyArray<EmitTsExportGroup>>,
  ) {}

  supports(ctx: RenderContext): boolean {
    if (ctx.file.language !== "typescript") return false;
    const nodes = Array.from(ctx.file.nodes);
    if (!nodes.every((n) => n instanceof TsStatementNode)) return false;
    return nodes.length > 0 || this.reexports.has(ctx.file.logicalFilePath);
  }

  render(ctx: RenderContext): string {
    const path = ctx.file.logicalFilePath;
    const imports: ModuleImport[] = [];
    for (const { from, ...group } of ctx.file.imports) {
      if (group.kind !== "named") continue;
      imports.push({
        ...group,
        modulePath: relativeModulePath(path, from.logicalFilePath),
      });
    }
    const exports = (this.reexports.get(path) ?? [])
      .filter((group) => !group.names || group.names.length > 0)
      .map(moduleExport);

    const nodes: TsDsl[] = [];
    const rawCode: string[] = [];
    for (const node of ctx.file.nodes) {
      if (!(node instanceof TsStatementNode)) continue;
      const value = node.toAst();
      if (typeof value === "string") rawCode.push(value);
      else nodes.push(value);
    }

    const body = TypeScriptRenderer.astToString({
      exports: exports.length ? [exports] : undefined,
      exportsOptions: { preferExportAll: true },
      imports: imports.length ? [imports] : undefined,
      nodes,
    }).trim();
    const printed = `${[body, ...rawCode].filter(Boolean).join("\n\n")}\n`;

    const header = this.headers.get(path);
    if (!header) return printed;
    const headerText = header.endsWith("\n") ? header : `${header}\n`;
    return headerText + printed;
  }
}

/** Renders files whose nodes are `RawTextNode`s by concatenating their text. */
export class RawTextRenderer implements Renderer {
  supports(ctx: RenderContext): boolean {
    const nodes = Array.from(ctx.file.nodes);
    return nodes.length > 0 && nodes.every((n) => n instanceof RawTextNode);
  }

  render(ctx: RenderContext): string {
    const parts: string[] = [];
    for (const node of ctx.file.nodes) {
      if (node instanceof RawTextNode) parts.push(node.toAst());
    }
    return parts.join("");
  }
}

function moduleExport(group: EmitTsExportGroup): ModuleExport {
  return {
    canExportAll: !group.names,
    exports: (group.names ?? []).map((n) => ({
      exportedName: n.name,
      isTypeOnly: n.isType ?? false,
      kind: "named",
      sourceName: n.name,
    })),
    isTypeOnly: group.isType ?? false,
    modulePath: withJsExtension(group.from),
  };
}

/**
 * Relative module specifier between two logical (no-extension) file paths,
 * with POSIX separators and a `.js` extension so it resolves under Node ESM,
 * `nodenext` and `bundler` alike.
 */
function relativeModulePath(fromLogical: string, toLogical: string): string {
  const rel = posix.relative(posix.dirname(fromLogical), toLogical);
  return withJsExtension(rel.startsWith(".") ? rel : `./${rel}`);
}

function withJsExtension(specifier: string): string {
  return specifier.startsWith(".") ? `${specifier}.js` : specifier;
}
