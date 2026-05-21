#!/usr/bin/env node

import { docsCommand } from "./commands/docs.js";
import { fnSchemaDiffCommand } from "./commands/fn-schema-diff.js";
import { fnSchemaExtractCommand } from "./commands/fn-schema-extract.js";
import { fnSchemaInspectCommand } from "./commands/fn-schema-inspect.js";
import { fnSchemaScanCommand } from "./commands/fn-schema-scan.js";
import { k6BundleCommand } from "./commands/k6-bundle.js";
import { k6SyncCommand } from "./commands/k6-sync.js";
import { reconCommand } from "./commands/recon.js";
import { sdkAllCommand } from "./commands/sdk-all.js";
import { sdkGoCommand } from "./commands/sdk-go.js";
import { sdkK6Command } from "./commands/sdk-k6.js";
import { sdkKotlinCommand } from "./commands/sdk-kotlin.js";
import { sdkSwiftCommand } from "./commands/sdk-swift.js";
import { sdkTypescriptCommand } from "./commands/sdk-typescript.js";
import { specConvertCommand } from "./commands/spec-convert.js";
import { runCli } from "./runtime.js";

await runCli({
  name: "ir",
  version: "0.1.0",
  description:
    "Universal API toolkit — load, convert, generate across every spec standard.",
  commands: [
    specConvertCommand,
    docsCommand,
    sdkGoCommand,
    sdkKotlinCommand,
    sdkSwiftCommand,
    sdkTypescriptCommand,
    sdkK6Command,
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
