import type { SwiftExpression } from '../expression';
import type { SwiftPattern } from '../pattern';

export type SwiftAvailabilityCondition = {
  platforms: ReadonlyArray<string>;
};

export type SwiftMatchingPatternCondition = {
  initializer: SwiftExpression;
  pattern: SwiftPattern;
};

export type SwiftOptionalBindingCondition = {
  bindingSpecifier: 'let' | 'var';
  initializer?: SwiftExpression;
  pattern: string;
};

export type SwiftCondition =
  | SwiftAvailabilityCondition
  | SwiftExpression
  | SwiftMatchingPatternCondition
  | SwiftOptionalBindingCondition;
