import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftPattern } from '../pattern';

export type SwiftValueBindingSpecifier = 'let' | 'var';

export interface SwiftValueBindingPattern extends SwiftNodeBase {
  bindingSpecifier: SwiftValueBindingSpecifier;
  kind: SwiftNodeKind.ValueBindingPattern;
  pattern: SwiftPattern;
}

export function createValueBindingPattern(
  bindingSpecifier: SwiftValueBindingSpecifier,
  pattern: SwiftPattern,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftValueBindingPattern {
  return {
    bindingSpecifier,
    kind: SwiftNodeKind.ValueBindingPattern,
    leadingComments,
    pattern,
    trailingComments,
  };
}
