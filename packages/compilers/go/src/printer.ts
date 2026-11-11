import type { GoNode } from "./nodes/base.js";
import type { GoTypeParameter } from "./nodes/declarations/type-parameter.js";
import type { GoTypeSpec } from "./nodes/declarations/type-spec.js";
import type { GoExpression } from "./nodes/expression.js";
import { GoNodeKind } from "./nodes/kinds.js";
import type { GoType } from "./nodes/type.js";
import type { GoFunctionReturn } from "./nodes/types/function-return.js";

export interface GoPrinterOptions {
  /**
   * Maximum line length before the printer wraps elements
   * such as parameters, fields, or list items.
   * Set to `0` to disable wrapping.
   *
   * @default 80
   */
  maxLineLength?: number;
}

interface PrintContext {
  inline?: boolean;
  parentPrecedence?: number;
}

const GROUPABLE_KINDS = new Set([
  GoNodeKind.TypeDeclaration,
  GoNodeKind.VariableStatement,
]);

const INDENT_SIZE = 1;

/* eslint-disable sort-keys-fix/sort-keys-fix */
// oxfmt-ignore
const OPERATOR_PRECEDENCE: Record<string, number> = {
  "||": 1,
  "&&": 2,
  "==": 3,
  "!=": 3,
  "<": 3,
  "<=": 3,
  ">": 3,
  ">=": 3,
  "+": 4,
  "-": 4,
  "|": 4,
  "^": 4,
  "*": 5,
  "/": 5,
  "%": 5,
  "<<": 5,
  ">>": 5,
  "&": 5,
  "&^": 5,
};
/* eslint-enable sort-keys-fix/sort-keys-fix */

/* eslint-disable sort-keys-fix/sort-keys-fix */
const GO_STRING_ESCAPES: Record<string, string> = {
  "\\": "\\\\",
  '"': '\\"',
  "\n": "\\n",
  "\r": "\\r",
  "\t": "\\t",
};
/* eslint-enable sort-keys-fix/sort-keys-fix */

