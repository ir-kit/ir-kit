import { mkdir, rm, writeFile } from "node:fs/promises";
import {
  basename,
  dirname,
  join,
  parse as parsePath,
  posix as pathPosix,
  resolve,
} from "node:path";

/**
 * Refuse to wipe the current working directory or a filesystem root.
 * `clean: true` runs `rm -rf` on the resolved output directory at the
 * start of `generate()`, which would destroy the user's repo if they
 * pointed `output` at `.` or `/`. Cheap guardrail with no false
 * positives — generators always want output under a dedicated subdir.
 */
export function assertSafeOutputDir(out: string): void {
  const dir = resolve(out);
  if (dir === process.cwd() || dir === parsePath(dir).root) {
    throw new Error(
      `Refusing to clean output directory: ${out} (would wipe cwd or filesystem root). Use a dedicated subdirectory.`,
    );
  }
}

/**
 * Normalize a directory relative to the output root, rejecting absolute
 * paths and anything that climbs out of it with `..`.
 */
export function safeRelativeDir(dir: string): string {
  const normalized = pathPosix.normalize(dir || ".");
  if (
    pathPosix.isAbsolute(normalized) ||
    normalized === ".." ||
    normalized.startsWith("../")
  ) {
    throw new Error(`fileLocation: invalid output directory: ${dir}`);
  }
  return normalized;
}

/**
 * Derive a project name from the output directory's basename, with
 * non-alphanumerics collapsed to dashes. Used as the fallback for
 * Gradle's `rootProject.name` / SwiftPM `Package(name:)` /
 * `module name` defaults. Empty result (e.g. output is `/`) falls
 * back to the literal `"generated-sdk"` so the build files always
 * have a valid name slot.
 */
export function defaultProjectName(outputDir: string): string {
  const base = basename(outputDir).replace(/[^A-Za-z0-9-]+/g, "-");
  return base || "generated-sdk";
}

export interface OutputFile {
  /** Path relative to the output directory. */
  path: string;
  /** File contents. */
  content: string;
}

/**
 * Write `files` under `out`, first wiping `out` unless `clean` is `false`.
 */
export async function writeOutput(
  out: string,
  files: ReadonlyArray<OutputFile>,
  { clean = true }: { clean?: boolean } = {},
): Promise<void> {
  if (clean) {
    assertSafeOutputDir(out);
    await rm(out, { recursive: true, force: true });
  }
  for (const file of files) {
    const full = join(out, file.path);
    await mkdir(dirname(full), { recursive: true });
    await writeFile(full, file.content);
  }
}
