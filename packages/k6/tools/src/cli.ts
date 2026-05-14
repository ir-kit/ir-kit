import { defineCommand, runMain } from "citty";

import { initCommand } from "./commands/init.js";
import { runCommand } from "./commands/run.js";
import { syncCommand } from "./commands/sync.js";

const main = defineCommand({
  meta: {
    name: "k6-tools",
    version: "0.0.0",
    description:
      "CLI for the @ahmedrowaihi/k6 framework. Scaffold (init), regenerate the client (sync), bundle + run against the real k6 binary.",
  },
  subCommands: {
    init: initCommand,
    sync: syncCommand,
    run: runCommand,
  },
});

export function run(): void {
  void runMain(main);
}
