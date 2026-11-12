type Node = Record<string, unknown>;

/**
 * True when `test` holds for `node` or any node below it. Subtrees for
 * which `skip` holds are not entered.
 */
export function someNode(
  node: unknown,
  test: (n: Node) => boolean,
  skip?: (n: Node) => boolean,
): boolean {
  if (!node || typeof node !== "object") return false;
  if (Array.isArray(node)) return node.some((n) => someNode(n, test, skip));
  const n = node as Node;
  if (skip?.(n)) return false;
  if (test(n)) return true;
  return Object.values(n).some((v) => someNode(v, test, skip));
}

/** Calls `visit` on `node` and every node below it outside skipped subtrees. */
export function eachNode(
  node: unknown,
  visit: (n: Node) => void,
  skip?: (n: Node) => boolean,
): void {
  someNode(
    node,
    (n) => {
      visit(n);
      return false;
    },
    skip,
  );
}
