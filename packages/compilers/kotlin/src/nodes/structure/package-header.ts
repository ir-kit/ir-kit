import type { KotlinNodeBase } from "../base.js";
import { KotlinNodeKind } from "../kinds.js";

export interface KotlinPackageHeader extends KotlinNodeBase {
  kind: KotlinNodeKind.PackageHeader;
  packageName: string;
}

export function createPackageHeader(
  packageName: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinPackageHeader {
  return {
    kind: KotlinNodeKind.PackageHeader,
    leadingComments,
    packageName,
    trailingComments,
  };
}
