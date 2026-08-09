import type { KotlinParameter } from './declarations/parameter';
import type { KotlinExpression } from './expression';
import type { KotlinStatement } from './statement';
import type { KotlinBlock } from './statements/block';
import type { KotlinType } from './type';

export type KotlinAnnotationUseSiteTarget =
  | 'delegate'
  | 'field'
  | 'file'
  | 'get'
  | 'param'
  | 'property'
  | 'receiver'
  | 'set'
  | 'setparam';

export type KotlinAssignmentOperator = '%=' | '*=' | '+=' | '-=' | '/=' | '=';

export type KotlinBinaryOperator =
  | '*'
  | '/'
  | '%'
  | '+'
  | '-'
  | '..'
  | '..<'
  | '<'
  | '<='
  | '>'
  | '>='
  | '=='
  | '!='
  | '==='
  | '!=='
  | '&&'
  | '||'
  | 'in'
  | '!in';

export type KotlinCatchClause = {
  body: KotlinBlock;
  parameter: KotlinParameter;
};

export type KotlinFunctionTypeParameter = { name?: string; type: KotlinType };

export type KotlinLambdaParameter = { name: string; type?: KotlinType };

export type KotlinLiteralKind = 'boolean' | 'char' | 'double' | 'float' | 'int' | 'long' | 'null';

export type KotlinModifier = string;

export type KotlinPostfixOperator = '!!' | '++' | '--';

export type KotlinPrefixOperator = '!' | '+' | '++' | '-' | '--';

export type KotlinPropertyAccessor = {
  body?: ReadonlyArray<KotlinStatement>;
  expressionBody?: KotlinExpression;
  isGetter: boolean;
  modifiers?: ReadonlyArray<KotlinModifier>;
  parameter?: KotlinParameter;
};

export type KotlinStringTemplateEntry = { expression?: KotlinExpression; text?: string };

export type KotlinSuperType = {
  arguments?: ReadonlyArray<KotlinValueArgument>;
  delegate?: KotlinExpression;
  type: KotlinType;
};

export type KotlinValOrVar = 'val' | 'var';

export type KotlinValueArgument = { expression: KotlinExpression; name?: string; spread?: boolean };

export type KotlinWhenEntry = {
  body: KotlinExpression | KotlinStatement;
  conditions?: ReadonlyArray<KotlinExpression>;
};
