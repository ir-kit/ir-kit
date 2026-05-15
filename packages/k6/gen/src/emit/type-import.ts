export function formatTypeImport(typeNames: ReadonlyArray<string>): string {
  if (!typeNames.length) return "";
  if (typeNames.length === 1) {
    return `import type { ${typeNames[0]} } from "./types.js";\n`;
  }
  const indented = typeNames.map((n) => `  ${n},`).join("\n");
  return `import type {\n${indented}\n} from "./types.js";\n`;
}
