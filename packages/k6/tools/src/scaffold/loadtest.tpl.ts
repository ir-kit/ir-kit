export interface LoadtestTemplateInput {
  /** Generated-client import path (relative). Default `./src/gen/index.js`. */
  clientPath: string;
  /** Auth flavor scaffolded. */
  auth: "none" | "bearer";
  /** Env var name for bearer token. */
  authEnv?: string;
}

/**
 * Static scaffold for the user's `loadtest.ts`. Intentionally hand-written
 * (not AST-built) so the output reads cleanly — this file is the dev's
 * first impression of the framework.
 */
export function renderLoadtest(input: LoadtestTemplateInput): string {
  const authImport = input.auth === "bearer" ? ", useAuth" : "";
  const authBlock =
    input.auth === "bearer"
      ? `\nconst auth = useAuth.bearer({ env: ${JSON.stringify(input.authEnv ?? "API_TOKEN")} });\n`
      : "";
  const authUse = input.auth === "bearer" ? "\n  use: [auth],\n" : "";

  return `import { defineLoadTest, flow, smoke${authImport} } from "@ahmedrowaihi/k6";
import * as api from "${input.clientPath}";
${authBlock}
const lt = defineLoadTest({${authUse}
  pace: smoke({ duration: "30s" }),
  budgets: {
    p95: "500ms",
    errors: "1%",
  },

  flow: flow()
    .step("health", () => {
      // Replace with your real operation, e.g.: api.getHealth()
    }),
});

export const options = lt.options;
export default lt.default;
`;
}

export function renderConfig(spec: string, output: string): string {
  return `import { defineConfig } from "@ahmedrowaihi/k6-tools";

export default defineConfig({
  spec: ${JSON.stringify(spec)},
  output: ${JSON.stringify(output)},
});
`;
}
