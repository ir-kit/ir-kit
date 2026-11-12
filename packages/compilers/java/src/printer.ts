import type { JavaNode } from "./nodes/base.js";
import type { JavaMethodParameter } from "./nodes/declarations/method-parameter.js";
import { JavaNodeKind } from "./nodes/kinds.js";

export interface JavaPrinterOptions {
  indentSize?: number;
}

export function createPrinter(options?: JavaPrinterOptions) {
  const indentSize = options?.indentSize ?? 2;
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
          parts.push(`"${node.value}"`);
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
        parts.push(printLine(`${printNode(node.expression)};`));
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
          printLine(
            `return${node.expression ? ` ${printNode(node.expression)}` : ""};`,
          ),
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
        parts.push(
          printLine(
            `${inlineAnnotations}${modifiers}${typeText}${node.name}${valueText};`,
          ),
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
        parts.push(...node.statements.map((stmt: JavaNode) => printNode(stmt)));
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
          printLine(
            `${modifiers}class ${node.name}${typeParams}${extendsText}${implementsText} ${printNode(node.body)}`,
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
          printLine(
            `${modifiers}record ${node.name}(${components})${implementsText} ${printNode(node.body)}`,
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
        parts.push(
          printLine(
            `${modifiers}${node.annotationInterface ? "@interface" : "interface"} ${node.name}${typeParams}${extendsText} ${printNode(node.body)}`,
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
        const constantsText = node.constants
          .map((c) =>
            c.args && c.args.length > 0
              ? `${c.name}(${c.args.map((a) => printNode(a)).join(", ")})`
              : c.name,
          )
          .join(", ");
        const header = `${modifiers}enum ${node.name}${implementsText}`;
        parts.push(printLine(`${header} {`));
        indentLevel += 1;
        const hasMembers = node.body.statements.length > 0;
        if (constantsText.length > 0) {
          parts.push(printLine(constantsText + (hasMembers ? ";" : "")));
        }
        if (hasMembers) {
          parts.push(
            ...node.body.statements.map((stmt: JavaNode) => printNode(stmt)),
          );
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
