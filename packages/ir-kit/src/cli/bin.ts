#!/usr/bin/env node

import { createRequire } from "node:module";
import { docsCommand } from "./commands/docs.js";
import { fnSchemaDiffCommand } from "./commands/fn-schema-diff.js";
import { fnSchemaExtractCommand } from "./commands/fn-schema-extract.js";
import { fnSchemaInspectCommand } from "./commands/fn-schema-inspect.js";
import { fnSchemaScanCommand } from "./commands/fn-schema-scan.js";
import { generateCommand, watchCommand } from "./commands/generate.js";
import { initCommand } from "./commands/init.js";
import { k6BundleCommand } from "./commands/k6-bundle.js";
import { k6SyncCommand } from "./commands/k6-sync.js";
import { reconCommand } from "./commands/recon.js";
import { sdkAllCommand } from "./commands/sdk-all.js";
import { sdkCommands } from "./commands/sdk-targets.js";
import { specConvertCommand } from "./commands/spec-convert.js";
import { specDiffCommand } from "./commands/spec-diff.js";
import { runCli } from "./runtime.js";

const { version } = createRequire(import.meta.url)("../../package.json") as {
  version: string;
};

await runCli({
  name: "ir",
  version,
  description:
    "Load, convert, diff and document API specs, and generate SDKs, docs and k6 load tests from them.",
  commands: [
    initCommand,
    generateCommand,
    watchCommand,
    specConvertCommand,
    specDiffCommand,
    docsCommand,
    ...sdkCommands,
    sdkAllCommand,
    reconCommand,
    fnSchemaExtractCommand,
    fnSchemaScanCommand,
    fnSchemaInspectCommand,
    fnSchemaDiffCommand,
    k6SyncCommand,
    k6BundleCommand,
  ],
});
