import type { KotlinNode } from "./nodes/base.js";
import type { KotlinAnnotation } from "./nodes/declarations/annotation.js";
import type { KotlinParameter } from "./nodes/declarations/parameter.js";
import { KotlinNodeKind } from "./nodes/kinds.js";
import type {
  KotlinModifier,
  KotlinSuperType,
  KotlinValueArgument,
} from "./nodes/shared.js";
import type { KotlinTypeParameter } from "./nodes/types/type-parameter.js";

export interface KotlinPrinterOptions {
  /**
   * Maximum line length before the printer wraps elements
   * such as parameters, fields, or list items.
   * Set to `0` to disable wrapping.
   *
   * @default 80
   */
  maxLineLength?: number;
}

const INDENT = "  ";

const MODIFIER_ORDER = [
  "public",
  "protected",
  "private",
  "internal",
  "expect",
  "actual",
  "final",
  "open",
  "abstract",
  "sealed",
  "const",
  "external",
  "override",
  "lateinit",
  "tailrec",
  "vararg",
  "suspend",
  "inner",
  "enum",
  "annotation",
  "fun",
  "companion",
  "inline",
  "value",
  "infix",
  "operator",
  "data",
];

const MODIFIER_RANK = new Map(
  MODIFIER_ORDER.map((modifier, index) => [modifier, index]),
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createPrinter(options?: KotlinPrinterOptions) {
  function indent(source: string): string {
    return source
      .split("\n")
      .map((line) => (line.length ? INDENT + line : line))
      .join("\n");
  }

  function printModifiers(
    modifiers: ReadonlyArray<KotlinModifier> | undefined,
  ): string {
    if (!modifiers?.length) return "";
    const rank = (modifier: string) =>
      MODIFIER_RANK.get(modifier) ?? MODIFIER_ORDER.length;
    return [...modifiers].sort((a, b) => rank(a) - rank(b)).join(" ");
  }

  function printAnnotationLines(
    annotations: ReadonlyArray<KotlinAnnotation> | undefined,
  ): string {
    return annotations?.length
      ? `${annotations.map((a) => printNode(a)).join("\n")}\n`
      : "";
  }

  function printAnnotationsInline(
    annotations: ReadonlyArray<KotlinAnnotation> | undefined,
  ): string {
    return annotations?.length
      ? `${annotations.map((a) => printNode(a)).join(" ")} `
      : "";
  }

  function printPrefix(
    annotations: ReadonlyArray<KotlinAnnotation> | undefined,
    modifiers: ReadonlyArray<KotlinModifier> | undefined,
  ): string {
    return printAnnotationLines(annotations) + printModifiersSpaced(modifiers);
  }

  function printValueArguments(
    args: ReadonlyArray<KotlinValueArgument> | undefined,
  ): string {
    return (args ?? [])
      .map(
        (a) =>
          `${a.spread ? "*" : ""}${a.name ? `${a.name} = ` : ""}${printNode(a.expression)}`,
      )
      .join(", ");
  }

  function printParameters(
    parameters: ReadonlyArray<KotlinParameter> | undefined,
    wrapFrom: number,
  ): string {
    const list = parameters ?? [];
    if (list.length >= wrapFrom) {
      return `\n${list.map((parameter) => `${INDENT}${printNode(parameter)},`).join("\n")}\n`;
    }
    return list.map((parameter) => printNode(parameter)).join(", ");
  }

  function printSuperTypes(
    superTypes: ReadonlyArray<KotlinSuperType> | undefined,
  ): string {
    if (!superTypes?.length) return "";
    const entries = superTypes.map((superType) => {
      const args = superType.arguments
        ? `(${printValueArguments(superType.arguments)})`
        : "";
      const delegate = superType.delegate
        ? ` by ${printNode(superType.delegate)}`
        : "";
      return `${printNode(superType.type)}${args}${delegate}`;
    });
    return ` : ${entries.join(", ")}`;
  }

  function printTypeParameter(parameter: KotlinTypeParameter): string {
    const variance = parameter.variance ? `${parameter.variance} ` : "";
    const reified = parameter.isReified ? "reified " : "";
    const [singleBound] = parameter.bounds ?? [];
    const bound =
      parameter.bounds?.length === 1 && singleBound
        ? ` : ${printNode(singleBound)}`
        : "";
    return `${variance}${reified}${parameter.name}${bound}`;
  }

  function printTypeParameters(
    typeParameters: ReadonlyArray<KotlinTypeParameter> | undefined,
  ): string {
    return typeParameters?.length
      ? `<${typeParameters.map((parameter) => printTypeParameter(parameter)).join(", ")}>`
      : "";
  }

  function printWhereClause(
    typeParameters: ReadonlyArray<KotlinTypeParameter> | undefined,
  ): string {
    const constraints = (typeParameters ?? []).flatMap((parameter) =>
      parameter.bounds && parameter.bounds.length > 1
        ? parameter.bounds.map(
            (bound) => `${parameter.name} : ${printNode(bound)}`,
          )
        : [],
    );
    return constraints.length ? ` where ${constraints.join(", ")}` : "";
  }

  function printBody(members: ReadonlyArray<KotlinNode>): string {
    const body = members.map((member) => printNode(member)).join("\n\n");
    return ` {\n${indent(body)}\n}`;
  }

  function printStatementBlock(statements: ReadonlyArray<KotlinNode>): string {
    if (!statements.length) return "{}";
    return `{\n${indent(statements.map((statement) => printNode(statement)).join("\n"))}\n}`;
  }

  function printTypeArguments(
    typeArguments: ReadonlyArray<KotlinNode> | undefined,
  ): string {
    return typeArguments?.length
      ? `<${typeArguments.map((type) => printNode(type)).join(", ")}>`
      : "";
  }

  function printModifiersSpaced(
    modifiers: ReadonlyArray<KotlinModifier> | undefined,
  ): string {
    const mods = printModifiers(modifiers);
    return mods ? `${mods} ` : "";
  }

  function escape(text: string, quote: string): string {
    let result = text.replace(/\\/g, "\\\\").replaceAll(quote, `\\${quote}`);
    if (quote === '"') result = result.replace(/\$/g, "\\$");
    return result
      .replace(/\n/g, "\\n")
      .replace(/\t/g, "\\t")
      .replace(/\r/g, "\\r");
  }

  function printConditional(node: {
    condition: KotlinNode;
    elseBranch?: KotlinNode;
    thenBranch: KotlinNode;
  }): string {
    const head = `if (${printNode(node.condition)}) ${printNode(node.thenBranch)}`;
    return node.elseBranch
      ? `${head} else ${printNode(node.elseBranch)}`
      : head;
  }

  function printWhen(node: {
    entries: ReadonlyArray<{
      body: KotlinNode;
      conditions?: ReadonlyArray<KotlinNode>;
    }>;
    subject?: KotlinNode;
  }): string {
    const subject = node.subject ? ` (${printNode(node.subject)})` : "";
    const entries = node.entries.map((entry) => {
      const label = entry.conditions?.length
        ? entry.conditions.map((condition) => printNode(condition)).join(", ")
        : "else";
      return `${label} -> ${printNode(entry.body)}`;
    });
    return `when${subject} {\n${indent(entries.join("\n"))}\n}`;
  }

  function singleReturnExpression(
    statements: ReadonlyArray<KotlinNode>,
  ): KotlinNode | undefined {
    const [only] = statements;
    if (
      statements.length === 1 &&
      only &&
      only.kind === KotlinNodeKind.ReturnStatement &&
      only.expression &&
      !only.label
    ) {
      return only.expression;
    }
    return undefined;
  }

  function assignBody(signature: string, expression: KotlinNode): string {
    const body = printNode(expression);
    return body.includes("\n")
      ? `${signature} =\n${indent(body)}`
      : `${signature} = ${body}`;
  }

  function printNode(node: KotlinNode): string {
    switch (node.kind) {
      case KotlinNodeKind.Annotation: {
        const target = node.useSiteTarget ? `${node.useSiteTarget}:` : "";
        const args = node.valueArguments?.length
          ? `(${printValueArguments(node.valueArguments)})`
          : "";
        return `@${target}${node.name}${args}`;
      }

      case KotlinNodeKind.AsExpression:
        return `${printNode(node.expression)} as${node.safe ? "?" : ""} ${printNode(node.type)}`;

      case KotlinNodeKind.Assignment:
        return `${printNode(node.target)} ${node.operator ?? "="} ${printNode(node.value)}`;

      case KotlinNodeKind.BinaryExpression: {
        const range = node.operator === ".." || node.operator === "..<";
        const separator = range ? "" : " ";
        return `${printNode(node.left)}${separator}${node.operator}${separator}${printNode(node.right)}`;
      }

      case KotlinNodeKind.Block:
        return printStatementBlock(node.statements);

      case KotlinNodeKind.BreakStatement:
        return `break${node.label ? `@${node.label}` : ""}`;

      case KotlinNodeKind.CallExpression: {
        const typeArgs = printTypeArguments(node.typeArguments);
        const hasArgs = node.valueArguments?.length;
        const parens =
          hasArgs || !node.trailingLambda
            ? `(${printValueArguments(node.valueArguments)})`
            : "";
        const lambda = node.trailingLambda
          ? ` ${printNode(node.trailingLambda)}`
          : "";
        return `${printNode(node.callee)}${typeArgs}${parens}${lambda}`;
      }

      case KotlinNodeKind.CallableReference:
        return `${node.receiver ? printNode(node.receiver) : ""}::${node.name}`;

      case KotlinNodeKind.ClassDeclaration: {
        const keyword = node.isInterface ? "interface" : "class";
        const constructor = node.primaryConstructor
          ? printNode(node.primaryConstructor)
          : "";
        const header = `${printPrefix(node.annotations, node.modifiers)}${keyword} ${node.name}${printTypeParameters(node.typeParameters)}${constructor}${printSuperTypes(node.superTypes)}${printWhereClause(node.typeParameters)}`;
        const entries = node.entries ?? [];
        const members = node.members ?? [];
        if (!entries.length && !members.length) return header;
        const parts: Array<string> = [];
        if (entries.length) {
          const printed = entries.map((entry) => printNode(entry)).join(",\n");
          parts.push(members.length ? `${printed},\n;` : `${printed},`);
        }
        if (members.length)
          parts.push(members.map((member) => printNode(member)).join("\n\n"));
        return `${header} {\n${indent(parts.join("\n\n"))}\n}`;
      }

      case KotlinNodeKind.ContinueStatement:
        return `continue${node.label ? `@${node.label}` : ""}`;

      case KotlinNodeKind.ElvisExpression:
        return `${printNode(node.left)} ?: ${printNode(node.right)}`;

      case KotlinNodeKind.EnumEntry: {
        const args = node.valueArguments?.length
          ? `(${printValueArguments(node.valueArguments)})`
          : "";
        const body = node.members?.length ? printBody(node.members) : "";
        return `${printAnnotationLines(node.annotations)}${node.name}${args}${body}`;
      }

      case KotlinNodeKind.ExpressionStatement:
        return printNode(node.expression);

      case KotlinNodeKind.ForStatement: {
        const variables =
          node.variables.length === 1
            ? node.variables[0]
            : `(${node.variables.join(", ")})`;
        return `for (${variables} in ${printNode(node.iterable)}) ${printNode(node.body)}`;
      }

      case KotlinNodeKind.FunctionDeclaration: {
        const receiver = node.receiverType
          ? `${printNode(node.receiverType)}.`
          : "";
        const returnType = node.returnType
          ? `: ${printNode(node.returnType)}`
          : "";
        const typeParams = printTypeParameters(node.typeParameters);
        const signature = `${printPrefix(node.annotations, node.modifiers)}fun ${typeParams ? `${typeParams} ` : ""}${receiver}${node.name}(${printParameters(node.parameters, 2)})${returnType}${printWhereClause(node.typeParameters)}`;
        const expressionBody =
          node.expressionBody ?? singleReturnExpression(node.body ?? []);
        if (expressionBody) return assignBody(signature, expressionBody);
        if (node.body) return `${signature} ${printStatementBlock(node.body)}`;
        return signature;
      }

      case KotlinNodeKind.FunctionType: {
        const params = node.parameters
          .map((parameter) =>
            parameter.name
              ? `${parameter.name}: ${printNode(parameter.type)}`
              : printNode(parameter.type),
          )
          .join(", ");
        let receiver = "";
        if (node.receiver) {
          const wrap =
            node.receiver.kind === KotlinNodeKind.FunctionType ||
            node.receiver.kind === KotlinNodeKind.NullableType;
          receiver = `${wrap ? `(${printNode(node.receiver)})` : printNode(node.receiver)}.`;
        }
        return `${receiver}(${params}) -> ${printNode(node.returnType)}`;
      }

      case KotlinNodeKind.Identifier:
        return node.name;

      case KotlinNodeKind.IfExpression:
        return printConditional(node);

      case KotlinNodeKind.IfStatement:
        return printConditional(node);

      case KotlinNodeKind.ImportDirective: {
        const wildcard = node.isWildcard ? ".*" : "";
        const alias = node.alias ? ` as ${node.alias}` : "";
        return `import ${node.identifier}${wildcard}${alias}`;
      }

      case KotlinNodeKind.IndexingExpression:
        return `${printNode(node.receiver)}[${node.indices.map((index) => printNode(index)).join(", ")}]`;

      case KotlinNodeKind.InitBlock:
        return `init ${printStatementBlock(node.body)}`;

      case KotlinNodeKind.IsExpression:
        return `${printNode(node.expression)} ${node.negated ? "!is" : "is"} ${printNode(node.type)}`;

      case KotlinNodeKind.LambdaExpression: {
        const parameters = node.parameters ?? [];
        if (!parameters.length && !node.statements.length) return "{}";
        const header = parameters.length
          ? `${parameters.map((p) => `${p.name}${p.type ? `: ${printNode(p.type)}` : ""}`).join(", ")} -> `
          : "";
        const [first] = node.statements;
        if (node.statements.length <= 1) {
          const body = first ? printNode(first) : "";
          return `{ ${header}${body} }`;
        }
        const body = indent(
          node.statements.map((statement) => printNode(statement)).join("\n"),
        );
        return `{${header ? ` ${header.trimEnd()}` : ""}\n${body}\n}`;
      }

      case KotlinNodeKind.Literal:
        return node.literalKind === "char"
          ? `'${escape(node.text, "'")}'`
          : node.text;

      case KotlinNodeKind.NavigationExpression:
        return `${printNode(node.receiver)}${node.safe ? "?." : "."}${printNode(node.selector)}`;

      case KotlinNodeKind.NullableType: {
        const wrap = node.type.kind === KotlinNodeKind.FunctionType;
        return `${wrap ? `(${printNode(node.type)})` : printNode(node.type)}?`;
      }

      case KotlinNodeKind.ObjectDeclaration: {
        const keyword = node.isCompanion ? "companion object" : "object";
        const name = node.name ? ` ${node.name}` : "";
        const header = `${printPrefix(node.annotations, node.modifiers)}${keyword}${name}${printSuperTypes(node.superTypes)}`;
        return node.members?.length
          ? `${header}${printBody(node.members)}`
          : header;
      }

      case KotlinNodeKind.PackageHeader:
        return `package ${node.packageName}`;

      case KotlinNodeKind.Parameter: {
        const valOrVar = node.valOrVar ? `${node.valOrVar} ` : "";
        const def = node.defaultValue
          ? ` = ${printNode(node.defaultValue)}`
          : "";
        return `${printAnnotationsInline(node.annotations)}${printModifiersSpaced(node.modifiers)}${valOrVar}${node.name}: ${printNode(node.type)}${def}`;
      }

      case KotlinNodeKind.ParenthesizedExpression:
        return `(${printNode(node.expression)})`;

      case KotlinNodeKind.PostfixUnaryExpression:
        return `${printNode(node.operand)}${node.operator}`;

      case KotlinNodeKind.PrefixUnaryExpression: {
        const operand = printNode(node.operand);
        const separator =
          /[+-]$/.test(node.operator) && /^[+-]/.test(operand) ? " " : "";
        return `${node.operator}${separator}${operand}`;
      }

      case KotlinNodeKind.PrimaryConstructor: {
        const params = printParameters(node.parameters, 1);
        const decorated = node.annotations?.length || node.modifiers?.length;
        if (!decorated) return `(${params})`;
        return ` ${printAnnotationsInline(node.annotations)}${printModifiersSpaced(node.modifiers)}constructor(${params})`;
      }

      case KotlinNodeKind.Property: {
        const type = node.type ? `: ${printNode(node.type)}` : "";
        let tail = "";
        if (node.initializer) tail = ` = ${printNode(node.initializer)}`;
        else if (node.delegate) tail = ` by ${printNode(node.delegate)}`;
        const head = `${printPrefix(node.annotations, node.modifiers)}${node.valOrVar} ${node.name}${type}${tail}`;
        if (!node.accessors?.length) return head;
        const accessors = node.accessors.map((accessor) => {
          const mods = printModifiersSpaced(accessor.modifiers);
          const head2 = accessor.isGetter
            ? "get()"
            : `set(${accessor.parameter ? printNode(accessor.parameter) : ""})`;
          if (accessor.expressionBody)
            return `${mods}${head2} = ${printNode(accessor.expressionBody)}`;
          if (accessor.body)
            return `${mods}${head2} ${printStatementBlock(accessor.body)}`;
          return `${mods}${head2}`;
        });
        return `${head}\n${indent(accessors.join("\n"))}`;
      }

      case KotlinNodeKind.ReturnStatement: {
        const label = node.label ? `@${node.label}` : "";
        return `return${label}${node.expression ? ` ${printNode(node.expression)}` : ""}`;
      }

      case KotlinNodeKind.SourceFile: {
        const blocks: Array<string> = [];
        if (node.packageHeader) blocks.push(printNode(node.packageHeader));
        if (node.imports?.length) {
          blocks.push(
            node.imports.map((directive) => printNode(directive)).join("\n"),
          );
        }
        if (node.declarations.length) {
          blocks.push(
            node.declarations
              .map((declaration) => printNode(declaration))
              .join("\n\n"),
          );
        }
        return blocks.join("\n\n");
      }

      case KotlinNodeKind.StarProjection:
        return "*";

      case KotlinNodeKind.StringLiteral: {
        const quote = node.multiline ? '"""' : '"';
        const body = node.entries
          .map((entry) => {
            if (entry.expression) {
              return entry.expression.kind === KotlinNodeKind.Identifier
                ? `$${entry.expression.name}`
                : `\${${printNode(entry.expression)}}`;
            }
            const text = entry.text ?? "";
            return node.multiline ? text : escape(text, '"');
          })
          .join("");
        return `${quote}${body}${quote}`;
      }

      case KotlinNodeKind.SuperExpression:
        return `super${node.label ? `@${node.label}` : ""}`;

      case KotlinNodeKind.ThisExpression:
        return `this${node.label ? `@${node.label}` : ""}`;

      case KotlinNodeKind.ThrowStatement:
        return `throw ${printNode(node.expression)}`;

      case KotlinNodeKind.TryExpression: {
        let result = `try ${printNode(node.body)}`;
        for (const clause of node.catches ?? []) {
          result += ` catch (${printNode(clause.parameter)}) ${printNode(clause.body)}`;
        }
        if (node.finallyBlock)
          result += ` finally ${printNode(node.finallyBlock)}`;
        return result;
      }

      case KotlinNodeKind.TypeAlias:
        return `${printPrefix(node.annotations, node.modifiers)}typealias ${node.name}${printTypeParameters(node.typeParameters)} = ${printNode(node.type)}`;

      case KotlinNodeKind.TypeProjection:
        return `${node.variance} ${printNode(node.type)}`;

      case KotlinNodeKind.UserType:
        return `${node.name}${printTypeArguments(node.typeArguments)}`;

      case KotlinNodeKind.WhenExpression:
        return printWhen(node);

      case KotlinNodeKind.WhenStatement:
        return printWhen(node);

      case KotlinNodeKind.WhileStatement:
        return node.isDoWhile
          ? `do ${printNode(node.body)} while (${printNode(node.condition)})`
          : `while (${printNode(node.condition)}) ${printNode(node.body)}`;
    }
  }

  function printFile(node: KotlinNode): string {
    const source = printNode(node);
    return source ? `${source}\n` : "";
  }

  return {
    printFile,
  };
}

export function printAst(node: KotlinNode): string {
  return JSON.stringify(node, null, 2);
}
