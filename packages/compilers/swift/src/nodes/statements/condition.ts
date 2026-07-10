import type { SwiftExpression } from '../expression';
import type { SwiftPattern } from '../pattern';

export type SwiftAvailabilityCondition = {
  platforms: ReadonlyArray<string>;
};

export type SwiftMatchingPatternCondition = {
  pattern: SwiftPattern;
  value: SwiftExpression;
};

export type SwiftOptionalBindingCondition = {
  bindingSpecifier: 'let' | 'var';
  name: string;
  value?: SwiftExpression;
};

export type SwiftCondition =
  | SwiftAvailabilityCondition
  | SwiftExpression
  | SwiftMatchingPatternCondition
  | SwiftOptionalBindingCondition;
