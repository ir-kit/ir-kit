#!/usr/bin/env node
import { runWizard } from "./wizard.js";

runWizard(process.cwd()).catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`create-k6 failed: ${msg}`);
  process.exit(1);
});
