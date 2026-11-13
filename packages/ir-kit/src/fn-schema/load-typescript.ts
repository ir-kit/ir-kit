import { loadOptional } from "../optional.js";

export const loadTypescriptExtractor = async () =>
  (
    await loadOptional(() => import("./typescript/index.js"), "fn-schema", [
      "ts-morph",
      "ts-json-schema-generator",
    ])
  ).typescript;
