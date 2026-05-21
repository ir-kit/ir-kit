import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { runK6 } from "@ir-kit/k6-toolkit";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const stages = process.env.K6_STAGES;
const extraArgs = stages ? ["--stage", stages] : [];

const { exitCode } = await runK6({
  entry: resolve(root, "src/loadtest.ts"),
  baseUrl: "https://petstore3.swagger.io/api/v3",
  bundle: { outDir: resolve(root, "dist") },
  extraArgs,
});

process.exit(exitCode);
