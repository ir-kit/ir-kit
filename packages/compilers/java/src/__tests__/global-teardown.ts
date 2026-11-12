import fs from "node:fs";

import { tmpDir } from "./constants.js";

export function teardown() {
  fs.rmSync(tmpDir, { force: true, recursive: true });
}
