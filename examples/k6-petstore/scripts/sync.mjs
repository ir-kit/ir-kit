import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { sync } from "@ahmedrowaihi/k6-toolkit";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const result = await sync({
  input: resolve(root, "../../fixtures/petstore.yaml"),
  output: resolve(root, "./src/gen"),
  defaultBaseUrl: "https://petstore3.swagger.io/api/v3",
  normalize: true,
  reportRenames: true,
});

console.log(`Wrote ${result.files.length} files to ${result.output}`);
if (result.diff) {
  for (const r of result.diff.renamed) {
    console.warn(`renamed: ${r.method} ${r.path} — ${r.from} → ${r.to}`);
  }
  for (const r of result.diff.removed) {
    console.warn(`removed: ${r.method} ${r.path} — ${r.operationId}`);
  }
}
