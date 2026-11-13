import { readFile } from "node:fs/promises";

interface BundleSignature {
  name: string;
  file: string;
  input: unknown;
  output: unknown;
}

interface Bundle {
  signatures: Record<string, BundleSignature>;
  definitions: Record<string, unknown>;
}

export interface DiffChange {
  id: string;
  kind: "added" | "removed" | "input-changed" | "output-changed";
  detail?: string;
}

export interface DiffDefinitionChange {
  name: string;
  kind: "added" | "removed" | "changed";
}

export interface RunDiffResult {
  changes: ReadonlyArray<DiffChange>;
  definitionChanges: ReadonlyArray<DiffDefinitionChange>;
  breaking: number;
  additive: number;
}

export async function runDiff(
  fromPath: string,
  toPath: string,
): Promise<RunDiffResult> {
  const [from, to] = await Promise.all([
    loadBundle(fromPath),
    loadBundle(toPath),
  ]);
  return diffBundles(from, to);
}

async function loadBundle(p: string): Promise<Bundle> {
  const text = await readFile(p, "utf8");
  const json = JSON.parse(text);
  if (!json || typeof json !== "object" || !("signatures" in json)) {
    throw new Error(`${p} is not a fn-schema bundle (missing 'signatures')`);
  }
  return json as Bundle;
}

function diffBundles(from: Bundle, to: Bundle): RunDiffResult {
  const changes: DiffChange[] = [];
  const fromIds = new Set(Object.keys(from.signatures));
  const toIds = new Set(Object.keys(to.signatures));

  for (const id of fromIds) {
    if (!toIds.has(id)) {
      changes.push({ id, kind: "removed" });
      continue;
    }
    const a = from.signatures[id]!;
    const b = to.signatures[id]!;
    if (JSON.stringify(a.input) !== JSON.stringify(b.input)) {
      changes.push({ id, kind: "input-changed" });
    }
    if (JSON.stringify(a.output) !== JSON.stringify(b.output)) {
      changes.push({ id, kind: "output-changed" });
    }
  }
  for (const id of toIds) {
    if (!fromIds.has(id)) changes.push({ id, kind: "added" });
  }

  const definitionChanges: DiffDefinitionChange[] = [];
  const fromDefs = new Set(Object.keys(from.definitions ?? {}));
  const toDefs = new Set(Object.keys(to.definitions ?? {}));
  for (const name of fromDefs) {
    if (!toDefs.has(name)) definitionChanges.push({ name, kind: "removed" });
    else if (
      JSON.stringify(from.definitions[name]) !==
      JSON.stringify(to.definitions[name])
    ) {
      definitionChanges.push({ name, kind: "changed" });
    }
  }
  for (const name of toDefs) {
    if (!fromDefs.has(name)) definitionChanges.push({ name, kind: "added" });
  }

  const breaking = changes.filter(
    (c) =>
      c.kind === "removed" ||
      c.kind === "input-changed" ||
      c.kind === "output-changed",
  ).length;
  const additive = changes.filter((c) => c.kind === "added").length;
  return { changes, definitionChanges, breaking, additive };
}
