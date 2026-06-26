import type { GoNode } from './nodes/base';
import type { GoTypeParameter } from './nodes/declarations/type-parameter';
import { GoNodeKind } from './nodes/kinds';
import type { GoFunctionReturn } from './nodes/types/function-return';

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
  GoNodeKind.ConstDeclaration,
  GoNodeKind.TypeDeclaration,
  GoNodeKind.VarDeclaration,
]);

const INDENT_SIZE = 1;

/* eslint-disable sort-keys-fix/sort-keys-fix */
// oxfmt-ignore
const OPERATOR_PRECEDENCE: Record<string, number> = {
  '||': 1,
  '&&': 2,
  '==': 3, '!=': 3, '<': 3, '<=': 3, '>': 3, '>=': 3,
  '+': 4, '-': 4, '|': 4, '^': 4,
  '*': 5, '/': 5, '%': 5, '<<': 5, '>>': 5, '&': 5, '&^': 5,
};
/* eslint-enable sort-keys-fix/sort-keys-fix */

/* eslint-disable sort-keys-fix/sort-keys-fix */
const GO_STRING_ESCAPES: Record<string, string> = {
  '\\': '\\\\',
  '"': '\\"',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
};
/* eslint-enable sort-keys-fix/sort-keys-fix */

function escapeString(value: string): string {
  return value.replace(/[\\"\n\r\t]/g, (char) => GO_STRING_ESCAPES[char] ?? char);
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
      while (end < padded.length && (padded[end]?.length ?? 0) > col + 1) end += 1;
      const width = Math.max(...padded.slice(start, end).map((row) => row[col]?.length ?? 0));
      for (let i = start; i < end; i++) {
        const row = padded[i];
        const cell = row?.[col];
        if (row && cell !== undefined) row[col] = cell.padEnd(width);
      }
      start = end;
    }
  }

  return padded.map((row) => row.join(' '));
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
    return '\t'.repeat(indentLevel * INDENT_SIZE) + line;
  }

  function printReturnType(returnType: ReadonlyArray<GoFunctionReturn>): string {
    if (!returnType.length) return '';
    const rendered = returnType.map((rt) => printNode(rt)).join(', ');
    const useBrackets = returnType.length > 1 || returnType.some((rt) => rt.name);
    return useBrackets ? ` (${rendered})` : ` ${rendered}`;
  }

  function printTypeParameters(typeParameters: ReadonlyArray<GoTypeParameter> | undefined): string {
    if (!typeParameters?.length) return '';
    const list = typeParameters
      .map((tp) => `${tp.names.join(', ')} ${printNode(tp.constraint, { inline: true })}`)
      .join(', ');
    return `[${list}]`;
  }

  function printNode(node: GoNode, context: PrintContext = {}): string {
    const parts: Array<string> = [];

    if (node.leadingComments) {
      printComments(parts, node.leadingComments);
    }

    switch (node.kind) {
      case GoNodeKind.ArrayType: {
        let sizePrefix = '[]';
        if (node.size === '...') {
          sizePrefix = '[...]';
        } else if (node.size !== undefined) {
          sizePrefix = `[${printNode(node.size, { inline: true })}]`;
        }
        const text = `${sizePrefix}${printNode(node.elementType, { inline: true })}`;
        parts.push(text);
        break;
      }

      case GoNodeKind.Assignment: {
        const assignmentText = `${printNode(node.target)} = ${printNode(node.value, {
          inline: true,
        })}`;
        parts.push(context.inline ? assignmentText : printLine(assignmentText));
        break;
      }

      case GoNodeKind.AugmentAssignment: {
        const assignmentText = `${printNode(node.target)} ${node.operator} ${printNode(node.value, {
          inline: true,
        })}`;
        parts.push(context.inline ? assignmentText : printLine(assignmentText));
        break;
      }

      case GoNodeKind.BinaryExpression: {
        const precedence = OPERATOR_PRECEDENCE[node.operator] ?? 0;
        const left = printNode(node.left, { inline: true, parentPrecedence: precedence });
        const right = printNode(node.right, { inline: true, parentPrecedence: precedence });
        const tight =
          context.parentPrecedence !== undefined && precedence > context.parentPrecedence;
        const expr = tight
          ? `${left}${node.operator}${right}`
          : `${left} ${node.operator} ${right}`;
        parts.push(expr);
        break;
      }

      case GoNodeKind.Block:
        if (!node.statements.length) {
          parts.push('{}');
        } else {
          parts.push(context.inline ? '{' : printLine('{'));
          indentLevel += 1;
          parts.push(...node.statements.map((stmt) => printNode(stmt)));
          indentLevel -= 1;
          parts.push(printLine('}'));
        }
        break;

      case GoNodeKind.BreakStatement:
        parts.push(printLine('break'));
        break;

      case GoNodeKind.CallExpression: {
        const args = node.args.map((arg: GoNode, index: number) => {
          const base = printNode(arg, { inline: true });
          if (node.spreadLastArg && index === node.args.length - 1) {
            return `${base}...`;
          }
          return base;
        });
        const text = `${printNode(node.callee)}(${args.join(', ')})`;
        parts.push(context.inline ? text : printLine(text));
        break;
      }

      case GoNodeKind.ChannelType: {
        const lead = node.direction === 'receive' ? '<-' : '';
        const trail = node.direction === 'send' ? '<-' : '';
        parts.push(`${lead}chan${trail} ${printNode(node.elementType, { inline: true })}`);
        break;
      }

      case GoNodeKind.Comment:
        parts.push(printLine(`// ${node.text}`));
        break;

      case GoNodeKind.CompositeLiteral: {
        const typeText = node.type ? printNode(node.type) : '';
        const elementsText = node.elements.map((el) => printNode(el, { inline: true })).join(', ');
        const text = `${typeText}{${elementsText}}`;
        parts.push(text);
        break;
      }

      case GoNodeKind.ConstDeclaration: {
        if (!node.specs.length) {
          parts.push(printLine('const ()'));
          break;
        }

        const [firstSpec] = node.specs;
        if (node.specs.length === 1 && firstSpec) {
          const type = firstSpec.type ? ' ' + `${printNode(firstSpec.type)}` : '';
          const value = firstSpec.value ? ` = ${printNode(firstSpec.value, { inline: true })}` : '';
          parts.push(printLine(`const ${firstSpec.name}${type}${value}`));
          break;
        }

        const rows = node.specs.map((spec) => {
          const cells = [spec.name];
          if (spec.type) cells.push(printNode(spec.type, { inline: true }));
          if (spec.value) cells.push(`= ${printNode(spec.value, { inline: true })}`);
          return cells;
        });

        parts.push(printLine('const ('));
        indentLevel += 1;
        parts.push(...alignCells(rows).map((line) => printLine(line)));
        indentLevel -= 1;
        parts.push(printLine(')'));
        break;
      }

      case GoNodeKind.ContinueStatement:
        parts.push(printLine('continue'));
        break;

      case GoNodeKind.DeferStatement: {
        const text = `defer ${printNode(node.call, { inline: true })}`;
        parts.push(printLine(text));
        break;
      }

      case GoNodeKind.EmptyStatement:
        parts.push('');
        break;

      case GoNodeKind.ExpressionStatement: {
        const text = `${printNode(node.expression, { inline: true })}`;
        parts.push(printLine(text));
        break;
      }

      case GoNodeKind.FallthroughStatement:
        parts.push(printLine('fallthrough'));
        break;

      case GoNodeKind.ForRangeStatement: {
        const names = node.targets?.join(', ');
        const assignOp = node.useShortVar ? ':=' : '=';
        const iterText = `range ${printNode(node.iterable, { inline: true })}`;
        const header = names ? `for ${names} ${assignOp} ${iterText}` : `for ${iterText}`;
        const body = printNode(node.body, { inline: true });
        parts.push(printLine(`${header} ${body}`));
        break;
      }

      case GoNodeKind.ForStatement: {
        const init = node.init ? `${printNode(node.init, { inline: true })}` : '';
        const condition = node.condition ? `${printNode(node.condition, { inline: true })}` : '';
        const post = node.post ? `${printNode(node.post, { inline: true })}` : '';
        const body = printNode(node.body, { inline: true });
        const joined = [init, condition, post].filter(Boolean).join('; ');
        const forLine = `for ${joined.length ? `${joined} ` : ''}`;
        parts.push(printLine(`${forLine}${body}`));
        break;
      }

      case GoNodeKind.FunctionDeclaration: {
        const parameters = node.parameters.map((parameter) => printNode(parameter)).join(', ');
        const finalReturnType = printReturnType(node.returnType);
        const receiver = node.receiver
          ? `(${node.receiver.name} ${printNode(node.receiver.type, { inline: true })})`
          : '';
        const typeParams = printTypeParameters(node.typeParameters);
        const signature = `func${receiver ? ` ${receiver}` : ''} ${node.name}${typeParams}(${parameters})${finalReturnType}`;
        const blockOutput = printNode(node.body, { inline: true });
        parts.push(
          context.inline
            ? [signature, blockOutput].join(' ')
            : printLine([signature, blockOutput].join(' ')),
        );
        break;
      }

      case GoNodeKind.FunctionLiteral: {
        const parameters = node.parameters.map((parameter) => printNode(parameter)).join(', ');
        const returnType = node.returnType.map((parameter) => printNode(parameter)).join(', ');
        const useReturnTypeBrackets =
          node.returnType.length > 1 || node.returnType.some((rt) => rt.name);
        const finalReturnType = useReturnTypeBrackets
          ? ` (${returnType})`
          : returnType
            ? ` ${returnType}`
            : '';
        const signature = `func(${parameters})${finalReturnType}`;
        const blockOutput = printNode(node.body, { inline: true });
        parts.push(
          context.inline
            ? [signature, blockOutput].join(' ')
            : printLine([signature, blockOutput].join(' ')),
        );
        break;
      }

      case GoNodeKind.FunctionParameter: {
        const variadic = node.isVariadic ? '...' : '';
        parts.push(`${node.names.join(', ')} ${variadic}${printNode(node.type, { inline: true })}`);
        break;
      }

      case GoNodeKind.FunctionReturn: {
        const name = node.name ? `${node.name} ` : '';
        parts.push(`${name}${printNode(node.type, { inline: true })}`);
        break;
      }

      case GoNodeKind.FunctionType: {
        const parameters = node.parameters
          .map((parameter) => printNode(parameter, { inline: true }))
          .join(', ');
        const finalReturnType = printReturnType(node.returnType);
        parts.push(`func(${parameters})${finalReturnType}`);
        break;
      }

      case GoNodeKind.GenericType: {
        const typeArguments = node.typeArguments
          .map((typeArgument) => printNode(typeArgument, { inline: true }))
          .join(', ');
        parts.push(`${printNode(node.type, { inline: true })}[${typeArguments}]`);
        break;
      }

      case GoNodeKind.GoStatement: {
        const text = `go ${printNode(node.expression, { inline: true })}`;
        parts.push(printLine(text));
        break;
      }

      case GoNodeKind.Identifier:
        parts.push(node.name);
        break;

      case GoNodeKind.IfStatement: {
        const initStatement = node.initStatement
          ? `${printNode(node.initStatement, { inline: true })}; `
          : '';
        const ifLine = `if ${initStatement}${printNode(node.condition, { inline: true })}`;
        const thenBlock = printNode(node.thenBlock, { inline: true });
        let elseBlock = '';
        if (node.elseBlock) {
          elseBlock = ` else ${printNode(node.elseBlock, { inline: true })}`;
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

        parts.push(printLine('import ('));
        indentLevel += 1;
        parts.push(...specs.map((spec) => printLine(spec)));
        indentLevel -= 1;
        parts.push(printLine(')'));
        break;
      }

      case GoNodeKind.IncDecStatement: {
        const incDecText = `${printNode(node.target)}${node.operator}`;
        parts.push(context.inline ? incDecText : printLine(incDecText));
        break;
      }

      case GoNodeKind.IndexExpression:
        // Ensure the object and index are printed inline to avoid accidental indentation
        parts.push(
          `${printNode(node.object, { inline: true })}[${printNode(node.index, { inline: true })}]`,
        );
        break;

      case GoNodeKind.InterfaceType: {
        if (!node.fields.length) {
          parts.push('interface{}');
          break;
        }

        parts.push('interface {');
        indentLevel += 1;
        for (const field of node.fields) {
          const parameters = field.parameters.map((parameter) => printNode(parameter)).join(', ');
          const finalReturnType = printReturnType(field.returnType);
          parts.push(printLine(`${field.name}(${parameters})${finalReturnType}`));
        }
        indentLevel -= 1;
        parts.push(printLine('}'));
        break;
      }

      case GoNodeKind.KeyValueExpression:
        parts.push(
          `${printNode(node.key, { inline: true })}: ${printNode(node.value, { inline: true })}`,
        );
        break;

      case GoNodeKind.Literal:
        if (node.literalKind === 'nil') {
          parts.push('nil');
        } else if (node.literalKind === 'rune') {
          parts.push(`'${node.value}'`);
        } else if (node.literalKind === 'string') {
          parts.push(`"${escapeString(node.value)}"`);
        } else {
          parts.push(node.value);
        }
        break;

      case GoNodeKind.MapType: {
        const text = `map[${printNode(node.keyType, { inline: true })}]${printNode(node.valueType, { inline: true })}`;
        parts.push(text);
        break;
      }

      case GoNodeKind.MemberExpression:
        parts.push(
          `${printNode(node.object, { inline: true })}.${printNode(node.member, { inline: true })}`,
        );
        break;

      case GoNodeKind.PackageDeclaration:
        parts.push(printLine(`package ${node.name}`));
        break;

      case GoNodeKind.PointerType:
        parts.push(`*${printNode(node.elementType, { inline: true })}`);
        break;

      case GoNodeKind.ReturnStatement: {
        const values = node.expressions.map((expr) => printNode(expr, { inline: true })).join(', ');
        parts.push(printLine(`return${values ? ` ${values}` : ''}`));
        break;
      }

      case GoNodeKind.SendStatement: {
        const text = `${printNode(node.channel, { inline: true })} <- ${printNode(node.value, {
          inline: true,
        })}`;
        parts.push(context.inline ? text : printLine(text));
        break;
      }

      case GoNodeKind.ShortVarDeclaration: {
        const names = node.names.join(', ');
        const values = node.values.map((value) => printNode(value, { inline: true })).join(', ');
        const shortVarText = `${names} := ${values}`;
        parts.push(context.inline ? shortVarText : printLine(shortVarText));
        break;
      }

      case GoNodeKind.SourceFile: {
        parts.push(printNode(node.packageDeclaration));
        parts.push('');

        const stmts = node.statements;

        for (let i = 0; i < stmts.length; i++) {
          if (i > 0) {
            const prev = stmts[i - 1]!;
            const curr = stmts[i]!;
            const grouped = prev.kind === curr.kind && GROUPABLE_KINDS.has(curr.kind);
            if (!grouped) parts.push('');
          }
          parts.push(printNode(stmts[i]!));
        }
        break;
      }

      case GoNodeKind.SliceExpression: {
        const low = node.low ? printNode(node.low, { inline: true }) : '';
        const high = node.high ? printNode(node.high, { inline: true }) : '';
        if (node.max) {
          const max = printNode(node.max, { inline: true });
          parts.push(`${printNode(node.object, { inline: true })}[${low}:${high}:${max}]`);
        } else {
          parts.push(`${printNode(node.object, { inline: true })}[${low}:${high}]`);
        }
        break;
      }

      case GoNodeKind.StructType: {
        if (!node.fields.length) {
          parts.push('struct{}');
          break;
        }

        parts.push('struct {');
        indentLevel += 1;

        const rows = node.fields.map((field) => ({
          name: field.names?.join(', ') ?? '',
          tag: field.tag ? `\`${field.tag}\`` : '',
          type: printNode(field.type),
        }));

        const flat = rows.filter((row) => !row.type.includes('\n'));
        const nameWidth = Math.max(0, ...rows.map((row) => row.name.length));
        const typeWidth = Math.max(
          0,
          ...flat.filter((row) => row.tag).map((row) => row.type.length),
        );

        for (const row of rows) {
          const prefix = row.name ? row.name.padEnd(nameWidth + 1) : '';

          if (!row.type.includes('\n')) {
            const type = row.tag ? row.type.padEnd(typeWidth + 1) : row.type;
            parts.push(printLine(`${prefix}${type}${row.tag}`));
          } else {
            const lines = row.type.split('\n');
            parts.push(printLine(`${prefix}${lines[0]}`));
            parts.push(...lines.slice(1, -1));
            parts.push(row.tag ? `${lines.at(-1)} ${row.tag}` : lines.at(-1)!);
          }
        }

        indentLevel -= 1;
        parts.push(printLine('}'));
        break;
      }

      case GoNodeKind.SwitchStatement: {
        const init = node.initStatement
          ? `${printNode(node.initStatement, { inline: true })}; `
          : '';

        let content = '';
        if (node.typeGuard) {
          const left = node.typeGuard.assignTo ? `${node.typeGuard.assignTo} := ` : '';
          content = `${init}${left}${printNode(node.typeGuard.subject, {
            inline: true,
          })}.(type)`;
        } else if (node.tag) {
          content = `${init}${printNode(node.tag, { inline: true })}`;
        } else {
          content = `${init}`.trimEnd();
        }

        const header = content ? `switch ${content}` : 'switch';
        parts.push(printLine(`${header} {`));
        for (const switchCase of node.cases) {
          const clause =
            switchCase.expressions && switchCase.expressions.length
              ? `case ${switchCase.expressions.map((e) => printNode(e, { inline: true })).join(', ')}`
              : 'default';
          parts.push(printLine(`${clause}:`));
          if (switchCase.body.statements.length) {
            indentLevel += 1;
            parts.push(...switchCase.body.statements.map((stmt) => printNode(stmt)));
            indentLevel -= 1;
          }
        }
        parts.push(printLine('}'));
        break;
      }

      case GoNodeKind.TypeDeclaration: {
        const typeBody = printNode(node.type, { inline: true });
        const op = node.isAlias ? '=' : '';
        const pieces = [
          'type',
          `${node.name}${printTypeParameters(node.typeParameters)}`,
          op,
        ].filter(Boolean);
        parts.push(printLine([...pieces, typeBody].join(' ')));
        break;
      }

      case GoNodeKind.UnaryExpression:
        parts.push(`${node.operator}${printNode(node.operand, { inline: true })}`);
        break;

      case GoNodeKind.VarDeclaration: {
        const type = node.type ? ' ' + `${printNode(node.type, { inline: true })}` : '';
        const value = node.value ? ` = ${printNode(node.value, { inline: true })}` : '';

        parts.push(printLine(`var ${node.name}${type}${value}`));
        break;
      }

      default:
        // @ts-expect-error
        throw new Error(`Unsupported node kind: ${node.kind}`);
    }

    if (node.trailingComments) {
      if (!context.inline) {
        parts.push('');
      }
      printComments(parts, node.trailingComments, false);
    }

    return parts.join('\n');
  }

  function printFile(node: GoNode): string {
    const parts: Array<string> = [printNode(node), ''];
    return parts.join('\n');
  }

  return {
    printFile,
  };
}

export function printAst(node: GoNode): string {
  return JSON.stringify(node, null, 2);
}
