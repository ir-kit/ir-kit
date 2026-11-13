import type { IR } from "@hey-api/shared";
import { type Namespace, safeIdent } from "../../../codegen/index.js";
import { groupOperationsByTag } from "../../../openapi/index.js";

import {
  type GoDecl,
  type GoFuncResult,
  type GoMethodSignature,
  type GoType,
  goError,
  goFuncResult,
  goInterface,
  goMethodSig,
  goPtr,
  goRef,
} from "../ast/index.js";
import { exportedIdent, newTypeNames, tagFileName } from "./identifiers.js";
import { buildClientStruct } from "./impl/index.js";
import {
  type OperationSignature,
  operationSignature,
} from "./operation/index.js";

export interface OperationsOptions {
  /** Default: `"Default"`. */
  defaultTag?: string;
  /** Default: `(tag) => `${PascalCase(tag)}API``. */
  interfaceName?: (tag: string) => string;
  /** Default: `(interfaceName) => `NetHTTP${interfaceName}``. */
  clientStructName?: (interfaceName: string) => string;
  /** Skip emitting the impl struct. Default: `false`. */
  interfaceOnly?: boolean;
  /** Per-operation security-scheme names. See swift / kotlin generators. */
  securitySchemeNames?: ReadonlyMap<string, ReadonlyArray<string>>;
  /** Shared type-name owner; pass the one used for `schemasToDecls`. */
  names?: Namespace;
}

export interface OperationsResult {
  decls: GoDecl[];
  needsMultipart: boolean;
  needsAuth: boolean;
}

/**
 * Translate `IR.Model.paths` into Go interfaces (one per tag) +
 * matching `net/http`-backed impl structs. Inline body / response /
 * param schemas are promoted to top-level decls in the same array.
 *
 * Each operation produces two methods: `<Op>` returning the decoded
 * payload, and `<Op>WithResponse` additionally returning the raw
 * `*http.Response`. Go has no method overloading, so they're separate
 * named methods.
 */
export function operationsToDecls(
  paths: IR.PathsObject | undefined,
  opts: OperationsOptions = {},
): OperationsResult {
  const defaultTag = opts.defaultTag ?? "Default";
  const interfaceName =
    opts.interfaceName ?? ((tag: string) => `${exportedIdent(tag)}API`);
  const clientStructName =
    opts.clientStructName ?? ((p: string) => `NetHTTP${p}`);

  const decls: GoDecl[] = [];
  const emit = (d: GoDecl) => decls.push(d);
  const names = opts.names ?? newTypeNames();
  const byTag = groupOperationsByTag(
    paths,
    opts.securitySchemeNames,
    defaultTag,
    ({ pathStr, method, op, schemeNames }) =>
      operationSignature(op, method, pathStr, emit, schemeNames, names),
  );

  let needsMultipart = false;
  let needsAuth = false;
  for (const [tag, sigs] of byTag) {
    const ifaceName = interfaceName(tag);
    const file = tagFileName(tag);
    decls.push({
      file,
      ...goInterface({
        name: ifaceName,
        methods: sigs.flatMap((sig) => [
          buildInterfaceMethod(sig, /* withResponse */ false),
          buildInterfaceMethod(sig, /* withResponse */ true),
        ]),
      }),
    });
    if (sigs.some(hasSecurity)) needsAuth = true;
    if (!opts.interfaceOnly) {
      const result = buildClientStruct(clientStructName(ifaceName), sigs);
      for (const d of result.decls) decls.push({ ...d, file });
      if (result.needsMultipart) needsMultipart = true;
    }
  }
  return { decls, needsMultipart, needsAuth };
}

function buildInterfaceMethod(
  sig: OperationSignature,
  withResponse: boolean,
): GoMethodSignature {
  const name = withResponse ? `${sig.name}WithResponse` : sig.name;
  const results: GoFuncResult[] = [];
  if (sig.returnType) results.push(goFuncResult(sig.returnType));
  if (withResponse) results.push(goFuncResult(goPtr(goRef("http.Response"))));
  results.push(goFuncResult(goError));
  return goMethodSig(
    name,
    sig.params.map((p) => ({ name: p.name, type: p.type })),
    results,
    sig.doc,
  );
}

function hasSecurity(sig: OperationSignature): boolean {
  return sig.securitySchemeNames.length > 0;
}
