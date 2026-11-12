import type { JavaNode } from "./nodes/base.js";
import type { JavaMethodParameter } from "./nodes/declarations/method-parameter.js";
import { JavaNodeKind } from "./nodes/kinds.js";

export interface JavaPrinterOptions {
  indentSize?: number;
  maxLineLength?: number;
}

const TYPE_DECLARATIONS: ReadonlySet<JavaNodeKind> = new Set([
  JavaNodeKind.ClassDeclaration,
  JavaNodeKind.EnumDeclaration,
  JavaNodeKind.InterfaceDeclaration,
  JavaNodeKind.RecordDeclaration,
]);

const STRING_ESCAPES: Readonly<Record<string, string>> = {
  "\b": "\\b",
  "\t": "\\t",
  "\n": "\\n",
  "\f": "\\f",
  "\r": "\\r",
  '"': '\\"',
  "\\": "\\\\",
};

function quoteString(value: string): string {
  const body = value.replace(
    /[\b\t\n\f\r"\\]|[\u0000-\u001f\u007f]/g,
    (c) =>
      STRING_ESCAPES[c] ??
      `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`,
  );
  return `"${body}"`;
}

export function createPrinter(options?: JavaPrinterOptions) {
  const indentSize = options?.indentSize ?? 2;
  const maxLineLength = options?.maxLineLength ?? 100;
  const spaces = (n: number) => " ".repeat(n);
  const baseIndent = () => indentLevel * indentSize;

  function fitOrWrap(
    base: number,
    prefix: string,
    items: ReadonlyArray<JavaNode | string>,
    suffix: string,
  ): string {
    const text = (it: JavaNode | string) =>
      typeof it === "string" ? it : printNode(it);
    const flat = `${prefix}${items.map(text).join(", ")}${suffix}`;
    if (items.length === 0 || base + flat.length <= maxLineLength) {
      return spaces(base) + flat;
    }
    const cont = base + 4;
    const oneLine = `${items.map(text).join(", ")}${suffix}`;
    if (!oneLine.includes("\n") && cont + oneLine.length <= maxLineLength) {
      return `${spaces(base)}${prefix}\n${spaces(cont)}${oneLine}`;
    }
    const last = items.length - 1;
    return [
      spaces(base) + prefix,
      ...items.map((it, i) =>
        typeof it === "string"
          ? wrapAnnotated(it, cont, i < last ? "," : suffix)
          : wrapExpr(it, cont, "", i < last ? "," : suffix),
      ),
    ].join("\n");
  }

  /** Breaks after a leading annotation when an annotated parameter overflows. */
  function wrapAnnotated(item: string, base: number, end: string): string {
    const line = spaces(base) + item + end;
    if (line.length <= maxLineLength) return line;
    const match =
      /^(@[\w.]+(?:\((?:"(?:[^"\\]|\\.)*"|[^()"])*\))?) (.+)$/s.exec(item);
    if (match) {
      return `${spaces(base)}${match[1]}\n${splitTypeAndName(match[2]!, base + 4, end)}`;
    }
    return splitTypeAndName(item, base, end);
  }

  function splitTypeAndName(item: string, base: number, end: string): string {
    const line = spaces(base) + item + end;
    const space = item.lastIndexOf(" ");
    if (line.length <= maxLineLength || space === -1) return line;
    return `${breakType(item.slice(0, space), base)}\n${spaces(base + 4)}${item.slice(space + 1)}${end}`;
  }

  /** Breaks an over-long generic type after `<`, one type argument per line. */
  function breakType(type: string, base: number): string {
    const lt = type.indexOf("<");
    if (
      base + type.length <= maxLineLength ||
      lt === -1 ||
      !type.endsWith(">")
    ) {
      return spaces(base) + type;
    }
    const args: string[] = [];
    let depth = 0;
    let current = "";
    for (const ch of type.slice(lt + 1, -1)) {
      if (ch === "<") depth += 1;
      if (ch === ">") depth -= 1;
      if (ch === "," && depth === 0) {
        args.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    args.push(current.trim());
    const last = args.length - 1;
    return [
      spaces(base) + type.slice(0, lt + 1),
      ...args.map((arg, i) => spaces(base + 8) + arg + (i < last ? "," : ">")),
    ].join("\n");
  }

  function wrapExpr(
    node: JavaNode,
    base: number,
    prefix: string,
    suffix: string,
  ): string {
    const flat = `${prefix}${printNode(node)}${suffix}`;
    if (base + flat.length <= maxLineLength) return spaces(base) + flat;
    if (node.kind === JavaNodeKind.CallExpression && node.args.length > 0) {
      const callee = node.callee;
      if (
        callee.kind === JavaNodeKind.MemberExpression &&
        base + prefix.length + printNode(callee).length + 1 > maxLineLength
      ) {
        return `${spaces(base)}${prefix}${printNode(callee.object)}\n${fitOrWrap(
          base + 4,
          `.${printNode(callee.member)}(`,
          node.args,
          `)${suffix}`,
        )}`;
      }
      return fitOrWrap(
        base,
        `${prefix}${printNode(node.callee)}(`,
        node.args,
        `)${suffix}`,
      );
    }
    if (
      node.kind === JavaNodeKind.NewExpression &&
      !node.body &&
      node.args.length > 0
    ) {
      return fitOrWrap(
        base,
        `${prefix}new ${printNode(node.callee)}(`,
        node.args,
        `)${suffix}`,
      );
    }
    return spaces(base) + flat;
  }

  /** Re-wraps an over-long declaration header at its parameter list. */
  function wrapHeader(
    printed: string,
    open: string,
    items: ReadonlyArray<string>,
    declIndent = 4,
  ): string {
    const nl = printed.indexOf("\n");
    const head = nl === -1 ? printed : printed.slice(0, nl);
    if (head.length <= maxLineLength) return printed;
    const list = items.join(", ");
    const at = head.indexOf(`${open}${list})`);
    if (at === -1) return printed;
    const start = at + open.length;
    const base = head.length - head.trimStart().length;
    const suffix = head.slice(start + list.length);
    const before = head.slice(base, at);
    const clause = suffix.indexOf(" implements ");
    let wrapped: string;
    if (clause !== -1 && start + list.length + clause <= maxLineLength) {
      wrapped = `${head.slice(0, start + list.length + clause)}\n${spaces(base + 4)}${suffix.slice(clause + 1)}`;
    } else if (
      before.trim() &&
      (items.length === 0 || base + before.length + open.length > maxLineLength)
    ) {
      wrapped = `${spaces(base)}${before.trimEnd()}\n${fitOrWrap(base + declIndent, open, items, suffix)}`;
    } else {
      wrapped = fitOrWrap(base, head.slice(base, start), items, suffix);
    }
    return nl === -1 ? wrapped : wrapped + printed.slice(nl);
  }

  function wrapClauseList(piece: string, base: number): string {
    if (base + piece.length <= maxLineLength) return spaces(base) + piece;
    const items = piece.split(", ");
    return [
      spaces(base) + items[0],
      ...items.slice(1).map((item) => spaces(base + 4) + item),
    ].join(",\n");
  }

  /** Moves `extends` / `implements` clauses of an over-long type header onto continuation lines. */
  function wrapClauses(printed: string): string {
    const nl = printed.indexOf("\n");
    const head = nl === -1 ? printed : printed.slice(0, nl);
    if (head.length <= maxLineLength) return printed;
    const base = head.length - head.trimStart().length;
    const pieces = head.split(/ (?=(?:extends|implements|permits) )/);
    if (pieces.length === 1) return printed;
    const wrapped = [
      pieces[0],
      ...pieces.slice(1).map((piece) => wrapClauseList(piece, base + 4)),
    ].join("\n");
    return nl === -1 ? wrapped : wrapped + printed.slice(nl);
  }

  function printMemberBlock(members: ReadonlyArray<JavaNode>): string {
    if (members.length === 0) return "{}";
    const lines: string[] = ["{"];
    indentLevel += 1;
    members.forEach((member, i) => {
      const prev = members[i - 1];
      if (
        prev &&
        !(
          prev.kind === JavaNodeKind.VariableDeclaration &&
          member.kind === JavaNodeKind.VariableDeclaration
        )
      ) {
        lines.push("");
      }
      lines.push(printNode(member));
    });
    indentLevel -= 1;
    lines.push(printLine("}"));
    return lines.join("\n");
  }
  let indentLevel = 0;

  function printParameter(p: JavaMethodParameter): string {
    const anns = (p.annotations ?? [])
      .map((ann) => `@${printNode(ann)} `)
      .join("");
    const mods = p.modifiers?.length ? `${p.modifiers.join(" ")} ` : "";
    const typeTxt = p.type
      ? `${printNode(p.type)}${p.varargs ? "..." : ""} `
      : "";
    return `${anns}${mods}${typeTxt}${p.name}`.trim();
  }

  /** Reflows an over-long `//` comment at spaces, as google-java-format does. */
  function wrapComment(text: string): string[] {
    const width = maxLineLength - baseIndent() - 3;
    if (text.length <= width) return [text];
    const lines: string[] = [];
    let current = "";
    for (const word of text.split(" ")) {
      if (current && current.length + 1 + word.length > width) {
        lines.push(current);
        current = word;
      } else {
        current = current ? `${current} ${word}` : word;
      }
    }
    lines.push(current);
    return lines;
  }

  function printComments(
    parts: Array<string>,
    lines: ReadonlyArray<string>,
    indent?: boolean,
  ): void {
    if (indent) indentLevel += 1;
    parts.push(
      ...lines.flatMap(wrapComment).map((line) => printLine(`// ${line}`)),
    );
    if (indent) indentLevel -= 1;
  }

  function printLine(line: string): string {
    return " ".repeat(indentLevel * indentSize) + line;
  }

  function printNode(node: JavaNode): string {
    const parts: Array<string> = [];

    if (node.leadingComments) {
      printComments(parts, node.leadingComments);
    }

    switch (node.kind) {
      case JavaNodeKind.PackageDeclaration: {
        parts.push(printLine(`package ${node.name};`));
        parts.push("");
        break;
      }

      case JavaNodeKind.ImportStatement: {
        const staticPrefix = node.static ? " static" : "";
        if (node.names && node.names.length > 0) {
          const imports = node.names
            .map(({ alias, name }) => (alias ? `${name} as ${alias}` : name))
            .join(", ");
          parts.push(
            printLine(`import${staticPrefix} ${node.path}.${imports};`),
          );
        } else {
          parts.push(printLine(`import${staticPrefix} ${node.path};`));
        }
        break;
      }

      case JavaNodeKind.Identifier:
        parts.push(node.name);
        break;

      case JavaNodeKind.Annotation: {
        const args =
          node.args && node.args.length > 0
            ? `(${node.args
                .map((a: any) => {
                  if (a && typeof a === "object" && "kind" in a) {
                    return printNode(a);
                  }
                  return `${a.name ? `${a.name} = ` : ""}${printNode(a.value)}`;
                })
                .join(", ")})`
            : "";
        parts.push(`${printNode(node.name)}${args}`);
        break;
      }

      case JavaNodeKind.Literal:
        if (typeof node.value === "string") {
          parts.push(quoteString(node.value));
        } else if (typeof node.value === "boolean") {
          parts.push(node.value ? "true" : "false");
        } else if (node.value === null) {
          parts.push("null");
        } else {
          parts.push(String(node.value));
        }
        break;

      case JavaNodeKind.MemberExpression:
        parts.push(`${printNode(node.object)}.${printNode(node.member)}`);
        break;

      case JavaNodeKind.ThisExpression:
        parts.push("this");
        break;

      case JavaNodeKind.SuperExpression:
        parts.push("super");
        break;

      case JavaNodeKind.LambdaExpression: {
        const [firstParam] = node.parameters;
        const needsParens =
          node.parameters.length !== 1 || (firstParam && firstParam.type);
        const paramsText = needsParens
          ? `(${node.parameters
              .map(
                (p: { name: string; type?: JavaNode }) =>
                  `${p.type ? `${printNode(p.type)} ` : ""}${p.name}`,
              )
              .join(", ")})`
          : firstParam!.name;
        parts.push(`${paramsText} -> ${printNode(node.body)}`);
        break;
      }

      case JavaNodeKind.TypeParameter: {
        const bounds =
          node.bounds && node.bounds.length > 0
            ? ` extends ${node.bounds.map((b: JavaNode) => printNode(b)).join(" & ")}`
            : "";
        parts.push(`${node.name}${bounds}`);
        break;
      }

      case JavaNodeKind.WildcardTypeArgument: {
        const bound =
          node.boundKind && node.boundType
            ? ` ${node.boundKind} ${printNode(node.boundType)}`
            : "";
        parts.push(`?${bound}`);
        break;
      }

      case JavaNodeKind.ParameterizedType: {
        const args = node.typeArguments
          .map((t: JavaNode) => printNode(t))
          .join(", ");
        parts.push(`${printNode(node.rawType)}<${args}>`);
        break;
      }

      case JavaNodeKind.ArrayInitializer:
        parts.push(
          `{ ${node.elements.map((e: JavaNode) => printNode(e)).join(", ")} }`,
        );
        break;

      case JavaNodeKind.ArrayCreationExpression: {
        const dims = node.dimensions
          .map((d: JavaNode | undefined) => `[${d ? printNode(d) : ""}]`)
          .join("");
        const init = node.initializer ? ` ${printNode(node.initializer)}` : "";
        parts.push(`new ${printNode(node.type)}${dims}${init}`);
        break;
      }

      case JavaNodeKind.IndexExpression:
        parts.push(`${printNode(node.object)}[${printNode(node.index)}]`);
        break;

      case JavaNodeKind.ArrayType: {
        const brackets = "[]".repeat(node.dimensions);
        parts.push(`${printNode(node.elementType)}${brackets}`);
        break;
      }

      case JavaNodeKind.UnaryExpression: {
        const operand = printNode(node.operand);
        if (node.postfix) {
          parts.push(`${operand}${node.operator}`);
        } else {
          parts.push(`${node.operator}${operand}`);
        }
        break;
      }

      case JavaNodeKind.BinaryExpression:
        parts.push(
          `${printNode(node.left)} ${node.operator} ${printNode(node.right)}`,
        );
        break;

      case JavaNodeKind.TernaryExpression:
        parts.push(
          `${printNode(node.condition)} ? ${printNode(node.thenExpr)} : ${printNode(node.elseExpr)}`,
        );
        break;

      case JavaNodeKind.SwitchExpression: {
        parts.push(printLine(`switch (${printNode(node.discriminant)}) {`));
        indentLevel += 1;
        for (const rule of node.rules) {
          const clause =
            rule.expressions && rule.expressions.length > 0
              ? `case ${rule.expressions.map((e: JavaNode) => printNode(e)).join(", ")}`
              : "default";
          if (rule.body.kind === JavaNodeKind.Block) {
            parts.push(printLine(`${clause} -> ${printNode(rule.body)}`));
          } else {
            parts.push(printLine(`${clause} -> ${printNode(rule.body)};`));
          }
        }
        indentLevel -= 1;
        parts.push(printLine("}"));
        break;
      }

      case JavaNodeKind.CallExpression:
        parts.push(
          `${printNode(node.callee)}(${node.args.map((arg: JavaNode) => printNode(arg)).join(", ")})`,
        );
        break;

      case JavaNodeKind.NewExpression: {
        const header = `new ${printNode(node.callee)}(${node.args.map((arg: JavaNode) => printNode(arg)).join(", ")})`;
        if (!("body" in node) || !node.body) {
          parts.push(header);
        } else if (node.body.statements.length === 0) {
          parts.push(header + " {}");
        } else {
          parts.push(header + " {");
          indentLevel += 1;
          parts.push(
            ...node.body.statements.map((stmt: JavaNode) => printNode(stmt)),
          );
          indentLevel -= 1;
          parts.push(printLine("}"));
        }
        break;
      }

      case JavaNodeKind.MethodReferenceExpression:
        parts.push(`${printNode(node.qualifier)}::${node.reference}`);
        break;

      case JavaNodeKind.CastExpression:
        parts.push(`(${printNode(node.type)}) ${printNode(node.expression)}`);
        break;

      case JavaNodeKind.InstanceOfExpression:
        parts.push(
          `${printNode(node.expression)} instanceof ${printNode(node.type)}`,
        );
        break;

      case JavaNodeKind.ExpressionStatement:
        parts.push(wrapExpr(node.expression, baseIndent(), "", ";"));
        break;

      case JavaNodeKind.LabeledStatement: {
        const inner = printNode(node.statement);
        const firstNewline = inner.indexOf("\n");
        if (firstNewline === -1) {
          parts.push(printLine(`${node.label}: ${inner}`));
        } else {
          const head = inner.slice(0, firstNewline);
          const tail = inner.slice(firstNewline + 1);
          parts.push(printLine(`${node.label}: ${head}`));
          parts.push(tail);
        }
        break;
      }

      case JavaNodeKind.ReturnStatement:
        parts.push(
          node.expression
            ? wrapExpr(node.expression, baseIndent(), "return ", ";")
            : printLine("return;"),
        );
        break;

      case JavaNodeKind.ThrowStatement:
        parts.push(printLine(`throw ${printNode(node.expression)};`));
        break;

      case JavaNodeKind.YieldStatement:
        parts.push(printLine(`yield ${printNode(node.expression)};`));
        break;

      case JavaNodeKind.AssertStatement: {
        const msg = node.message ? ` : ${printNode(node.message)}` : "";
        parts.push(printLine(`assert ${printNode(node.condition)}${msg};`));
        break;
      }

      case JavaNodeKind.Assignment:
        parts.push(
          printLine(`${printNode(node.target)} = ${printNode(node.value)};`),
        );
        break;

      case JavaNodeKind.AugmentedAssignment:
        parts.push(
          printLine(
            `${printNode(node.target)} ${node.operator} ${printNode(node.value)};`,
          ),
        );
        break;

      case JavaNodeKind.VariableDeclaration: {
        const inlineAnnotations =
          node.annotations && node.annotations.length > 0
            ? node.annotations
                .map((ann: JavaNode) => `@${printNode(ann)} `)
                .join("")
            : "";
        const modifiers =
          node.modifiers && node.modifiers.length > 0
            ? `${node.modifiers.join(" ")} `
            : "";
        const typeText = node.type ? `${printNode(node.type)} ` : "";
        const valueText = node.value ? ` = ${printNode(node.value)}` : "";
        const declText = `${inlineAnnotations}${modifiers}${typeText}${node.name}`;
        const line = printLine(`${declText}${valueText};`);
        parts.push(
          node.value && line.length > maxLineLength
            ? `${printLine(`${declText} =`)}\n${wrapExpr(node.value, baseIndent() + 4, "", ";")}`
            : line,
        );
        break;
      }

      case JavaNodeKind.Block: {
        if (node.statements.length === 0) {
          parts.push("{}");
        } else {
          parts.push("{");
          indentLevel += 1;
          parts.push(
            ...node.statements.map((stmt: JavaNode) => printNode(stmt)),
          );
          indentLevel -= 1;
          parts.push(printLine("}"));
        }
        break;
      }

      case JavaNodeKind.Comment: {
        parts.push(printLine(`// ${node.text}`));
        break;
      }

      case JavaNodeKind.EmptyStatement: {
        parts.push("");
        break;
      }

      case JavaNodeKind.SourceFile: {
        if (node.packageDeclaration) {
          parts.push(printNode(node.packageDeclaration));
        }
        node.statements.forEach((stmt: JavaNode, i: number) => {
          const prev = node.statements[i - 1];
          if (
            prev &&
            ((prev.kind === JavaNodeKind.ImportStatement &&
              stmt.kind !== JavaNodeKind.ImportStatement) ||
              (TYPE_DECLARATIONS.has(prev.kind) &&
                TYPE_DECLARATIONS.has(stmt.kind)))
          ) {
            parts.push("");
          }
          parts.push(printNode(stmt));
        });
        break;
      }

      case JavaNodeKind.ClassDeclaration: {
        if (node.annotations && node.annotations.length > 0) {
          parts.push(
            ...node.annotations.map((ann: JavaNode) =>
              printLine(`@${printNode(ann)}`),
            ),
          );
        }
        const modifiers =
          node.modifiers && node.modifiers.length > 0
            ? `${node.modifiers.join(" ")} `
            : "";
        const extendsText = node.extends
          ? ` extends ${printNode(node.extends)}`
          : "";
        const typeParams =
          node.typeParameters && node.typeParameters.length > 0
            ? `<${node.typeParameters.map((p: JavaNode) => printNode(p)).join(", ")}>`
            : "";
        const implementsText =
          node.implements && node.implements.length > 0
            ? ` implements ${node.implements.map((i: JavaNode) => printNode(i)).join(", ")}`
            : "";
        parts.push(
          wrapClauses(
            printLine(
              `${modifiers}class ${node.name}${typeParams}${extendsText}${implementsText} ${printMemberBlock(node.body.statements)}`,
            ),
          ),
        );
        break;
      }

      case JavaNodeKind.RecordDeclaration: {
        if (node.annotations && node.annotations.length > 0) {
          parts.push(
            ...node.annotations.map((ann) => printLine(`@${printNode(ann)}`)),
          );
        }
        const modifiers =
          node.modifiers && node.modifiers.length > 0
            ? `${node.modifiers.join(" ")} `
            : "";
        const implementsText =
          node.implements && node.implements.length > 0
            ? ` implements ${node.implements.map((i) => printNode(i)).join(", ")}`
            : "";
        const components = node.components
          .map((c) => printParameter(c))
          .join(", ");
        parts.push(
          wrapHeader(
            printLine(
              `${modifiers}record ${node.name}(${components})${implementsText} ${printMemberBlock(node.body.statements)}`,
            ),
            `record ${node.name}(`,
            node.components.map((c) => printParameter(c)),
            0,
          ),
        );
        break;
      }

      case JavaNodeKind.InterfaceDeclaration: {
        if (node.annotations && node.annotations.length > 0) {
          parts.push(
            ...node.annotations.map((ann) => printLine(`@${printNode(ann)}`)),
          );
        }
        const modifiers =
          node.modifiers && node.modifiers.length > 0
            ? `${node.modifiers.join(" ")} `
            : "";
        const extendsText =
          node.extends && node.extends.length > 0
            ? ` extends ${node.extends.map((e) => printNode(e)).join(", ")}`
            : "";
        const typeParams =
          node.typeParameters && node.typeParameters.length > 0
            ? `<${node.typeParameters.map((p: JavaNode) => printNode(p)).join(", ")}>`
            : "";
        const permitsText =
          node.permits && node.permits.length > 0
            ? ` permits ${node.permits.map((p) => printNode(p)).join(", ")}`
            : "";
        parts.push(
          wrapClauses(
            printLine(
              `${modifiers}${node.annotationInterface ? "@interface" : "interface"} ${node.name}${typeParams}${extendsText}${permitsText} ${printMemberBlock(node.body.statements)}`,
            ),
          ),
        );
        break;
      }

      case JavaNodeKind.EnumDeclaration: {
        if (node.annotations && node.annotations.length > 0) {
          parts.push(
            ...node.annotations.map((ann) => printLine(`@${printNode(ann)}`)),
          );
        }
        const modifiers =
          node.modifiers && node.modifiers.length > 0
            ? `${node.modifiers.join(" ")} `
            : "";
        const implementsText =
          node.implements && node.implements.length > 0
            ? ` implements ${node.implements.map((i) => printNode(i)).join(", ")}`
            : "";
        const header = `${modifiers}enum ${node.name}${implementsText} {`;
        parts.push(
          baseIndent() + header.length > maxLineLength
            ? `${printLine(`${modifiers}enum`)}\n${spaces(baseIndent() + 4)}${node.name}${implementsText} {`
            : printLine(header),
        );
        indentLevel += 1;
        const hasMembers = node.body.statements.length > 0;
        const last = node.constants.length - 1;
        node.constants.forEach((c, i) => {
          const end = i < last ? "," : hasMembers ? ";" : "";
          parts.push(
            c.args && c.args.length > 0
              ? fitOrWrap(baseIndent(), `${c.name}(`, c.args, `)${end}`)
              : printLine(c.name + end),
          );
        });
        if (hasMembers) {
          indentLevel -= 1;
          const body = printMemberBlock(node.body.statements).split("\n");
          indentLevel += 1;
          if (node.constants.length > 0) parts.push("");
          parts.push(...body.slice(1, -1));
        }
        indentLevel -= 1;
        parts.push(printLine("}"));
        break;
      }

      case JavaNodeKind.MethodDeclaration: {
        if (node.annotations && node.annotations.length > 0) {
          parts.push(
            ...node.annotations.map((ann: JavaNode) =>
              printLine(`@${printNode(ann)}`),
            ),
          );
        }
        const modifiers =
          node.modifiers && node.modifiers.length > 0
            ? `${node.modifiers.join(" ")} `
            : "";
        const returnText = node.returnType
          ? `${printNode(node.returnType)} `
          : "";
        const typeParams =
          node.typeParameters && node.typeParameters.length > 0
            ? `<${node.typeParameters.map((p: JavaNode) => printNode(p)).join(", ")}>`
            : "";
        const params = node.parameters.map((p) => printParameter(p)).join(", ");
        const isAnnotationElement =
          node.defaultValue !== undefined &&
          node.parameters.length === 0 &&
          (!node.body || node.body.statements.length === 0);
        const isConstructorLike = node.returnType === undefined;
        const hasEmptyBody = !node.body || node.body.statements.length === 0;

        if (isAnnotationElement) {
          const def = ` default ${printNode(node.defaultValue as JavaNode)}`;
          parts.push(
            printLine(`${modifiers}${returnText}${node.name}()${def};`),
          );
        } else if (hasEmptyBody) {
          if (isConstructorLike) {
            const throwsText =
              node.throws && node.throws.length > 0
                ? ` throws ${node.throws.map((t: JavaNode) => printNode(t)).join(", ")}`
                : "";
            parts.push(
              printLine(
                `${modifiers}${node.name}${typeParams}(${params})${throwsText};`,
              ),
            );
          } else {
            const throwsText =
              node.throws && node.throws.length > 0
                ? ` throws ${node.throws.map((t: JavaNode) => printNode(t)).join(", ")}`
                : "";
            parts.push(
              printLine(
                `${modifiers}${returnText}${node.name}${typeParams}(${params})${throwsText};`,
              ),
            );
          }
        } else if (isConstructorLike) {
          const throwsText =
            node.throws && node.throws.length > 0
              ? ` throws ${node.throws.map((t: JavaNode) => printNode(t)).join(", ")}`
              : "";
          parts.push(
            printLine(
              `${modifiers}${node.name}${typeParams}(${params})${throwsText} ${printNode(node.body)}`,
            ),
          );
        } else {
          const throwsText =
            node.throws && node.throws.length > 0
              ? ` throws ${node.throws.map((t: JavaNode) => printNode(t)).join(", ")}`
              : "";
          parts.push(
            printLine(
              `${modifiers}${returnText}${node.name}${typeParams}(${params})${throwsText} ${printNode(node.body)}`,
            ),
          );
        }
        break;
      }

      case JavaNodeKind.IfStatement: {
        parts.push(
          printLine(
            `if (${printNode(node.condition)}) ${printNode(node.thenBlock)}`,
          ),
        );
        if (node.elseBlock) {
          parts.push(printLine(`else ${printNode(node.elseBlock)}`));
        }
        break;
      }

      case JavaNodeKind.WhileStatement: {
        parts.push(
          printLine(
            `while (${printNode(node.condition)}) ${printNode(node.body)}`,
          ),
        );
        break;
      }

      case JavaNodeKind.DoWhileStatement: {
        parts.push(
          printLine(
            `do ${printNode(node.body)} while (${printNode(node.condition)});`,
          ),
        );
        break;
      }

      case JavaNodeKind.ForStatement: {
        if (node.variable && node.iterable) {
          const typeText = node.type ? `${printNode(node.type)} ` : "";
          parts.push(
            printLine(
              `for (${typeText}${node.variable} : ${printNode(node.iterable)}) ${printNode(node.body)}`,
            ),
          );
        } else {
          const init = node.init ? printNode(node.init) : "";
          const cond = node.condition ? printNode(node.condition) : "";
          const upd = node.update ? printNode(node.update) : "";
          const header = `for (${[init, cond, upd].join("; ")})`;
          parts.push(printLine(`${header} ${printNode(node.body)}`));
        }
        break;
      }

      case JavaNodeKind.BreakStatement: {
        const label = node.label ? ` ${node.label}` : "";
        parts.push(printLine(`break${label};`));
        break;
      }

      case JavaNodeKind.ContinueStatement: {
        const label = node.label ? ` ${node.label}` : "";
        parts.push(printLine(`continue${label};`));
        break;
      }

      case JavaNodeKind.SynchronizedStatement: {
        parts.push(
          printLine(
            `synchronized (${printNode(node.monitor)}) ${printNode(node.body)}`,
          ),
        );
        break;
      }

      case JavaNodeKind.SwitchStatement: {
        parts.push(printLine(`switch (${printNode(node.discriminant)}) {`));
        indentLevel += 1;
        for (const sc of node.cases) {
          const clause =
            sc.expressions && sc.expressions.length > 0
              ? `case ${sc.expressions.map((e: JavaNode) => printNode(e)).join(", ")}`
              : "default";
          parts.push(printLine(`${clause}:`));
          if (sc.body.statements.length > 0) {
            indentLevel += 1;
            parts.push(
              ...sc.body.statements.map((stmt: JavaNode) => printNode(stmt)),
            );
            indentLevel -= 1;
          }
        }
        indentLevel -= 1;
        parts.push(printLine("}"));
        break;
      }

      case JavaNodeKind.TryStatement: {
        if (node.resources && node.resources.length > 0) {
          const resources = node.resources
            .map((res) => {
              if (
                res &&
                typeof res === "object" &&
                "name" in res &&
                "type" in res
              ) {
                const init = res.initializer
                  ? ` = ${printNode(res.initializer)}`
                  : "";
                return `${printNode(res.type)} ${res.name}${init}`;
              }
              return printNode(res as any);
            })
            .join("; ");
          parts.push(
            printLine(`try (${resources}) ${printNode(node.tryBlock)}`),
          );
        } else {
          parts.push(printLine("try " + printNode(node.tryBlock)));
        }
        if (node.catchClauses && node.catchClauses.length > 0) {
          for (const c of node.catchClauses) {
            const param = c.parameterType
              ? `${c.parameterType} ${c.parameterName}`
              : c.parameterName;
            const lastIdx = parts.length - 1;
            parts[lastIdx] =
              parts[lastIdx] + ` catch (${param}) ${printNode(c.body)}`;
          }
        }
        if (node.finallyBlock) {
          const lastIdx = parts.length - 1;
          parts[lastIdx] =
            parts[lastIdx] + " finally " + printNode(node.finallyBlock);
        }
        break;
      }

      default:
        throw new Error(`Unsupported node kind: ${(node as any).kind}`);
    }

    if (node.kind === JavaNodeKind.MethodDeclaration) {
      const typeParams =
        node.typeParameters && node.typeParameters.length > 0
          ? `<${node.typeParameters.map((p: JavaNode) => printNode(p)).join(", ")}>`
          : "";
      const items = node.parameters.map((p) => printParameter(p));
      const open = `${node.name}${typeParams}(`;
      return parts.map((part) => wrapHeader(part, open, items)).join("\n");
    }
    return parts.join("\n");
  }

  function printFile(node: JavaNode): string {
    const parts: Array<string> = [printNode(node), ""];
    return parts.join("\n");
  }

  return {
    printFile,
  };
}

export function printAst(node: JavaNode): string {
  return JSON.stringify(node, null, 2);
}