function escapeString(value: string): string {
  return value.replace(
    /[\\"\n\r\t]/g,
    (char) => GO_STRING_ESCAPES[char] ?? char,
  );
}

function alignCells(rows: ReadonlyArray<ReadonlyArray<string>>): Array<string> {
  const columnCount = Math.max(0, ...rows.map((row) => row.length));
  const padded = rows.map((row) => [...row]);

  for (let col = 0; col < columnCount; col++) {
    let start = 0;
    while (start < padded.length) {
      const startRow = padded[start];
      if (!startRow || startRow.length <= col + 1) {
        start += 1;
        continue;
      }
      let end = start;
      while (end < padded.length && (padded[end]?.length ?? 0) > col + 1)
        end += 1;
      const width = Math.max(
        ...padded.slice(start, end).map((row) => row[col]?.length ?? 0),
      );
      for (let i = start; i < end; i++) {
        const row = padded[i];
        const cell = row?.[col];
        if (row && cell !== undefined) row[col] = cell.padEnd(width);
      }
      start = end;
    }
  }

  return padded.map((row) => row.join(" "));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createPrinter(options?: GoPrinterOptions) {
  let indentLevel = 0;

  function printComments(
    parts: Array<string>,
    lines: ReadonlyArray<string>,
    indent?: boolean,
  ): void {
    if (indent) indentLevel += 1;
    parts.push(...lines.map((line) => printLine(`// ${line}`)));
    if (indent) indentLevel -= 1;
  }

  function printLine(line: string): string {
    return "\t".repeat(indentLevel * INDENT_SIZE) + line;
  }

  function printReturnType(
    returnType: ReadonlyArray<GoFunctionReturn>,
  ): string {
    if (!returnType.length) return "";
    const rendered = returnType.map((rt) => printNode(rt)).join(", ");
    const useBrackets =
      returnType.length > 1 || returnType.some((rt) => rt.name);
    return useBrackets ? ` (${rendered})` : ` ${rendered}`;
  }

  function printTypeAssert(operand: GoNode, type?: GoNode): string {
    const target = type ? printInline(type) : "type";
    return `${printInline(operand)}.(${target})`;
  }

  function printTypeParameters(
    typeParameters: ReadonlyArray<GoTypeParameter> | undefined,
  ): string {
    if (!typeParameters?.length) return "";
    const list = typeParameters
      .map((tp) => `${tp.names.join(", ")} ${printInline(tp.constraint)}`)
      .join(", ");
    return `[${list}]`;
  }

  function printDeclarationGroup(
    keyword: string,
    rows: ReadonlyArray<ReadonlyArray<string>>,
  ): Array<string> {
    if (!rows.length) return [printLine(`${keyword} ()`)];

    const [firstRow] = rows;
    if (rows.length === 1 && firstRow) {
      return [printLine(`${keyword} ${firstRow.join(" ")}`)];
    }

    const lines = [printLine(`${keyword} (`)];
    indentLevel += 1;
    lines.push(...alignCells(rows).map((line) => printLine(line)));
    indentLevel -= 1;
    lines.push(printLine(")"));
    return lines;
  }

  function variableDeclarationCells(declaration: {
    initializer?: GoExpression;
    name: string;
    type?: GoType;
  }): Array<string> {
    const cells = [declaration.name];
    if (declaration.type) cells.push(printInline(declaration.type));
    if (declaration.initializer)
      cells.push(`= ${printInline(declaration.initializer)}`);
    return cells;
  }

  function typeSpecCells(spec: GoTypeSpec): Array<string> {
    const cells = [`${spec.name}${printTypeParameters(spec.typeParameters)}`];
    if (spec.isAlias) cells.push("=");
    cells.push(printInline(spec.type));
    return cells;
  }

  function printInline(node: GoNode, context: PrintContext = {}): string {
    return printNode(node, { ...context, inline: true });
  }

  function printNode(node: GoNode, context: PrintContext = {}): string {
    const parts: Array<string> = [];

    if (node.leadingComments) {
      printComments(parts, node.leadingComments);
    }

    switch (node.kind) {
      case GoNodeKind.ArrayType: {
        let sizePrefix = "[]";
        if (node.size === "...") {
          sizePrefix = "[...]";
        } else if (node.size !== undefined) {
          sizePrefix = `[${printInline(node.size)}]`;
        }
        const text = `${sizePrefix}${printInline(node.elementType)}`;
        parts.push(text);
        break;
      }

      case GoNodeKind.Assignment: {
        const targets = node.targets
          .map((target) => printInline(target))
          .join(", ");
        const values = node.values
          .map((value) => printInline(value))
          .join(", ");
        const assignmentText = `${targets} = ${values}`;
        parts.push(context.inline ? assignmentText : printLine(assignmentText));
        break;
      }

      case GoNodeKind.AugmentAssignment: {
        const assignmentText = `${printNode(node.target)} ${node.operator} ${printInline(node.value)}`;
        parts.push(context.inline ? assignmentText : printLine(assignmentText));
        break;
      }

      case GoNodeKind.BinaryExpression: {
        const precedence = OPERATOR_PRECEDENCE[node.operator] ?? 0;
        const left = printInline(node.left, { parentPrecedence: precedence });
        const right = printInline(node.right, { parentPrecedence: precedence });
        const tight =
          context.parentPrecedence !== undefined &&
          precedence > context.parentPrecedence;
        const expr = tight
          ? `${left}${node.operator}${right}`
          : `${left} ${node.operator} ${right}`;
        parts.push(expr);
        break;
      }

      case GoNodeKind.Block:
        if (!node.statements.length) {
          parts.push("{}");
        } else {
          parts.push(context.inline ? "{" : printLine("{"));
          indentLevel += 1;
          parts.push(...node.statements.map((stmt) => printNode(stmt)));
          indentLevel -= 1;
          parts.push(printLine("}"));
        }
        break;

      case GoNodeKind.BreakStatement:
        parts.push(printLine(`break${node.label ? ` ${node.label}` : ""}`));
        break;

      case GoNodeKind.CallExpression: {
        const args = node.args.map((arg: GoNode, index: number) => {
          const base = printInline(arg);
          if (node.spreadLastArg && index === node.args.length - 1) {
            return `${base}...`;
          }
          return base;
        });
        const text = `${printNode(node.callee)}(${args.join(", ")})`;
        parts.push(context.inline ? text : printLine(text));
        break;
      }

      case GoNodeKind.ChannelType: {
        const lead = node.direction === "receive" ? "<-" : "";
        const trail = node.direction === "send" ? "<-" : "";
        parts.push(`${lead}chan${trail} ${printInline(node.elementType)}`);
        break;
      }

      case GoNodeKind.Comment:
        parts.push(printLine(`// ${node.text}`));
        break;

      case GoNodeKind.CompositeLiteral: {
        const typeText = node.type ? printNode(node.type) : "";
        const elementsText = node.elements
          .map((el) => printInline(el))
          .join(", ");
        const text = `${typeText}{${elementsText}}`;
        parts.push(text);
        break;
      }

      case GoNodeKind.ContinueStatement:
        parts.push(printLine(`continue${node.label ? ` ${node.label}` : ""}`));
        break;

      case GoNodeKind.DeferStatement: {
        const text = `defer ${printInline(node.call)}`;
        parts.push(printLine(text));
        break;
      }

      case GoNodeKind.EmptyStatement:
        parts.push("");
        break;

      case GoNodeKind.ExpressionStatement: {
        const text = `${printInline(node.expression)}`;
        parts.push(printLine(text));
        break;
      }

      case GoNodeKind.FallthroughStatement:
        parts.push(printLine("fallthrough"));
        break;

      case GoNodeKind.ForRangeStatement: {
        const names = node.targets?.join(", ");
        const assignOp = node.useShortVar ? ":=" : "=";
        const iterText = `range ${printInline(node.iterable)}`;
        const header = names
          ? `for ${names} ${assignOp} ${iterText}`
          : `for ${iterText}`;
        const body = printInline(node.body);
        parts.push(printLine(`${header} ${body}`));
        break;
      }

      case GoNodeKind.ForStatement: {
        const init = node.init ? `${printInline(node.init)}` : "";
        const condition = node.condition
          ? `${printInline(node.condition)}`
          : "";
        const post = node.post ? `${printInline(node.post)}` : "";
        const body = printInline(node.body);
        const joined = [init, condition, post].filter(Boolean).join("; ");
        const forLine = `for ${joined.length ? `${joined} ` : ""}`;
        parts.push(printLine(`${forLine}${body}`));
        break;
      }

      case GoNodeKind.FunctionDeclaration: {
        const parameters = node.parameters
          .map((parameter) => printNode(parameter))
          .join(", ");
        const finalReturnType = printReturnType(node.returnType);
        const receiver = node.receiver
          ? `(${node.receiver.name} ${printInline(node.receiver.type)})`
          : "";
        const typeParams = printTypeParameters(node.typeParameters);
        const signature = `func${receiver ? ` ${receiver}` : ""} ${node.name}${typeParams}(${parameters})${finalReturnType}`;
        const blockOutput = printInline(node.body);
        parts.push(
          context.inline
            ? [signature, blockOutput].join(" ")
            : printLine([signature, blockOutput].join(" ")),
        );
        break;
      }

      case GoNodeKind.FunctionLiteral: {
        const parameters = node.parameters
          .map((parameter) => printNode(parameter))
          .join(", ");
        const returnType = node.returnType
          .map((parameter) => printNode(parameter))
          .join(", ");
        const useReturnTypeBrackets =
          node.returnType.length > 1 || node.returnType.some((rt) => rt.name);
        const finalReturnType = useReturnTypeBrackets
          ? ` (${returnType})`
          : returnType
            ? ` ${returnType}`
            : "";
        const signature = `func(${parameters})${finalReturnType}`;
        const blockOutput = printInline(node.body);
        parts.push(
          context.inline
            ? [signature, blockOutput].join(" ")
            : printLine([signature, blockOutput].join(" ")),
        );
        break;
      }

      case GoNodeKind.FunctionParameter: {
        const variadic = node.isVariadic ? "..." : "";
        parts.push(
          `${node.names.join(", ")} ${variadic}${printInline(node.type)}`,
        );
        break;
      }

      case GoNodeKind.FunctionReturn: {
        const name = node.name ? `${node.name} ` : "";
        parts.push(`${name}${printInline(node.type)}`);
        break;
      }

      case GoNodeKind.FunctionType: {
        const parameters = node.parameters
          .map((parameter) => printInline(parameter))
          .join(", ");
        const finalReturnType = printReturnType(node.returnType);
        parts.push(`func(${parameters})${finalReturnType}`);
        break;
      }

      case GoNodeKind.GenericType: {
        const typeArguments = node.typeArguments
          .map((typeArgument) => printInline(typeArgument))
          .join(", ");
        parts.push(`${printInline(node.type)}[${typeArguments}]`);
        break;
      }

      case GoNodeKind.GoStatement: {
        const text = `go ${printInline(node.expression)}`;
        parts.push(printLine(text));
        break;
      }

      case GoNodeKind.GotoStatement:
        parts.push(printLine(`goto ${node.label}`));
        break;

      case GoNodeKind.Identifier:
        parts.push(node.name);
        break;

      case GoNodeKind.IfStatement: {
        const initStatement = node.initStatement
          ? `${printInline(node.initStatement)}; `
          : "";
        const ifLine = `if ${initStatement}${printInline(node.condition)}`;
        const thenBlock = printInline(node.thenBlock);
        let elseBlock = "";
        if (node.elseBlock) {
          elseBlock = ` else ${printInline(node.elseBlock)}`;
        }
        const text = `${ifLine} ${thenBlock}${elseBlock}`;
        parts.push(context.inline ? text : printLine(text));
        break;
      }

      case GoNodeKind.ImportStatement: {
        const specs = node.paths.map((imp) =>
          imp.alias ? `${imp.alias} "${imp.path}"` : `"${imp.path}"`,
        );

        if (specs.length === 1) {
          parts.push(printLine(`import ${specs[0]}`));
          break;
        }

        parts.push(printLine("import ("));
        indentLevel += 1;
        parts.push(...specs.map((spec) => printLine(spec)));
        indentLevel -= 1;
        parts.push(printLine(")"));
        break;
      }

      case GoNodeKind.IncDecStatement: {
        const incDecText = `${printNode(node.target)}${node.operator}`;
        parts.push(context.inline ? incDecText : printLine(incDecText));
        break;
      }

      case GoNodeKind.IndexExpression:
        parts.push(`${printInline(node.object)}[${printInline(node.index)}]`);
        break;

      case GoNodeKind.InterfaceType: {
        if (!node.fields.length) {
          parts.push("interface{}");
          break;
        }

        parts.push("interface {");
        indentLevel += 1;
        for (const field of node.fields) {
          if ("embed" in field) {
            parts.push(printLine(printInline(field.embed)));
          } else {
            const parameters = field.parameters
              .map((parameter) => printNode(parameter))
              .join(", ");
            const finalReturnType = printReturnType(field.returnType);
            parts.push(
              printLine(`${field.name}(${parameters})${finalReturnType}`),
            );
          }
        }
        indentLevel -= 1;
        parts.push(printLine("}"));
        break;
      }

      case GoNodeKind.KeyValueExpression:
        parts.push(`${printInline(node.key)}: ${printInline(node.value)}`);
        break;

      case GoNodeKind.LabeledStatement: {
        const labelIndent = "\t".repeat(Math.max(0, indentLevel - 1));
        parts.push(`${labelIndent}${node.label}:`);
        parts.push(printNode(node.statement));
        break;
      }

      case GoNodeKind.Literal:
        if (node.literalKind === "nil") {
          parts.push("nil");
        } else if (node.literalKind === "rawString") {
          parts.push(`\`${node.value}\``);
        } else if (node.literalKind === "rune") {
          parts.push(`'${node.value}'`);
        } else if (node.literalKind === "string") {
          parts.push(`"${escapeString(node.value)}"`);
        } else {
          parts.push(node.value);
        }
        break;

      case GoNodeKind.MapType: {
        const text = `map[${printInline(node.keyType)}]${printInline(node.valueType)}`;
        parts.push(text);
        break;
      }

      case GoNodeKind.MemberExpression:
        parts.push(`${printInline(node.object)}.${printInline(node.member)}`);
        break;

      case GoNodeKind.PackageDeclaration:
        parts.push(printLine(`package ${node.name}`));
        break;

      case GoNodeKind.ParenthesizedExpression:
        parts.push(`(${printInline(node.expression)})`);
        break;

      case GoNodeKind.PointerType:
        parts.push(`*${printInline(node.elementType)}`);
        break;

      case GoNodeKind.ReturnStatement: {
        const values = node.expressions
          .map((expr) => printInline(expr))
          .join(", ");
        parts.push(printLine(`return${values ? ` ${values}` : ""}`));
        break;
      }

      case GoNodeKind.SelectStatement: {
        parts.push(printLine("select {"));
        for (const selectCase of node.cases) {
          const clause = selectCase.communication
            ? `case ${printInline(selectCase.communication)}`
            : "default";
          parts.push(printLine(`${clause}:`));
          if (selectCase.body.statements.length) {
            indentLevel += 1;
            parts.push(
              ...selectCase.body.statements.map((stmt) => printNode(stmt)),
            );
            indentLevel -= 1;
          }
        }
        parts.push(printLine("}"));
        break;
      }

      case GoNodeKind.SendStatement: {
        const text = `${printInline(node.channel)} <- ${printInline(node.value)}`;
        parts.push(context.inline ? text : printLine(text));
        break;
      }

      case GoNodeKind.ShortVarDeclaration: {
        const names = node.names.join(", ");
        const values = node.values
          .map((value) => printInline(value))
          .join(", ");
        const shortVarText = `${names} := ${values}`;
        parts.push(context.inline ? shortVarText : printLine(shortVarText));
        break;
      }

      case GoNodeKind.SliceExpression: {
        const low = node.low ? printInline(node.low) : "";
        const high = node.high ? printInline(node.high) : "";
        if (node.max) {
          const max = printInline(node.max);
          parts.push(`${printInline(node.object)}[${low}:${high}:${max}]`);
        } else {
          parts.push(`${printInline(node.object)}[${low}:${high}]`);
        }
        break;
      }

      case GoNodeKind.SourceFile: {
        parts.push(printNode(node.packageDeclaration));
        parts.push("");

        node.statements.forEach((curr, i) => {
          const prev = node.statements[i - 1];
          const grouped =
            prev !== undefined &&
            prev.kind === curr.kind &&
            GROUPABLE_KINDS.has(curr.kind);
          if (i > 0 && !grouped) parts.push("");
          parts.push(printNode(curr));
        });
        break;
      }

      case GoNodeKind.StructType: {
        if (!node.fields.length) {
          parts.push("struct{}");
          break;
        }

        parts.push("struct {");
        indentLevel += 1;

        const rows = node.fields.map((field) => ({
          name: field.names?.join(", ") ?? "",
          tag: field.tag ? `\`${field.tag}\`` : "",
          type: printNode(field.type),
        }));

        const nameWidth = Math.max(0, ...rows.map((row) => row.name.length));
        const alignedFlat = alignCells(
          rows
            .filter((row) => !row.type.includes("\n"))
            .map((row) => (row.tag ? [row.type, row.tag] : [row.type])),
        );

        let flatIndex = 0;
        for (const row of rows) {
          const prefix = row.name ? row.name.padEnd(nameWidth + 1) : "";

          if (!row.type.includes("\n")) {
            parts.push(printLine(`${prefix}${alignedFlat[flatIndex] ?? ""}`));
            flatIndex += 1;
          } else {
            const lines = row.type.split("\n");
            parts.push(printLine(`${prefix}${lines[0] ?? ""}`));
            parts.push(...lines.slice(1, -1));
            const last = lines.at(-1) ?? "";
            parts.push(row.tag ? `${last} ${row.tag}` : last);
          }
        }

        indentLevel -= 1;
        parts.push(printLine("}"));
        break;
      }

      case GoNodeKind.SwitchStatement: {
        const init = node.initStatement
          ? `${printInline(node.initStatement)}; `
          : "";

        let content = "";
        if (node.typeGuard) {
          const left = node.typeGuard.assignTo
            ? `${node.typeGuard.assignTo} := `
            : "";
          content = `${init}${left}${printTypeAssert(node.typeGuard.subject)}`;
        } else if (node.tag) {
          content = `${init}${printInline(node.tag)}`;
        } else {
          content = `${init}`.trimEnd();
        }

        const header = content ? `switch ${content}` : "switch";
        parts.push(printLine(`${header} {`));
        for (const switchCase of node.cases) {
          const clause =
            switchCase.expressions && switchCase.expressions.length
              ? `case ${switchCase.expressions.map((e) => printInline(e)).join(", ")}`
              : "default";
          parts.push(printLine(`${clause}:`));
          if (switchCase.body.statements.length) {
            indentLevel += 1;
            parts.push(
              ...switchCase.body.statements.map((stmt) => printNode(stmt)),
            );
            indentLevel -= 1;
          }
        }
        parts.push(printLine("}"));
        break;
      }

      case GoNodeKind.TypeAssertExpression:
        parts.push(printTypeAssert(node.operand, node.type));
        break;

      case GoNodeKind.TypeDeclaration:
        parts.push(
          ...printDeclarationGroup("type", node.specs.map(typeSpecCells)),
        );
        break;

      case GoNodeKind.TypeSet:
        parts.push(
          node.terms
            .map(
              (term) =>
                `${term.approximate ? "~" : ""}${printInline(term.type)}`,
            )
            .join(" | "),
        );
        break;

      case GoNodeKind.TypeSpec:
        parts.push(typeSpecCells(node).join(" "));
        break;

      case GoNodeKind.UnaryExpression:
        parts.push(`${node.operator}${printInline(node.operand)}`);
        break;

      case GoNodeKind.VariableDeclaration:
        parts.push(variableDeclarationCells(node).join(" "));
        break;

      case GoNodeKind.VariableDeclarationList:
        parts.push(
          ...printDeclarationGroup(
            node.flags,
            node.declarations.map(variableDeclarationCells),
          ),
        );
        break;

      case GoNodeKind.VariableStatement:
        parts.push(printNode(node.declarationList));
        break;

      default:
        // @ts-expect-error
        throw new Error(`Unsupported node kind: ${node.kind}`);
    }

    if (node.trailingComments) {
      if (!context.inline) {
        parts.push("");
      }
      printComments(parts, node.trailingComments, false);
    }

    return parts.join("\n");
  }

  function printFile(node: GoNode): string {
    const parts: Array<string> = [printNode(node), ""];
    return parts.join("\n");
  }

  return {
    printFile,
  };
}

export function printAst(node: GoNode): string {
  return JSON.stringify(node, null, 2);
}
