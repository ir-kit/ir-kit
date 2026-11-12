import type {
  ProtoDecl,
  ProtoField,
  ProtoFile,
  ProtoService,
  ProtoType,
} from "./ast.js";

export function printProtoFile(file: ProtoFile): string {
  const imports = new Set<string>();
  const typeRef = (t: ProtoType): string => {
    switch (t.kind) {
      case "scalar":
        return t.name;
      case "named":
        if (t.import) imports.add(t.import);
        return t.name;
      case "repeated":
        return `repeated ${typeRef(t.elem)}`;
      case "map":
        return `map<string, ${typeRef(t.value)}>`;
    }
  };

  const blocks = [
    ...file.services.map((s) => printService(s, typeRef)),
    ...file.decls.map((d) => printDecl(d, typeRef)),
  ];

  const head = ['syntax = "proto3";', `package ${file.package};`];
  if (imports.size > 0) {
    head.push(
      [...imports]
        .sort()
        .map((i) => `import "${i}";`)
        .join("\n"),
    );
  }
  return `${[...head, ...blocks].join("\n\n")}\n`;
}

function printService(
  service: ProtoService,
  typeRef: (t: ProtoType) => string,
): string {
  const rpcs = service.rpcs.map((rpc) => {
    const signature = `rpc ${rpc.name}(${typeRef(rpc.request)}) returns (${typeRef(rpc.response)})`;
    const body = rpc.deprecated
      ? `${signature} {\n    option deprecated = true;\n  }`
      : `${signature};`;
    return `${comment(rpc.comment, "  ")}  ${body}`;
  });
  return `${comment(service.comment, "")}service ${service.name} {\n${rpcs.join("\n")}\n}`;
}

function printDecl(decl: ProtoDecl, typeRef: (t: ProtoType) => string): string {
  if (decl.kind === "enum") {
    const values = decl.values.map((v) => `  ${v.name} = ${v.number};`);
    return `${comment(decl.comment, "")}enum ${decl.name} {\n${values.join("\n")}\n}`;
  }
  const lines = decl.fields.map((f) => printField(f, typeRef, "  "));
  for (const oneof of decl.oneofs) {
    const fields = oneof.fields.map((f) => printField(f, typeRef, "    "));
    lines.push(`  oneof ${oneof.name} {\n${fields.join("\n")}\n  }`);
  }
  const body = lines.length > 0 ? `\n${lines.join("\n")}\n` : "";
  return `${comment(decl.comment, "")}message ${decl.name} {${body}}`;
}

function printField(
  field: ProtoField,
  typeRef: (t: ProtoType) => string,
  indent: string,
): string {
  const options: string[] = [];
  if (field.jsonName !== undefined)
    options.push(`json_name = ${JSON.stringify(field.jsonName)}`);
  if (field.deprecated) options.push("deprecated = true");
  const label = field.optional ? "optional " : "";
  const suffix = options.length > 0 ? ` [${options.join(", ")}]` : "";
  return `${comment(field.comment, indent)}${indent}${label}${typeRef(field.type)} ${field.name} = ${field.number}${suffix};`;
}

function comment(text: string | undefined, indent: string): string {
  if (!text?.trim()) return "";
  return `${text
    .trim()
    .replace(/\n\s*\n(\s*\n)+/g, "\n\n")
    .split(/\r?\n/)
    .map((line) => `${indent}//${line.trimEnd() ? ` ${line.trimEnd()}` : ""}`)
    .join("\n")}\n`;
}
