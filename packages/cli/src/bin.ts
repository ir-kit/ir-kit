#!/usr/bin/env node

import { specConvertCommand } from "./commands/spec-convert.js";
import { runCli } from "./runtime.js";

await runCli({
  name: "ir",
  version: "0.1.0",
  description:
    "Universal API toolkit — load, convert, generate across every spec standard.",
  commands: [specConvertCommand],
});
