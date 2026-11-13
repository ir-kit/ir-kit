import { java } from "../../../compilers/java/index.js";

import type { JAlias, JDecl, JEmitted, JType } from "../ast/index.js";

/** Drops alias pseudo-declarations and inlines each alias at its use sites. */
export function resolveAliases(emitted: ReadonlyArray<JEmitted>): JDecl[] {
  const aliases = new Map<string, JType>();
  for (const d of emitted)
    if (d.kind === "alias") aliases.set(d.name, d.target);

  const expand = (name: string, seen: Set<string>): JType | undefined => {
    const target = aliases.get(name);
    if (!target || seen.has(name)) return undefined;
    return substitute(target, new Set([...seen, name])) as JType;
  };
  const substitute = (node: unknown, seen: Set<string>): unknown => {
    if (Array.isArray(node)) return node.map((n) => substitute(n, seen));
    if (!node || typeof node !== "object") return node;
    const n = node as Record<string, unknown>;
    if (n.kind === java.JavaNodeKind.Identifier && typeof n.name === "string") {
      const replacement = expand(n.name, seen);
      if (replacement) return replacement;
    }
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(n)) out[k] = substitute(v, seen);
    return out;
  };

  return emitted
    .filter((d): d is JDecl => d.kind !== "alias")
    .map((d) => substitute(d, new Set()) as JDecl);
}

export const isAlias = (d: JEmitted): d is JAlias => d.kind === "alias";
