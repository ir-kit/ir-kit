import type { JavaNodeBase } from '../base';
import type { JavaExpression } from '../expression';
import { JavaNodeKind } from '../kinds';

export interface JavaTypeParameter extends JavaNodeBase {
  bounds?: ReadonlyArray<JavaExpression>;
  kind: JavaNodeKind.TypeParameter;
  name: string; // extends bounds
}

export function createTypeParameter(
  name: string,
  bounds?: ReadonlyArray<JavaExpression>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaTypeParameter {
  return {
    bounds,
    kind: JavaNodeKind.TypeParameter,
    leadingComments,
    name,
    trailingComments,
  };
}

export interface JavaWildcardTypeArgument extends JavaNodeBase {
  // '?', '? extends T', '? super T'
  boundKind?: 'extends' | 'super';
  boundType?: JavaExpression;
  kind: JavaNodeKind.WildcardTypeArgument;
}

export function createWildcardTypeArgument(
  boundKind?: 'extends' | 'super',
  boundType?: JavaExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaWildcardTypeArgument {
  return {
    boundKind,
    boundType,
    kind: JavaNodeKind.WildcardTypeArgument,
    leadingComments,
    trailingComments,
  };
}

export interface JavaParameterizedType extends JavaNodeBase {
  kind: JavaNodeKind.ParameterizedType;
  rawType: JavaExpression;
  typeArguments: ReadonlyArray<JavaExpression>; // includes wildcards
}

export function createParameterizedType(
  rawType: JavaExpression,
  typeArguments: ReadonlyArray<JavaExpression>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaParameterizedType {
  return {
    kind: JavaNodeKind.ParameterizedType,
    leadingComments,
    rawType,
    trailingComments,
    typeArguments,
  };
}

export interface JavaArrayType extends JavaNodeBase {
  dimensions: number;
  elementType: JavaExpression;
  kind: JavaNodeKind.ArrayType; // number of array dimensions
}

export function createArrayType(
  elementType: JavaExpression,
  dimensions: number = 1,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaArrayType {
  return {
    dimensions,
    elementType,
    kind: JavaNodeKind.ArrayType,
    leadingComments,
    trailingComments,
  };
}
