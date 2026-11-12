import type { SwiftNode } from "./nodes/base.js";
import type {
  SwiftAttribute,
  SwiftGenericParameter,
} from "./nodes/declarations/shared.js";
import { SwiftNodeKind } from "./nodes/kinds.js";
import type { SwiftCondition } from "./nodes/statements/condition.js";

export interface SwiftPrinterOptions {
  /**
   * Maximum line length before the printer wraps elements
   * such as parameters, fields, or list items.
   * Set to `0` to disable wrapping.
   *
   * @default 100 (swift-format)
   */
  maxLineLength?: number;
}

const INDENT = "  ";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createPrinter(options?: SwiftPrinterOptions) {
  const maxLineLength = options?.maxLineLength ?? 100;
  let indentLevel = 0;
  /** Column where the expression being printed starts. */
  let column = 0;
  let memberBreaks = 0;

  /** `(a: A, b: B)`, or one parameter per line when the header overflows. */
  function printParameterList(
    parameters: ReadonlyArray<Parameters<typeof printParameter>[0]>,
    header: (list: string) => string,
  ): string {
    const inline = header(
      `(${parameters.map((parameter) => printParameter(parameter)).join(", ")})`,
    );
    const width = INDENT.length * indentLevel + inline.length + 2;
    if (!parameters.length || maxLineLength <= 0 || width <= maxLineLength)
      return inline;
    const inner = INDENT.repeat(indentLevel + 1);
    const list = parameters
      .map((parameter, index) =>
        printListedParameter(
          parameter,
          inner,
          index < parameters.length - 1 ? "," : "",
        ),
      )
      .join("\n");
    return header(`(\n${list}\n${INDENT.repeat(indentLevel)})`);
  }

  /** One parameter of a vertical list, broken the way swift-format breaks it. */
  function printListedParameter(
    parameter: Parameters<typeof printParameter>[0],
    inner: string,
    comma: string,
  ): string {
    const line = `${inner}${printParameter(parameter)}${comma}`;
    if (maxLineLength <= 0 || line.length <= maxLineLength) return line;
    const secondName = parameter.secondName ? ` ${parameter.secondName}` : "";
    const name = `${parameter.firstName}${secondName}:`;
    const type = `${parameter.isInout ? "inout " : ""}${printNode(parameter.type)}${parameter.isVariadic ? "..." : ""}`;
    const value = parameter.defaultValue
      ? printNode(parameter.defaultValue)
      : undefined;
    const continuation = `${inner}${INDENT}`;
    const head = `${inner}${name} ${type} =`;
    if (value !== undefined && head.length <= maxLineLength)
      return `${head}\n${continuation}${value}${comma}`;
    const broken = `${continuation}${type}${value === undefined ? "" : ` = ${value}`}${comma}`;
    if (value !== undefined && broken.length > maxLineLength)
      return `${inner}${name}\n${continuation}${type} =\n${continuation}${value}${comma}`;
    return `${inner}${name}\n${broken}`;
  }

  /**
   * `kind Name: A, B`, filling inheritance onto continuation lines when
   * the header overflows.
   */
  function printTypeHeader(
    prefix: string,
    inheritanceClause: ReadonlyArray<SwiftNode> | undefined,
    whereClause: string,
  ): string {
    const types = (inheritanceClause ?? []).map((type) => printNode(type));
    const inline = `${prefix}${types.length ? `: ${types.join(", ")}` : ""}${whereClause}`;
    const base = INDENT.length * indentLevel;
    if (
      !types.length ||
      maxLineLength <= 0 ||
      base + inline.length + 2 <= maxLineLength
    )
      return inline;
    let continuation = INDENT.repeat(indentLevel + 1);
    const lines = [`${prefix}:`];
    const split = prefix.lastIndexOf(" ");
    if (base + prefix.length + 1 > maxLineLength && split > 0) {
      lines.splice(
        0,
        1,
        prefix.slice(0, split),
        `${continuation}${prefix.slice(split + 1)}:`,
      );
      continuation = INDENT.repeat(indentLevel + 2);
    }
    types.forEach((type, index) => {
      const item = index < types.length - 1 ? `${type},` : type;
      const last = lines.length - 1;
      const width = (last ? 0 : base) + lines[last]!.length + 1 + item.length;
      if (width <= maxLineLength) lines[last] = `${lines[last]} ${item}`;
      else lines.push(`${continuation}${item}`);
    });
    return `${lines.join("\n")}${whereClause}`;
  }

  /** True when `{` cannot share the last header line. */
  function braceOnOwnLine(header: string): boolean {
    if (maxLineLength <= 0) return false;
    if (header.includes("\n")) return true;
    return INDENT.length * indentLevel + header.length + 2 > maxLineLength;
  }

  function printLine(line: string): string {
    return INDENT.repeat(indentLevel) + line;
  }

  function printAttributes(
    attributes: ReadonlyArray<SwiftAttribute> | undefined,
  ): Array<string> {
    if (!attributes?.length) return [];
    return attributes.map((attribute) =>
      printLine(
        attribute.arguments
          ? `@${attribute.attributeName}(${attribute.arguments})`
          : `@${attribute.attributeName}`,
      ),
    );
  }

  function printGenericParameters(
    genericParameters: ReadonlyArray<SwiftGenericParameter> | undefined,
  ): string {
    if (!genericParameters?.length) return "";
    const list = genericParameters
      .map((parameter) => {
        const each = parameter.isPack ? "each " : "";
        return parameter.inheritedType
          ? `${each}${parameter.name}: ${printNode(parameter.inheritedType)}`
          : `${each}${parameter.name}`;
      })
      .join(", ");
    return `<${list}>`;
  }

  function printInheritanceClause(
    inheritanceClause: ReadonlyArray<SwiftNode> | undefined,
  ): string {
    if (!inheritanceClause?.length) return "";
    return `: ${inheritanceClause.map((type) => printNode(type)).join(", ")}`;
  }

  function printWhereClause(
    genericWhereClause:
      | ReadonlyArray<{
          left: SwiftNode;
          relation: "conformance" | "sameType";
          right: SwiftNode;
        }>
      | undefined,
  ): string {
    if (!genericWhereClause?.length) return "";
    const requirements = genericWhereClause
      .map((requirement) =>
        requirement.relation === "sameType"
          ? `${printNode(requirement.left)} == ${printNode(requirement.right)}`
          : `${printNode(requirement.left)}: ${printNode(requirement.right)}`,
      )
      .join(", ");
    return ` where ${requirements}`;
  }

  function printParameter(parameter: {
    defaultValue?: SwiftNode;
    firstName: string;
    isInout?: boolean;
    isVariadic?: boolean;
    secondName?: string;
    type: SwiftNode;
  }): string {
    const secondName = parameter.secondName ? ` ${parameter.secondName}` : "";
    const inoutSpecifier = parameter.isInout ? "inout " : "";
    const variadic = parameter.isVariadic ? "..." : "";
    const defaultValue = parameter.defaultValue
      ? ` = ${printNode(parameter.defaultValue)}`
      : "";
    return `${parameter.firstName}${secondName}: ${inoutSpecifier}${printNode(parameter.type)}${variadic}${defaultValue}`;
  }

  function printCondition(condition: SwiftCondition): string {
    if ("kind" in condition) return printNode(condition);
    if ("platforms" in condition)
      return `#available(${condition.platforms.join(", ")})`;
    if ("bindingSpecifier" in condition) {
      if (!condition.initializer)
        return `${condition.bindingSpecifier} ${condition.pattern}`;
      const binding = `${condition.bindingSpecifier} ${condition.pattern} = `;
      column += binding.length;
      return `${binding}${printNode(condition.initializer)}`;
    }
    return `case ${printNode(condition.pattern)} = ${printNode(condition.initializer)}`;
  }

  function printConditions(
    conditions: ReadonlyArray<SwiftCondition>,
    offset: number,
  ): string {
    return conditions
      .map((condition) => {
        column = INDENT.length * indentLevel + offset;
        return printCondition(condition);
      })
      .join(", ");
  }

  /** swift-format style for conditions that span lines. */
  function printBrokenHeader(
    keyword: string,
    conditions: ReadonlyArray<SwiftCondition>,
    opener: string,
    body: ReadonlyArray<SwiftNode>,
  ): string {
    indentLevel += 1;
    const printed = printLine(printConditions(conditions, 0));
    const lines = body.map((statement) => printNode(statement));
    indentLevel -= 1;
    return [
      printLine(keyword),
      printed,
      printLine(opener),
      ...lines,
      printLine("}"),
    ].join("\n");
  }

  function printBraceBlock(
    header: string,
    body: ReadonlyArray<SwiftNode>,
    ownLineBrace = false,
  ): string {
    const headerLine = ownLineBrace
      ? `${printLine(header)}\n${printLine("{")}`
      : printLine(`${header} {`);
    indentLevel += 1;
    const lines = body.map((statement) => printNode(statement));
    indentLevel -= 1;
    return [headerLine, ...lines, printLine("}")].join("\n");
  }

  function printMemberBlock(
    header: string,
    members: ReadonlyArray<SwiftNode>,
  ): string {
    const ownLine = braceOnOwnLine(header);
    const opener = (brace: string) =>
      ownLine
        ? `${printLine(header)}\n${printLine(brace)}`
        : printLine(`${header} ${brace}`);
    if (!members.length) return opener("{}");
    const headerLine = opener("{");
    indentLevel += 1;
    const printed = members.map((member) => printNode(member));
    indentLevel -= 1;
    const lines = [headerLine];
    printed.forEach((member, index) => {
      const previous = printed[index - 1];
      if (previous && (previous.includes("\n") || member.includes("\n")))
        lines.push("");
      lines.push(member);
    });
    lines.push(printLine("}"));
    return lines.join("\n");
  }

  function escapeString(text: string): string {
    return text
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t");
  }

  function printNode(node: SwiftNode): string {
    const printed = printBareNode(node);
    if (!node.leadingComments?.length) return printed;
    return [...node.leadingComments.map((c) => printLine(c)), printed].join(
      "\n",
    );
  }

  function printBareNode(node: SwiftNode): string {
    switch (node.kind) {
      case SwiftNodeKind.AccessorBlock: {
        const accessors = node.accessors.map((accessor) =>
          printBraceBlock(accessor.accessorSpecifier, accessor.body),
        );
        return accessors.join("\n");
      }

      case SwiftNodeKind.ActorDeclaration: {
        const modifiers = node.modifiers?.length
          ? `${node.modifiers.join(" ")} `
          : "";
        return [
          ...printAttributes(node.attributes),
          printBraceBlock(`${modifiers}actor ${node.name}`, node.members),
        ].join("\n");
      }

      case SwiftNodeKind.ArrayLiteral: {
        const start = column;
        const elements = node.elements.map((element) => printNode(element));
        const inline = `[${elements.join(", ")}]`;
        if (
          !elements.length ||
          maxLineLength <= 0 ||
          inline.includes("\n") ||
          start + inline.length + 1 <= maxLineLength
        )
          return inline;
        const inner = INDENT.repeat(indentLevel + 1);
        const lines: Array<string> = [];
        let current = "";
        for (const element of elements) {
          const candidate = current ? `${current} ${element},` : `${element},`;
          if (current && inner.length + candidate.length > maxLineLength) {
            lines.push(current);
            current = `${element},`;
          } else current = candidate;
        }
        lines.push(current);
        return `[\n${lines.map((line) => `${inner}${line}`).join("\n")}\n${INDENT.repeat(indentLevel)}]`;
      }

      case SwiftNodeKind.ArrayType:
        return `[${printNode(node.element)}]`;

      case SwiftNodeKind.AsExpression:
        return `${printNode(node.expression)} as${node.questionOrExclamationMark ?? ""} ${printNode(node.type)}`;

      case SwiftNodeKind.AssignmentExpression: {
        const target = printNode(node.target);
        const value = printNode(node.value);
        const line = `${target} = ${value}`;
        if (
          maxLineLength > 0 &&
          !line.includes("\n") &&
          INDENT.length * indentLevel + line.length > maxLineLength
        )
          return `${target} =\n${INDENT.repeat(indentLevel + 1)}${value}`;
        return line;
      }

      case SwiftNodeKind.AssociatedTypeDeclaration:
        return [
          ...printAttributes(node.attributes),
          printLine(
            `associatedtype ${node.name}${printInheritanceClause(node.inheritanceClause)}`,
          ),
        ].join("\n");

      case SwiftNodeKind.AwaitExpression:
        column += "await ".length;
        return `await ${printNode(node.expression)}`;

      case SwiftNodeKind.BooleanLiteral:
        return node.literal ? "true" : "false";

      case SwiftNodeKind.BreakStatement:
        return printLine(node.label ? `break ${node.label}` : "break");

      case SwiftNodeKind.ClassDeclaration: {
        const modifiers = node.modifiers?.length
          ? `${node.modifiers.join(" ")} `
          : "";
        const header = printTypeHeader(
          `${modifiers}class ${node.name}${printGenericParameters(node.genericParameters)}`,
          node.inheritanceClause,
          printWhereClause(node.genericWhereClause),
        );
        return [
          ...printAttributes(node.attributes),
          printMemberBlock(header, node.members),
        ].join("\n");
      }

      case SwiftNodeKind.ClosureExpression: {
        const captures = node.captureList?.length
          ? `[${node.captureList.map((item) => (item.specifier ? `${item.specifier} ${item.name}` : item.name)).join(", ")}]`
          : "";
        const params = node.parameters.length ? node.parameters.join(", ") : "";
        const signatureParts = [captures, params].filter((part) => part.length);
        const signature = signatureParts.length
          ? `${signatureParts.join(" ")} in`
          : "";
        if (!node.statements.length) {
          return signature ? `{ ${signature} }` : "{}";
        }
        const header = signature ? `{ ${signature}` : "{";
        indentLevel += 1;
        const body = node.statements.map((statement) => printNode(statement));
        indentLevel -= 1;
        return [header, ...body, printLine("}")].join("\n");
      }

      case SwiftNodeKind.CompositionType:
        return node.elements.map((type) => printNode(type)).join(" & ");

      case SwiftNodeKind.ConditionalCompilation: {
        const lines = [printLine(`#if ${node.condition}`)];
        indentLevel += 1;
        lines.push(...node.thenBody.map((statement) => printNode(statement)));
        indentLevel -= 1;
        if (node.elseBody) {
          lines.push(printLine("#else"));
          indentLevel += 1;
          lines.push(...node.elseBody.map((statement) => printNode(statement)));
          indentLevel -= 1;
        }
        lines.push(printLine("#endif"));
        return lines.join("\n");
      }

      case SwiftNodeKind.ContinueStatement:
        return printLine(node.label ? `continue ${node.label}` : "continue");

      case SwiftNodeKind.DeferStatement:
        return printBraceBlock("defer", node.body);

      case SwiftNodeKind.DeinitializerDeclaration:
        return [
          ...printAttributes(node.attributes),
          printBraceBlock("deinit", node.body),
        ].join("\n");

      case SwiftNodeKind.DictionaryLiteral: {
        if (!node.content.length) return "[:]";
        const elements = node.content
          .map(
            (element) =>
              `${printNode(element.key)}: ${printNode(element.value)}`,
          )
          .join(", ");
        return `[${elements}]`;
      }

      case SwiftNodeKind.DictionaryType:
        return `[${printNode(node.key)}: ${printNode(node.value)}]`;

      case SwiftNodeKind.DiscardStatement:
        return printLine(`_ = ${printNode(node.expression)}`);

      case SwiftNodeKind.DoStatement: {
        const headerLine = printLine("do {");
        indentLevel += 1;
        const body = node.body.map((statement) => printNode(statement));
        indentLevel -= 1;
        const lines = [headerLine, ...body];
        for (const catchClause of node.catchClauses) {
          lines.push(
            printLine(
              catchClause.catchItems
                ? `} catch ${printNode(catchClause.catchItems)} {`
                : "} catch {",
            ),
          );
          indentLevel += 1;
          lines.push(
            ...catchClause.body.map((statement) => printNode(statement)),
          );
          indentLevel -= 1;
        }
        lines.push(printLine("}"));
        return lines.join("\n");
      }

      case SwiftNodeKind.EnumCaseDeclaration: {
        const elements = node.elements.map((element) => {
          const associatedValues = element.parameterClause?.length
            ? `(${element.parameterClause
                .map((value) =>
                  "kind" in value
                    ? printNode(value)
                    : `${value.firstName ? `${value.firstName}: ` : ""}${printNode(value.type)}`,
                )
                .join(", ")})`
            : "";
          const rawValue = element.rawValue
            ? ` = ${printNode(element.rawValue)}`
            : "";
          return `${element.name}${associatedValues}${rawValue}`;
        });
        const [only] = node.elements;
        const line = printLine(`case ${elements.join(", ")}`);
        if (
          node.elements.length === 1 &&
          only?.rawValue &&
          maxLineLength > 0 &&
          line.length > maxLineLength
        )
          return [
            ...printAttributes(node.attributes),
            printLine(
              `case ${elements[0]!.slice(0, elements[0]!.lastIndexOf(" = "))} =`,
            ),
            `${INDENT.repeat(indentLevel + 1)}${printNode(only.rawValue)}`,
          ].join("\n");
        return [...printAttributes(node.attributes), line].join("\n");
      }

      case SwiftNodeKind.EnumCasePattern: {
        const associatedValues = node.associatedTuple
          ? `(${node.associatedTuple.map((value) => printNode(value)).join(", ")})`
          : "";
        return `.${node.caseName}${associatedValues}`;
      }

      case SwiftNodeKind.EnumDeclaration: {
        const modifiers = node.modifiers?.length
          ? `${node.modifiers.join(" ")} `
          : "";
        const header = printTypeHeader(
          `${modifiers}enum ${node.name}${printGenericParameters(node.genericParameters)}`,
          node.inheritanceClause,
          printWhereClause(node.genericWhereClause),
        );
        return [
          ...printAttributes(node.attributes),
          printMemberBlock(header, node.members),
        ].join("\n");
      }

      case SwiftNodeKind.ExpressionPattern:
        return printNode(node.expression);

      case SwiftNodeKind.ExpressionStatement:
        column = INDENT.length * indentLevel;
        return printLine(printNode(node.expression));

      case SwiftNodeKind.ExtensionDeclaration: {
        const modifiers = node.modifiers?.length
          ? `${node.modifiers.join(" ")} `
          : "";
        const header = printTypeHeader(
          `${modifiers}extension ${printNode(node.extendedType)}`,
          node.inheritanceClause,
          printWhereClause(node.genericWhereClause),
        );
        return [
          ...printAttributes(node.attributes),
          printMemberBlock(header, node.members),
        ].join("\n");
      }

      case SwiftNodeKind.FallthroughStatement:
        return printLine("fallthrough");

      case SwiftNodeKind.FloatLiteral:
        return node.literal;

      case SwiftNodeKind.ForInStatement: {
        const iterator = node.casePattern
          ? `for case ${printNode(node.casePattern)}`
          : `for ${node.pattern}`;
        return printBraceBlock(
          `${iterator} in ${printNode(node.sequence)}`,
          node.body,
        );
      }

      case SwiftNodeKind.FunctionCallExpression: {
        const start = column;
        const member =
          node.calledExpression.kind === SwiftNodeKind.MemberAccessExpression
            ? node.calledExpression
            : undefined;
        let callee = printNode(node.calledExpression);
        // swift-format moves `.member(` to its own line when even the callee overflows.
        if (
          member &&
          maxLineLength > 0 &&
          !callee.includes("\n") &&
          start + callee.length + 1 > maxLineLength
        ) {
          callee = `${printNode(member.base)}\n${INDENT.repeat(indentLevel)}.${member.declName}`;
          memberBreaks += 1;
        }
        const calleeStart = callee.includes("\n")
          ? INDENT.length * indentLevel
          : start;
        const calleeLast = callee.slice(callee.lastIndexOf("\n") + 1);
        const args = node.arguments.map((argument) =>
          argument.label
            ? `${argument.label}: ${printNode(argument.expression)}`
            : printNode(argument.expression),
        );
        const closure = node.trailingClosure
          ? ` ${printNode(node.trailingClosure)}`
          : "";
        const parens =
          args.length || !node.trailingClosure ? `(${args.join(", ")})` : "";
        const inline = `${callee}${parens}${closure}`;
        const firstLine = `${calleeLast}${parens}`.split("\n")[0] ?? "";
        const onlyClosuresSpanLines = node.arguments.every(
          (argument, index) =>
            !args[index]!.includes("\n") ||
            argument.expression.kind === SwiftNodeKind.ClosureExpression,
        );
        if (
          !args.length ||
          maxLineLength <= 0 ||
          (onlyClosuresSpanLines &&
            (calleeStart + firstLine.length < maxLineLength ||
              args.some((arg) => arg.includes("\n"))))
        )
          return inline;
        const indent = INDENT.repeat(indentLevel + 1);
        const width = maxLineLength - indent.length;
        indentLevel += 1;
        const broken = node.arguments.map((argument) => {
          const label = argument.label ? `${argument.label}: ` : "";
          column = indent.length + label.length + 1;
          return `${label}${printNode(argument.expression)}`;
        });
        indentLevel -= 1;
        const lines: Array<string> = [];
        let current = "";
        broken.forEach((arg) => {
          if (arg.includes("\n")) {
            if (current) lines.push(current);
            lines.push(arg);
            current = "";
            return;
          }
          const candidate = current ? `${current}, ${arg}` : arg;
          // Each line ends in `,` or the closing `)`.
          if (current && candidate.length + 1 > width) {
            lines.push(current);
            current = arg;
          } else current = candidate;
        });
        if (current) lines.push(current);
        const lastLine =
          (lines[lines.length - 1] ?? "").split("\n").pop() ?? "";
        const lastWidth =
          lines.length === 1 && !lines[0]!.includes("\n")
            ? width
            : maxLineLength;
        if (lines.length === 1 && lastLine.length + 1 <= lastWidth)
          return `${callee}(\n${indent}${lines[0]})${closure}`;
        return `${callee}(\n${lines.map((line) => `${indent}${line}`).join(",\n")}\n${INDENT.repeat(indentLevel)})${closure}`;
      }

      case SwiftNodeKind.FunctionDeclaration: {
        const modifiers = node.modifiers?.length
          ? `${node.modifiers.join(" ")} `
          : "";
        const effects = [
          node.effectSpecifiers?.async ? "async" : "",
          node.effectSpecifiers?.throws ? "throws" : "",
        ]
          .filter(Boolean)
          .join(" ");
        const effectClause = effects ? ` ${effects}` : "";
        const returnClause = node.returnType
          ? ` -> ${printNode(node.returnType)}`
          : "";
        const head = `${modifiers}func ${node.name}${printGenericParameters(node.genericParameters)}`;
        const whereClause = printWhereClause(node.genericWhereClause);
        let signature = printParameterList(
          node.parameters,
          (list) =>
            `${head}${list}${effectClause}${returnClause}${whereClause}`,
        );
        let ownLineBrace = false;
        const base = INDENT.length * indentLevel;
        if (maxLineLength > 0 && base + head.length + 1 > maxLineLength) {
          indentLevel += 1;
          const named = printParameterList(
            node.parameters,
            (list) =>
              `${node.name}${printGenericParameters(node.genericParameters)}${list}${effectClause}${returnClause}${whereClause}`,
          );
          indentLevel -= 1;
          signature = `${modifiers}func\n${INDENT.repeat(indentLevel + 1)}${named}`;
          ownLineBrace = true;
        }
        if (
          !ownLineBrace &&
          !node.parameters.length &&
          maxLineLength > 0 &&
          base + signature.length + (node.body ? 2 : 0) > maxLineLength
        ) {
          const tuple =
            node.returnType?.kind === SwiftNodeKind.TupleType
              ? printNode(node.returnType).slice(1, -1)
              : undefined;
          const opened = `${head}()${effectClause} -> (`;
          if (node.body && base + signature.length <= maxLineLength)
            ownLineBrace = true;
          else if (tuple !== undefined && base + opened.length <= maxLineLength)
            signature = `${opened}\n${INDENT.repeat(indentLevel + 1)}${tuple}\n${INDENT.repeat(indentLevel)})${whereClause}`;
          else {
            ownLineBrace = Boolean(node.body);
            const result =
              tuple !== undefined
                ? `-> (\n${INDENT.repeat(indentLevel + 2)}${tuple}\n${INDENT.repeat(indentLevel + 1)})`
                : returnClause.trim();
            const effects = `${head}()${effectClause}`;
            signature =
              base + effects.length <= maxLineLength
                ? `${effects}\n${INDENT.repeat(indentLevel + 1)}${result}${whereClause}`
                : `${head}()\n${INDENT.repeat(indentLevel + 1)}${[effectClause.trim(), result].filter(Boolean).join(" ")}${whereClause}`;
          }
        }
        const closing = signature.slice(signature.lastIndexOf("\n") + 1);
        if (
          node.parameters.length &&
          signature.includes("\n") &&
          maxLineLength > 0 &&
          closing.length > maxLineLength &&
          node.returnType?.kind === SwiftNodeKind.TupleType
        )
          signature = `${signature.slice(0, signature.lastIndexOf("\n") + 1)}${INDENT.repeat(indentLevel)})${effectClause} -> (\n${INDENT.repeat(indentLevel + 1)}${printNode(node.returnType).slice(1, -1)}\n${INDENT.repeat(indentLevel)})${whereClause}`;
        if (node.body && !ownLineBrace && maxLineLength > 0) {
          const lastLine = signature.includes("\n")
            ? signature.slice(signature.lastIndexOf("\n") + 1)
            : `${INDENT.repeat(indentLevel)}${signature}`;
          ownLineBrace = lastLine.length + 2 > maxLineLength;
        }
        const declaration = node.body
          ? printBraceBlock(signature, node.body, ownLineBrace)
          : printLine(signature);
        return [...printAttributes(node.attributes), declaration].join("\n");
      }

      case SwiftNodeKind.FunctionType: {
        const parameters = node.parameters
          .map((parameter) => printNode(parameter))
          .join(", ");
        const effects = [
          node.isAsync ? "async" : undefined,
          node.isThrows ? "throws" : undefined,
        ]
          .filter((effect) => effect !== undefined)
          .join(" ");
        const effectClause = effects ? `${effects} ` : "";
        return `(${parameters}) ${effectClause}-> ${printNode(node.returnType)}`;
      }

      case SwiftNodeKind.GuardStatement: {
        const conditions = printConditions(node.conditions, "guard ".length);
        if (!conditions.includes("\n"))
          return printBraceBlock(`guard ${conditions} else`, node.body);
        return printBrokenHeader("guard", node.conditions, "else {", node.body);
      }

      case SwiftNodeKind.Identifier:
        return node.baseName;

      case SwiftNodeKind.IdentifierPattern:
        return node.identifier;

      case SwiftNodeKind.IdentifierType:
        return node.genericArguments && node.genericArguments.length > 0
          ? `${node.name}<${node.genericArguments.map((argument) => printNode(argument)).join(", ")}>`
          : node.name;

      case SwiftNodeKind.IfStatement: {
        const conditions = printConditions(node.conditions, "if ".length);
        if (conditions.includes("\n") && !node.elseBody)
          return printBrokenHeader("if", node.conditions, "{", node.body);
        const header = printLine(`if ${conditions} {`);
        indentLevel += 1;
        const body = node.body.map((statement) => printNode(statement));
        indentLevel -= 1;
        const lines = [header, ...body];
        if (node.elseBody) {
          lines.push(printLine("} else {"));
          indentLevel += 1;
          lines.push(...node.elseBody.map((statement) => printNode(statement)));
          indentLevel -= 1;
        }
        lines.push(printLine("}"));
        return lines.join("\n");
      }

      case SwiftNodeKind.ImplicitlyUnwrappedOptionalType:
        return `${printNode(node.wrappedType)}!`;

      case SwiftNodeKind.ImportDeclaration: {
        const importKind = node.importKindSpecifier
          ? `${node.importKindSpecifier} `
          : "";
        return printLine(`import ${importKind}${node.path}`);
      }

      case SwiftNodeKind.InfixOperatorExpression:
        return `${printNode(node.leftOperand)} ${node.operator} ${printNode(node.rightOperand)}`;

      case SwiftNodeKind.InitializerDeclaration: {
        const modifiers = node.modifiers?.length
          ? `${node.modifiers.join(" ")} `
          : "";
        const failable = node.failable ? "?" : "";
        const effects = [
          node.effectSpecifiers?.async ? " async" : "",
          node.effectSpecifiers?.throws ? " throws" : "",
        ].join("");
        const signature = printParameterList(
          node.parameters,
          (list) =>
            `${modifiers}init${failable}${list}${effects}${printWhereClause(node.genericWhereClause)}`,
        );
        return [
          ...printAttributes(node.attributes),
          printBraceBlock(signature, node.body),
        ].join("\n");
      }

      case SwiftNodeKind.IntegerLiteral:
        return node.literal;

      case SwiftNodeKind.InterpolatedStringLiteral: {
        const body = node.segments
          .map((segment) =>
            "expression" in segment
              ? `\\(${printNode(segment.expression)})`
              : escapeString(segment.content),
          )
          .join("");
        return `"${body}"`;
      }

      case SwiftNodeKind.IsExpression:
        return `${printNode(node.expression)} is ${printNode(node.type)}`;

      case SwiftNodeKind.IsPattern:
        return `is ${printNode(node.type)}`;

      case SwiftNodeKind.KeyPathExpression: {
        const root = node.root ? printNode(node.root) : "";
        const components = node.components
          .map((component) => `.${component}`)
          .join("");
        return `\\${root}${components}`;
      }

      case SwiftNodeKind.LabeledStatement: {
        const statement = printNode(node.statement);
        return statement.replace(/^(\s*)/, `$1${node.label}: `);
      }

      case SwiftNodeKind.MacroDeclaration: {
        const modifiers = node.modifiers?.length
          ? `${node.modifiers.join(" ")} `
          : "";
        const parameters = node.parameters
          .map((parameter) => printParameter(parameter))
          .join(", ");
        const returnClause = node.returnType
          ? ` -> ${printNode(node.returnType)}`
          : "";
        const definition = node.definition ? ` = ${node.definition}` : "";
        const signature = `${modifiers}macro ${node.name}(${parameters})${returnClause}${definition}`;
        return [...printAttributes(node.attributes), printLine(signature)].join(
          "\n",
        );
      }

      case SwiftNodeKind.MacroExpansionExpression: {
        if (node.arguments === undefined) return `#${node.macroName}`;
        const args = node.arguments
          .map((argument) =>
            argument.label
              ? `${argument.label}: ${printNode(argument.expression)}`
              : printNode(argument.expression),
          )
          .join(", ");
        return `#${node.macroName}(${args})`;
      }

      case SwiftNodeKind.MemberAccessExpression:
        return `${printNode(node.base)}.${node.declName}`;

      case SwiftNodeKind.MemberType:
        return `${printNode(node.baseType)}.${node.name}`;

      case SwiftNodeKind.MetatypeType:
        return `${printNode(node.baseType)}.${node.metatypeSpecifier}`;

      case SwiftNodeKind.MultilineStringLiteral: {
        indentLevel += 1;
        const lines = node.lines.map((line) => printLine(line));
        const closingDelimiter = printLine('"""');
        indentLevel -= 1;
        return ['"""', ...lines, closingDelimiter].join("\n");
      }

      case SwiftNodeKind.NilLiteral:
        return "nil";

      case SwiftNodeKind.OperatorDeclaration: {
        const precedenceGroup = node.precedenceGroup
          ? ` : ${node.precedenceGroup}`
          : "";
        return printLine(
          `${node.fixitySpecifier} operator ${node.name}${precedenceGroup}`,
        );
      }

      case SwiftNodeKind.OptionalPattern:
        return `${printNode(node.subPattern)}?`;

      case SwiftNodeKind.OptionalType: {
        const wrapped = printNode(node.wrappedType);
        return node.wrappedType.kind === SwiftNodeKind.FunctionType
          ? `(${wrapped})?`
          : `${wrapped}?`;
      }

      case SwiftNodeKind.PackElementType:
        return `each ${printNode(node.pack)}`;

      case SwiftNodeKind.PackExpansionType:
        return `repeat ${printNode(node.repetitionPattern)}`;

      case SwiftNodeKind.PostfixOperatorExpression:
        return `${printNode(node.expression)}${node.operator}`;

      case SwiftNodeKind.PrecedenceGroupDeclaration: {
        const header = printLine(`precedencegroup ${node.name} {`);
        indentLevel += 1;
        const attributes: Array<string> = [];
        if (node.associativity)
          attributes.push(printLine(`associativity: ${node.associativity}`));
        if (node.higherThan?.length)
          attributes.push(
            printLine(`higherThan: ${node.higherThan.join(", ")}`),
          );
        if (node.lowerThan?.length)
          attributes.push(printLine(`lowerThan: ${node.lowerThan.join(", ")}`));
        if (node.assignment !== undefined)
          attributes.push(printLine(`assignment: ${node.assignment}`));
        indentLevel -= 1;
        return [header, ...attributes, printLine("}")].join("\n");
      }

      case SwiftNodeKind.PrefixOperatorExpression:
        return `${node.operator}${printNode(node.expression)}`;

      case SwiftNodeKind.ProtocolDeclaration: {
        const modifiers = node.modifiers?.length
          ? `${node.modifiers.join(" ")} `
          : "";
        const header = printTypeHeader(
          `${modifiers}protocol ${node.name}`,
          node.inheritanceClause,
          printWhereClause(node.genericWhereClause),
        );
        return [
          ...printAttributes(node.attributes),
          printMemberBlock(header, node.members),
        ].join("\n");
      }

      case SwiftNodeKind.RangeExpression: {
        const start = node.start ? printNode(node.start) : "";
        const end = node.end ? printNode(node.end) : "";
        return `${start}${node.operator}${end}`;
      }

      case SwiftNodeKind.RegexLiteral:
        return `/${node.regex}/`;

      case SwiftNodeKind.RepeatWhileStatement: {
        const headerLine = printLine("repeat {");
        indentLevel += 1;
        const body = node.body.map((statement) => printNode(statement));
        indentLevel -= 1;
        return [
          headerLine,
          ...body,
          printLine(`} while ${printNode(node.condition)}`),
        ].join("\n");
      }

      case SwiftNodeKind.ReturnStatement: {
        if (!node.expression) return printLine("return");
        column = INDENT.length * indentLevel + "return ".length;
        const breaksBefore = memberBreaks;
        const line = printLine(`return ${printNode(node.expression)}`);
        const first = line.split("\n")[0] ?? "";
        if (
          maxLineLength <= 0 ||
          (first.length <= maxLineLength && memberBreaks === breaksBefore)
        )
          return line;
        indentLevel += 1;
        column = INDENT.length * indentLevel;
        const broken = printLine(printNode(node.expression));
        indentLevel -= 1;
        return `${printLine("return")}\n${broken}`;
      }

      case SwiftNodeKind.SelectorExpression:
        return `#selector(${printNode(node.target)})`;

      case SwiftNodeKind.SelfExpression:
        return "self";

      case SwiftNodeKind.ImplicitMemberExpression:
        return `.${node.name}`;

      case SwiftNodeKind.TypeExpression:
        return printNode(node.type);

      case SwiftNodeKind.SomeOrAnyType:
        return `${node.someOrAnySpecifier} ${printNode(node.constraint)}`;

      case SwiftNodeKind.SourceFile: {
        const parts: Array<string> = [];
        node.statements.forEach((statement, index) => {
          const previous = node.statements[index - 1];
          if (
            previous?.kind === SwiftNodeKind.ImportDeclaration &&
            statement.kind !== SwiftNodeKind.ImportDeclaration
          ) {
            parts.push("");
          }
          parts.push(printNode(statement));
        });
        return parts.join("\n");
      }

      case SwiftNodeKind.StringLiteral:
        return `"${escapeString(node.literal)}"`;

      case SwiftNodeKind.StructDeclaration: {
        const modifiers = node.modifiers?.length
          ? `${node.modifiers.join(" ")} `
          : "";
        const header = printTypeHeader(
          `${modifiers}struct ${node.name}${printGenericParameters(node.genericParameters)}`,
          node.inheritanceClause,
          printWhereClause(node.genericWhereClause),
        );
        return [
          ...printAttributes(node.attributes),
          printMemberBlock(header, node.members),
        ].join("\n");
      }

      case SwiftNodeKind.SubscriptDeclaration: {
        const modifiers = node.modifiers?.length
          ? `${node.modifiers.join(" ")} `
          : "";
        const parameters = node.parameters
          .map((parameter) => printParameter(parameter))
          .join(", ");
        const header = printLine(
          `${modifiers}subscript${printGenericParameters(node.genericParameters)}(${parameters}) -> ${printNode(node.returnType)}${printWhereClause(node.genericWhereClause)} {`,
        );
        indentLevel += 1;
        const accessors = printNode(node.accessorBlock);
        indentLevel -= 1;
        return [
          ...printAttributes(node.attributes),
          header,
          accessors,
          printLine("}"),
        ].join("\n");
      }

      case SwiftNodeKind.SubscriptExpression:
        return `${printNode(node.calledExpression)}[${node.arguments.map((argument) => printNode(argument)).join(", ")}]`;

      case SwiftNodeKind.SuperExpression:
        return "super";

      case SwiftNodeKind.SwitchStatement: {
        const header = printLine(`switch ${printNode(node.subject)} {`);
        const cases = node.cases.map((switchCase) => {
          const labelLine = printLine(
            switchCase.caseItems
              ? `case ${switchCase.caseItems.map((item) => printNode(item)).join(", ")}:`
              : "default:",
          );
          indentLevel += 1;
          const statements = switchCase.statements.map((statement) =>
            printNode(statement),
          );
          indentLevel -= 1;
          return [labelLine, ...statements].join("\n");
        });
        return [header, ...cases, printLine("}")].join("\n");
      }

      case SwiftNodeKind.TernaryExpression:
        return `${printNode(node.condition)} ? ${printNode(node.thenExpression)} : ${printNode(node.elseExpression)}`;

      case SwiftNodeKind.ThrowStatement:
        return printLine(`throw ${printNode(node.expression)}`);

      case SwiftNodeKind.TryExpression:
        column += `try${node.questionOrExclamationMark ?? ""} `.length;
        return `try${node.questionOrExclamationMark ?? ""} ${printNode(node.expression)}`;

      case SwiftNodeKind.TupleExpression: {
        const elements = node.elements
          .map((element) =>
            element.label
              ? `${element.label}: ${printNode(element.expression)}`
              : printNode(element.expression),
          )
          .join(", ");
        return `(${elements})`;
      }

      case SwiftNodeKind.TuplePattern:
        return `(${node.elements.map((element) => printNode(element)).join(", ")})`;

      case SwiftNodeKind.TupleType: {
        const elements = node.elements
          .map((element) => {
            const label = element.firstName ? `${element.firstName}: ` : "";
            return `${label}${printNode(element.type)}`;
          })
          .join(", ");
        return `(${elements})`;
      }

      case SwiftNodeKind.TypeAliasDeclaration: {
        const modifiers = node.modifiers?.length
          ? `${node.modifiers.join(" ")} `
          : "";
        const head = `${modifiers}typealias ${node.name}${printGenericParameters(node.genericParameters)} =`;
        const type = `${printNode(node.type)}${printWhereClause(node.genericWhereClause)}`;
        const line = printLine(`${head} ${type}`);
        return [
          ...printAttributes(node.attributes),
          maxLineLength > 0 && line.length > maxLineLength
            ? `${printLine(head)}\n${INDENT.repeat(indentLevel + 1)}${type}`
            : line,
        ].join("\n");
      }

      case SwiftNodeKind.ValueBindingPattern:
        return `${node.bindingSpecifier} ${printNode(node.pattern)}`;

      case SwiftNodeKind.VariableDeclaration: {
        const attributes = printAttributes(node.attributes);
        const modifiers = node.modifiers?.length
          ? `${node.modifiers.join(" ")} `
          : "";
        const [firstBinding] = node.bindings;
        if (node.bindings.length === 1 && firstBinding?.accessorBlock) {
          const type = firstBinding.typeAnnotation
            ? `: ${printNode(firstBinding.typeAnnotation)}`
            : "";
          const value = firstBinding.initializer
            ? ` = ${printNode(firstBinding.initializer)}`
            : "";
          const header = printLine(
            `${modifiers}${node.bindingSpecifier} ${firstBinding.pattern}${type}${value} {`,
          );
          indentLevel += 1;
          const accessors = printNode(firstBinding.accessorBlock);
          indentLevel -= 1;
          return [...attributes, header, accessors, printLine("}")].join("\n");
        }
        const bindings = node.bindings
          .map((binding) => {
            const type = binding.typeAnnotation
              ? `: ${printNode(binding.typeAnnotation)}`
              : "";
            if (
              !binding.initializer &&
              binding.typeAnnotation &&
              node.bindings.length === 1 &&
              maxLineLength > 0 &&
              INDENT.length * indentLevel +
                `${modifiers}${node.bindingSpecifier} ${binding.pattern}${type}`
                  .length >
                maxLineLength
            )
              return `${binding.pattern}:\n${INDENT.repeat(indentLevel + 1)}${printNode(binding.typeAnnotation)}`;
            column =
              INDENT.length * indentLevel +
              `${modifiers}${node.bindingSpecifier} ${binding.pattern}${type} = `
                .length;
            const start = column;
            const initializer = binding.initializer
              ? printNode(binding.initializer)
              : undefined;
            const value =
              initializer === undefined
                ? ""
                : maxLineLength > 0 &&
                    !initializer.includes("\n") &&
                    start + initializer.length > maxLineLength
                  ? ` =\n${INDENT.repeat(indentLevel + 1)}${initializer}`
                  : ` = ${initializer}`;
            return `${binding.pattern}${type}${value}`;
          })
          .join(", ");
        return [
          ...attributes,
          printLine(`${modifiers}${node.bindingSpecifier} ${bindings}`),
        ].join("\n");
      }

      case SwiftNodeKind.WhileStatement: {
        const conditions = node.conditions
          .map((condition) => printCondition(condition))
          .join(", ");
        return printBraceBlock(`while ${conditions}`, node.body);
      }

      case SwiftNodeKind.WildcardPattern:
        return "_";
    }
  }

  function printFile(node: SwiftNode): string {
    const parts: Array<string> = [printNode(node), ""];
    return parts.join("\n");
  }

  return {
    printFile,
  };
}

export function printAst(node: SwiftNode): string {
  return JSON.stringify(node, null, 2);
}
