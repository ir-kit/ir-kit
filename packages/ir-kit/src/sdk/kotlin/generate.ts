import { resolve } from "node:path";

import { defaultProjectName, writeOutput } from "../../codegen/index.js";
import type { NormalizeOptions } from "../../openapi/index.js";
import { parseForCodegen } from "../../openapi-tools/parse.js";
import { loadOpenAPI } from "../../spec/openapi/index.js";
import { newTypeNames } from "./ir/identifiers.js";
import {
  aliasesOf,
  type OperationsOptions,
  operationsToDecls,
  schemasToDecls,
} from "./ir/index.js";
import { buildRuntimeFiles } from "./ir/runtime/index.js";
import {
  type BuildOptions,
  type BuiltFile,
  buildGradleFile,
  buildKotlinProject,
  type GradleOptions,
  settingsGradleFile,
} from "./project/index.js";

/**
 * Operations options the consumer can pass through `generate()`. The
 * orchestrator owns `securitySchemeNames` (extracted from the bundled
 * spec), so it's stripped from the public surface.
 */
type ForwardedOperationsOptions = Omit<
  OperationsOptions,
  "securitySchemeNames"
>;

export interface GenerateOptions
  extends BuildOptions,
    ForwardedOperationsOptions {
  /**
   * The OpenAPI spec source: a filesystem path, http(s) URL, or a
   * pre-parsed object. YAML and JSON inputs both work. External
   * `$ref`s are bundled inline; the spec is normalized to hey-api IR
   * before generation, so 2.0 / 3.0 / 3.1 inputs all produce the same
   * output shape.
   */
  input: string | Record<string, unknown>;
  /** Directory the SDK is written to (created if missing). */
  output: string;
  /** Wipe `output` before writing. Default: `true`. */
  clean?: boolean;
  /**
   * When set, emit a `build.gradle.kts` + `settings.gradle.kts` at the
   * output root so the SDK is a self-contained Gradle library. Pass
   * `true` for sensible defaults (project name keyed off the output
   * dir basename) or a `GradleOptions` object for fine-grained
   * control. Default: omitted — the output is just the Kotlin source
   * tree, ready to drop into an existing Gradle module.
   */
  gradle?: boolean | GradleOptions;
  /** Pre-codegen spec normalization. `true` enables the safe preset. */
  normalize?: boolean | NormalizeOptions;
}

export interface GenerateResult {
  files: BuiltFile[];
  output: string;
}

export async function generate(opts: GenerateOptions): Promise<GenerateResult> {
  const { ir, securitySchemeNames } = parseForCodegen(
    await loadOpenAPI({ input: opts.input, normalize: opts.normalize }),
  );
  const names = newTypeNames();

  const schemaDecls = schemasToDecls(ir.components?.schemas ?? {}, names);
  const opsResult = operationsToDecls(ir.paths, {
    defaultTag: opts.defaultTag,
    interfaceName: opts.interfaceName,
    clientClassName: opts.clientClassName,
    interfaceOnly: opts.interfaceOnly,
    openImpl: opts.openImpl,
    securitySchemeNames,
    names,
    aliases: new Map(aliasesOf(schemaDecls)),
  });
  const decls = [...schemaDecls, ...opsResult.decls];
  const sdkFiles = buildKotlinProject(decls, opts);

  const pkg = opts.packageName ?? "com.example.api";
  const apiSubDir = (opts.layout ?? "split") === "flat" ? "" : "api";
  const runtimeFiles = buildRuntimeFiles(
    { hasMultipart: opsResult.needsMultipart },
    runtimeSubPackage(pkg, apiSubDir),
  ).map((rf) => ({
    path: runtimePath(pkg, apiSubDir, rf.name),
    content: rf.content,
  }));

  const files: BuiltFile[] = [...sdkFiles, ...runtimeFiles];
  const out = resolve(opts.output);

  if (opts.gradle) {
    const sourceRoot = "src/main/kotlin/";
    for (const f of files) f.path = sourceRoot + f.path;
    const gradleOpts =
      typeof opts.gradle === "object" ? opts.gradle : ({} as GradleOptions);
    files.push(buildGradleFile(gradleOpts));
    files.push(settingsGradleFile(defaultProjectName(out)));
  }

  await writeOutput(out, files, { clean: opts.clean });
  return { files, output: out };
}

function runtimeSubPackage(rootPkg: string, dir: string): string {
  if (dir === "") return rootPkg;
  return `${rootPkg}.${dir}`;
}

function runtimePath(rootPkg: string, dir: string, name: string): string {
  const pkgPath = rootPkg.replace(/\./g, "/");
  return dir === "" ? `${pkgPath}/${name}` : `${pkgPath}/${dir}/${name}`;
}
