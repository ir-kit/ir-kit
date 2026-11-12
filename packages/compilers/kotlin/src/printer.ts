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
   * @default 140 (ktlint_official)
   */
  maxLineLength?: number;
  /**
   * Spaces per indentation level.
   *
   * @default 2
   */
  indentSize?: number;
}

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
  const maxLineLength = options?.maxLineLength ?? 140;
  const INDENT = " ".repeat(options?.indentSize ?? 2);
  /** Nesting depth of the line currently being printed. */
  let depth = 0;
  /** Absolute column where the node being printed starts. */
  let column = 0;

  function indent(source: string): string {
    return source
      .split("\n")
      .map((line) => (line.length ? INDENT + line : line))
      .join("\n");
  }

  function nested(print: () => string): string {
    depth++;
    try {
      return indent(print());
    } finally {
      depth--;
    }
  }

  function atLineStart(node: KotlinNode): string {
    column = depth * INDENT.length;
    return printNode(node);
  }

  function printAt(col: number, node: KotlinNode): string {
    column = col;
    return printNode(node);
  }

  /** Column right after `text` when it is printed starting at `start`. */
  function columnAfter(start: number, text: string): number {
    const newline = text.lastIndexOf("\n");
    return newline < 0
      ? start + text.length
      : depth * INDENT.length + text.length - newline - 1;
  }

  /** Whether the first line of `text`, printed at `start`, fits. */
  function fits(start: number, text: string): boolean {
    if (maxLineLength <= 0) return true;
    const newline = text.indexOf("\n");
    return start + (newline < 0 ? text.length : newline) <= maxLineLength;
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
    force = false,
  ): string {
    const list = parameters ?? [];
    if (list.length && (force || list.length >= wrapFrom)) {
      return `\n${nested(() => list.map((parameter) => `${atLineStart(parameter)},`).join("\n"))}\n`;
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
    return ` {\n${nested(() => members.map(atLineStart).join("\n\n"))}\n}`;
  }

  function printStatementBlock(statements: ReadonlyArray<KotlinNode>): string {
    if (!statements.length) return "{}";
    return `{\n${nested(() => statements.map(atLineStart).join("\n"))}\n}`;
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
    const entries = nested(() => {
      const printed = node.entries.map((entry) => {
        column = depth * INDENT.length;
        const label = entry.conditions?.length
          ? entry.conditions.map((condition) => printNode(condition)).join(", ")
          : "else";
        const start = depth * INDENT.length;
        return `${label} -> ${printAt(start + label.length + 4, entry.body)}`;
      });
      const multiline = printed.some((entry) => entry.includes("\n"));
      return printed.join(multiline ? "\n\n" : "\n");
    });
    return `when${subject} {\n${entries}\n}`;
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

  function assignBody(
    start: number,
    signature: string,
    expression: KotlinNode,
  ): string {
    const bodyStart = columnAfter(start, signature) + 3;
    const body = printAt(bodyStart, expression);
    if (!body.includes("\n") && fits(bodyStart, body))
      return `${signature} = ${body}`;
    return `${signature} =\n${nested(() => atLineStart(expression))}`;
  }

  function printCall(node: {
    callee: KotlinNode;
    trailingLambda?: KotlinNode;
    typeArguments?: ReadonlyArray<KotlinNode>;
    valueArguments?: ReadonlyArray<KotlinValueArgument>;
  }): string {
    const start = column;
    const head = `${printNode(node.callee)}${printTypeArguments(node.typeArguments)}`;
    const lambda = node.trailingLambda
      ? ` ${printNode(node.trailingLambda)}`
      : "";
    const args = node.valueArguments ?? [];
    if (!args.length)
      return `${head}${node.trailingLambda ? "" : "()"}${lambda}`;
    const argPrefix = (a: KotlinValueArgument) =>
      `${a.spread ? "*" : ""}${a.name ? `${a.name} = ` : ""}`;
    let col = columnAfter(start, head) + 1;
    const inline = args.map((a) => {
      const prefix = argPrefix(a);
      const text = `${prefix}${printAt(col + prefix.length, a.expression)}`;
      col = columnAfter(col, text) + 2;
      return text;
    });
    const oneLine = `${head}(${inline.join(", ")})`;
    if (
      !inline.some((text) => text.includes("\n")) &&
      fits(start, `${oneLine}${lambda}`)
    )
      return `${oneLine}${lambda}`;
    const wrapped = nested(() =>
      args
        .map((a) => {
          const prefix = argPrefix(a);
          const at = depth * INDENT.length + prefix.length;
          return `${prefix}${printAt(at, a.expression)},`;
        })
        .join("\n"),
    );
    return `${head}(\n${wrapped}\n)${lambda}`;
  }

  function printNode(node: KotlinNode): string {
    const comments = node.leadingComments?.length
      ? `${node.leadingComments.join("\n")}\n`
      : "";
    return comments + printBareNode(node);
  }

  function printBareNode(node: KotlinNode): string {
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

      case KotlinNodeKind.Assignment: {
        const start = column;
        const head = `${printNode(node.target)} ${node.operator ?? "="} `;
        return `${head}${printAt(columnAfter(start, head), node.value)}`;
      }

      case KotlinNodeKind.BinaryExpression: {
        const range = node.operator === ".." || node.operator === "..<";
        const separator = range ? "" : " ";
        return `${printNode(node.left)}${separator}${node.operator}${separator}${printNode(node.right)}`;
      }

      case KotlinNodeKind.Block:
        return printStatementBlock(node.statements);

      case KotlinNodeKind.BreakStatement:
        return `break${node.label ? `@${node.label}` : ""}`;

      case KotlinNodeKind.CallExpression:
        return printCall(node);

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
        const body = nested(() => {
          const parts: Array<string> = [];
          if (entries.length) {
            const printed = entries
              .map((entry, i) => {
                const text = atLineStart(entry);
                return i > 0 && entry.annotations?.length ? `\n${text}` : text;
              })
              .join(",\n");
            parts.push(members.length ? `${printed},\n;` : `${printed},`);
          }
          if (members.length) parts.push(members.map(atLineStart).join("\n\n"));
          return parts.join("\n\n");
        });
        return `${header} {\n${body}\n}`;
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
        const start = column;
        const prefix = printPrefix(node.annotations, node.modifiers);
        const sign = (force: boolean, wrapReturn = false) =>
          `${prefix}fun ${typeParams ? `${typeParams} ` : ""}${receiver}${node.name}(${printParameters(node.parameters, 2, force)})${wrapReturn && node.returnType ? `:\n${INDENT}${printNode(node.returnType)}` : returnType}${printWhereClause(node.typeParameters)}`;
        const headerFits = (signature: string) => {
          const lastLine = signature.slice(signature.lastIndexOf("\n") + 1);
          return fits(
            columnAfter(start, prefix),
            `${lastLine.slice(lastLine === signature ? prefix.length : 0)} {`,
          );
        };
        let signature = sign(false);
        if (!headerFits(signature)) signature = sign(true);
        const wrapReturn = !!node.returnType && !headerFits(signature);
        if (wrapReturn) signature = sign(true, true);
        const expressionBody =
          node.expressionBody ?? singleReturnExpression(node.body ?? []);
        if (expressionBody && wrapReturn)
          return `${signature} =\n${nested(() => atLineStart(expressionBody))}`;
        if (expressionBody) return assignBody(start, signature, expressionBody);
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
        const body = nested(() => node.statements.map(atLineStart).join("\n"));
        return `{${header ? ` ${header.trimEnd()}` : ""}\n${body}\n}`;
      }

      case KotlinNodeKind.Literal:
        return node.literalKind === "char"
          ? `'${escape(node.text, "'")}'`
          : node.text;

      case KotlinNodeKind.NavigationExpression: {
        const start = column;
        const head = `${printNode(node.receiver)}${node.safe ? "?." : "."}`;
        return `${head}${printAt(columnAfter(start, head), node.selector)}`;
      }

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
        const decl = `${printModifiersSpaced(node.modifiers)}${valOrVar}${node.name}:`;
        const type = `${printNode(node.type)}${def}`;
        const flat = `${printAnnotationsInline(node.annotations)}${decl} ${type}`;
        if (fits(column, `${flat},`)) return flat;
        const annotations = printAnnotationLines(node.annotations);
        if (fits(column, `${decl} ${type},`))
          return `${annotations}${decl} ${type}`;
        return `${annotations}${decl}\n${INDENT}${type}`;
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
        const start = column;
        const type = node.type ? `: ${printNode(node.type)}` : "";
        const lead = `${printPrefix(node.annotations, node.modifiers)}${node.valOrVar} ${node.name}${type}`;
        let tail = "";
        const init = node.initializer;
        if (init) {
          const value = printAt(columnAfter(start, lead) + 3, init);
          tail =
            value.includes("\n") && init.kind === KotlinNodeKind.CallExpression
              ? ` =\n${nested(() => atLineStart(init))}`
              : ` = ${value}`;
        } else if (node.delegate) tail = ` by ${printNode(node.delegate)}`;
        const head = `${lead}${tail}`;
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
        const head = `return${label}`;
        return node.expression
          ? `${head} ${printAt(column + head.length + 1, node.expression)}`
          : head;
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
          blocks.push(node.declarations.map(atLineStart).join("\n\n"));
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
