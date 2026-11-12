import { resolve } from "node:path";

import { defaultProjectName, writeOutput } from "@ir-kit/codegen-core";
import {
  extractSecuritySchemeNames,
  type NormalizeOptions,
} from "@ir-kit/openapi";
import { loadOpenAPI } from "@ir-kit/openapi-loader";
import { parseSpec } from "@ir-kit/openapi-tools/parse";

import { resolveAliases } from "./ir/aliases.js";
import { newTypeNames } from "./ir/identifiers.js";
import { type OperationsOptions, operationsToDecls } from "./ir/operations.js";
import { buildRuntimeFiles } from "./ir/runtime/index.js";
import { schemasToDecls } from "./ir/schema.js";
import {
  type BuildOptions,
  type BuiltFile,
  buildJavaProject,
  DEFAULT_PACKAGE,
  subPackage,
} from "./project/build.js";
import {
  buildGradleFile,
  type GradleOptions,
  settingsGradleFile,
} from "./project/gradle.js";

export interface GenerateOptions
  extends BuildOptions,
    Omit<OperationsOptions, "securitySchemeNames" | "names"> {
  input: string | Record<string, unknown>;
  output: string;
  clean?: boolean;
  gradle?: boolean | GradleOptions;
  normalize?: boolean | NormalizeOptions;
}

export interface GenerateResult {
  files: BuiltFile[];
  output: string;
}

export async function generate(opts: GenerateOptions): Promise<GenerateResult> {
  const bundled = await loadOpenAPI({
    input: opts.input,
    normalize: opts.normalize,
  });
  const ir = parseSpec(bundled);
  const names = newTypeNames();
  for (const runtime of [
    "ApiClient",
    "ApiException",
    "ApiInterceptors",
    "ApiKeyLocation",
    "ApiResult",
    "Auth",
    "MultipartFormBody",
    "QueryStyle",
    "RequestOptions",
    "UrlEncoding",
  ]) {
    names.claim(`runtime:${runtime}`, runtime);
  }

  const schemaDecls = schemasToDecls(ir.components?.schemas ?? {}, names);
  const ops = operationsToDecls(ir.paths, {
    defaultTag: opts.defaultTag,
    interfaceName: opts.interfaceName,
    clientClassName: opts.clientClassName,
    interfaceOnly: opts.interfaceOnly,
    securitySchemeNames: extractSecuritySchemeNames(bundled),
    names,
  });
  const decls = resolveAliases([...schemaDecls, ...ops.decls]);
  const pkg = opts.packageName ?? DEFAULT_PACKAGE;
  const runtimePkg = subPackage(pkg, opts.layout, "runtime");
  const files: BuiltFile[] = [
    ...buildJavaProject(decls, opts),
    ...buildRuntimeFiles({ hasMultipart: ops.needsMultipart }, runtimePkg).map(
      (rf) => ({
        path: `${runtimePkg.replace(/\./g, "/")}/${rf.name}`,
        content: rf.content,
      }),
    ),
  ];

  const out = resolve(opts.output);
  if (opts.gradle) {
    const sourceRoot = "src/main/java/";
    for (const f of files) f.path = sourceRoot + f.path;
    files.push(
      buildGradleFile(typeof opts.gradle === "object" ? opts.gradle : {}),
    );
    files.push(settingsGradleFile(defaultProjectName(out)));
  }
  await writeOutput(out, files, { clean: opts.clean });
  return { files, output: out };
}
