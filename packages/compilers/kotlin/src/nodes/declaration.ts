import type { KotlinAnnotation } from "./declarations/annotation.js";
import type { KotlinClassDeclaration } from "./declarations/class.js";
import type { KotlinEnumEntry } from "./declarations/enum-entry.js";
import type { KotlinFunctionDeclaration } from "./declarations/function.js";
import type { KotlinInitBlock } from "./declarations/init-block.js";
import type { KotlinObjectDeclaration } from "./declarations/object.js";
import type { KotlinParameter } from "./declarations/parameter.js";
import type { KotlinPrimaryConstructor } from "./declarations/primary-constructor.js";
import type { KotlinProperty } from "./declarations/property.js";
import type { KotlinTypeAlias } from "./declarations/type-alias.js";

export type KotlinDeclaration =
  | KotlinAnnotation
  | KotlinClassDeclaration
  | KotlinEnumEntry
  | KotlinFunctionDeclaration
  | KotlinInitBlock
  | KotlinObjectDeclaration
  | KotlinParameter
  | KotlinPrimaryConstructor
  | KotlinProperty
  | KotlinTypeAlias;
