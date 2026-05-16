import type { IR } from "@ahmedrowaihi/openapi-tools";

const HTTP_METHODS = [
  "get",
  "put",
  "post",
  "delete",
  "options",
  "head",
  "patch",
] as const;

/** `"GET /pets/{id}" → "getPetById"`. */
export type OperationMap = Map<string, string>;

/** Build the op-id map for rename detection. Drops missing/blank operationIds. */
export function extractOperationMap(ir: IR.Model): OperationMap {
  const out: OperationMap = new Map();
  const paths =
    (ir as { paths?: Record<string, Record<string, unknown>> }).paths ?? {};
  for (const [path, pathItem] of Object.entries(paths)) {
    if (!pathItem) continue;
    for (const method of HTTP_METHODS) {
      const op = pathItem[method] as { operationId?: string } | undefined;
      const id = op?.operationId?.trim();
      if (!id) continue;
      out.set(`${method.toUpperCase()} ${path}`, id);
    }
  }
  return out;
}
