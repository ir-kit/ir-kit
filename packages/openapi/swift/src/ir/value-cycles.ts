import { swift } from "@ir-kit/compiler-swift";
import type { SwDecl } from "../ast/index.js";
import { eachNode } from "../ast/walk.js";

const f = swift.factory;
const K = swift.SwiftNodeKind;

/** Positions that store a value behind a heap reference (or not at all). */
const INDIRECT: ReadonlySet<string> = new Set([
  K.ArrayType,
  K.DictionaryType,
  K.FunctionType,
  K.FunctionDeclaration,
  K.InitializerDeclaration,
]);

type ClassArgs = Parameters<typeof f.createClassDeclaration>;
interface StructNode {
  name: string;
  members: ClassArgs[1];
  modifiers?: ClassArgs[2];
  inheritanceClause?: ClassArgs[3];
}

/**
 * Structs whose stored properties reach themselves by value have
 * infinite size. Each struct on such a cycle becomes a `final class`,
 * which stores the cycle by reference and keeps synthesized `Codable`.
 */
export function boxValueCycles(decls: ReadonlyArray<SwDecl>): SwDecl[] {
  const values = new Map(
    decls
      .filter((d) => d.kind !== "class" && d.kind !== "protocol")
      .map((d) => [d.name, d]),
  );
  const edges = new Map<string, string[]>();
  for (const [name, d] of values) {
    const refs = new Set<string>();
    eachNode(
      d.node,
      (n) => {
        if (n.kind === K.IdentifierType && values.has(n.name as string))
          refs.add(n.name as string);
      },
      (n) => INDIRECT.has(n.kind as string),
    );
    edges.set(name, [...refs]);
  }
  const cyclic = cyclicNodes(edges);
  return decls.map((d) =>
    d.kind === "struct" && cyclic.has(d.name) ? toFinalClass(d) : d,
  );
}

function toFinalClass(d: SwDecl): SwDecl {
  const s = d.node as unknown as StructNode;
  return {
    ...d,
    kind: "class",
    node: f.createClassDeclaration(
      s.name,
      s.members,
      [...(s.modifiers ?? []), "final"],
      s.inheritanceClause,
    ),
  };
}

/** Nodes on a cycle, via Tarjan's strongly connected components. */
function cyclicNodes(edges: ReadonlyMap<string, string[]>): Set<string> {
  const index = new Map<string, number>();
  const low = new Map<string, number>();
  const stack: string[] = [];
  const onStack = new Set<string>();
  const cyclic = new Set<string>();
  let next = 0;
  const visit = (v: string) => {
    index.set(v, next);
    low.set(v, next++);
    stack.push(v);
    onStack.add(v);
    for (const w of edges.get(v) ?? []) {
      if (!index.has(w)) {
        visit(w);
        low.set(v, Math.min(low.get(v)!, low.get(w)!));
      } else if (onStack.has(w)) {
        low.set(v, Math.min(low.get(v)!, index.get(w)!));
      }
    }
    if (low.get(v) !== index.get(v)) return;
    const scc: string[] = [];
    let w: string;
    do {
      w = stack.pop()!;
      onStack.delete(w);
      scc.push(w);
    } while (w !== v);
    if (scc.length > 1 || edges.get(v)?.includes(v))
      for (const n of scc) cyclic.add(n);
  };
  for (const v of edges.keys()) if (!index.has(v)) visit(v);
  return cyclic;
}
