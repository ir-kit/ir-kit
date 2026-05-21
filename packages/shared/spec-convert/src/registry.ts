import type { ConverterPair, SpecFormat } from "./types.js";

const registry = new Map<string, ConverterPair>();

const key = (from: SpecFormat, to: SpecFormat): string => `${from}->${to}`;

export function registerConverter(pair: ConverterPair): void {
  registry.set(key(pair.from, pair.to), pair);
}

export function findConverter(
  from: SpecFormat,
  to: SpecFormat,
): ConverterPair | undefined {
  return registry.get(key(from, to));
}

export function listConverters(): ReadonlyArray<{
  from: SpecFormat;
  to: SpecFormat;
}> {
  return Array.from(registry.values()).map(({ from, to }) => ({ from, to }));
}

/**
 * Shortest converter path from `from` to `to`, including direct pairs.
 * BFS over the registered converter graph; returns `undefined` if no
 * path exists. Chains let any new (X → openapi3, openapi3 → X) pair
 * unlock conversions to every other registered format automatically.
 */
export function findConverterPath(
  from: SpecFormat,
  to: SpecFormat,
): ConverterPair[] | undefined {
  if (from === to) return [];

  const adjacency = new Map<SpecFormat, ConverterPair[]>();
  for (const pair of registry.values()) {
    const edges = adjacency.get(pair.from) ?? [];
    edges.push(pair);
    adjacency.set(pair.from, edges);
  }

  type QueueItem = { node: SpecFormat; path: ConverterPair[] };
  const queue: QueueItem[] = [{ node: from, path: [] }];
  const visited = new Set<SpecFormat>([from]);

  while (queue.length > 0) {
    const { node, path } = queue.shift()!;
    for (const edge of adjacency.get(node) ?? []) {
      if (visited.has(edge.to)) continue;
      const next = [...path, edge];
      if (edge.to === to) return next;
      visited.add(edge.to);
      queue.push({ node: edge.to, path: next });
    }
  }
  return undefined;
}
