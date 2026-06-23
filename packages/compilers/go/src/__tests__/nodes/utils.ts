import fs from 'node:fs';
import path from 'node:path';

import { go } from '../../index';
import type { GoSourceFile } from '../../nodes/structure/source-file';
import { snapshotsDir, tmpDir } from '../constants';

function getCallerFile(): string {
  const error = new Error();
  const stack = (error.stack ?? '').split('\n');
  const callerLine = stack.find((line) => line.includes('.test.ts'));
  if (!callerLine) {
    throw new Error('Could not find test file in stack trace');
  }
  const match = callerLine.match(/\(([^)]+)\)/) || callerLine.match(/at (.+):\d+:\d+/);
  if (!match?.[1]) {
    throw new Error('Could not extract file path');
  }
  return match[1];
}

export async function assertPrintedMatchesSnapshot(file: GoSourceFile, filename: string) {
  const result = go.createPrinter().printFile(file);

  const caller = getCallerFile();
  const relPath = path
    .relative(path.join(process.cwd(), 'src', 'go-compiler', '__tests__'), caller)
    .replace(/\.test\.ts$/, '');
  const filenameWithoutExt = path.basename(filename, '.go');
  const outputPath = path.join(tmpDir, relPath, filenameWithoutExt, filename);
  const outputDir = path.dirname(outputPath);

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, result);

  const snapshotPath = path.join(snapshotsDir, relPath, filenameWithoutExt, filename);
  await expect(result).toMatchFileSnapshot(snapshotPath);
}
