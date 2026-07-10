import type { SwiftType } from '../type';

export type SwiftAttribute = {
  arguments?: string;
  name: string;
};

export type SwiftGenericParameter = {
  constraint?: SwiftType;
  isPack?: boolean;
  name: string;
};

export type SwiftGenericRequirement = {
  left: SwiftType;
  relation: 'conformance' | 'sameType';
  right: SwiftType;
};

export type SwiftInheritanceClause = ReadonlyArray<SwiftType>;

export type SwiftModifier = string;
