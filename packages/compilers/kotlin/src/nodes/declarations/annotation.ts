import type { KotlinNodeBase } from '../base';
import { KotlinNodeKind } from '../kinds';
import type { KotlinAnnotationUseSiteTarget, KotlinValueArgument } from '../shared';

export interface KotlinAnnotation extends KotlinNodeBase {
  kind: KotlinNodeKind.Annotation;
  name: string;
  useSiteTarget?: KotlinAnnotationUseSiteTarget;
  valueArguments?: ReadonlyArray<KotlinValueArgument>;
}

export function createAnnotation(
  name: string,
  valueArguments?: ReadonlyArray<KotlinValueArgument>,
  useSiteTarget?: KotlinAnnotationUseSiteTarget,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinAnnotation {
  return {
    kind: KotlinNodeKind.Annotation,
    leadingComments,
    name,
    trailingComments,
    useSiteTarget,
    valueArguments,
  };
}
