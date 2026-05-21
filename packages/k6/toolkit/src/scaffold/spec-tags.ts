import { type WalkedOperation, walkOperations } from "@ir-kit/k6-gen";
import type { IR } from "@ir-kit/openapi-tools";

/** Tag-bucketed view of a spec's operations — `"_untagged"` collects ops with no tag. */
export interface SpecOperations {
  /** Tag name → ops; ops are also referenced by `byId`. */
  byTag: ReadonlyMap<string, ReadonlyArray<WalkedOperation>>;
  /** Operation ID → op. Flat lookup for the wizard / flag mode. */
  byId: ReadonlyMap<string, WalkedOperation>;
  /** Every op in spec order. */
  all: ReadonlyArray<WalkedOperation>;
}

const UNTAGGED = "_untagged";

export function readSpecOperations(
  paths: IR.PathsObject | undefined,
): SpecOperations {
  const byTag = new Map<string, WalkedOperation[]>();
  const byId = new Map<string, WalkedOperation>();
  const all: WalkedOperation[] = [];

  for (const op of walkOperations(paths)) {
    all.push(op);
    byId.set(op.id, op);
    const tags = op.tags.length > 0 ? op.tags : [UNTAGGED];
    for (const tag of tags) {
      let bucket = byTag.get(tag);
      if (!bucket) {
        bucket = [];
        byTag.set(tag, bucket);
      }
      bucket.push(op);
    }
  }

  return { byTag, byId, all };
}

export { UNTAGGED };
