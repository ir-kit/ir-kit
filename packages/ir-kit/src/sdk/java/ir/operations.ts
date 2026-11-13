import { type Namespace, pascal } from "../../../codegen/index.js";
import type { IR } from "../../../ir/index.js";
import { groupOperationsByTag } from "../../../openapi/index.js";

import {
  isVoid,
  type JEmitted,
  type JMethod,
  type JType,
  jExprStmt,
  jIdent,
  jInterface,
  jMethod,
  jMethodCall,
  jReturn,
} from "../ast/index.js";
import { javaTypeIdent, newTypeNames } from "./identifiers.js";
import { buildClientClass, withResponseType } from "./impl/index.js";
import {
  type OperationSignature,
  operationSignature,
  optionsParam,
} from "./operation/signature.js";

export interface OperationsOptions {
  defaultTag?: string;
  interfaceName?: (tag: string) => string;
  clientClassName?: (interfaceName: string) => string;
  interfaceOnly?: boolean;
  names?: Namespace;
}

export interface OperationsResult {
  decls: JEmitted[];
  needsMultipart: boolean;
}

export function operationsToDecls(
  paths: IR.Paths | undefined,
  opts: OperationsOptions = {},
): OperationsResult {
  const defaultTag = opts.defaultTag ?? "Default";
  const interfaceName =
    opts.interfaceName ?? ((tag) => javaTypeIdent(`${tag} Api`));
  const clientClassName = opts.clientClassName ?? ((i) => `Http${i}`);
  const names = opts.names ?? newTypeNames();
  const decls: JEmitted[] = [];
  const emit = (d: JEmitted) => decls.push(d);

  const byTag = groupOperationsByTag(
    paths,
    defaultTag,
    ({ pathStr, method, op }) =>
      operationSignature(op, method, pathStr, emit, names),
  );

  let needsMultipart = false;
  for (const [tag, sigs] of byTag) {
    const ifaceName = names.claim(`api:${tag}`, interfaceName(tag));
    decls.push(
      jInterface({
        name: ifaceName,
        api: true,
        methods: sigs.flatMap((sig) => [
          ...interfaceMethods(sig, sig.name, sig.returnType),
          ...interfaceMethods(
            sig,
            `${sig.name}WithResponse`,
            withResponseType(sig.returnType),
          ),
        ]),
      }),
    );
    if (!opts.interfaceOnly) {
      const impl = buildClientClass(
        names.claim(`impl:${tag}`, clientClassName(ifaceName)),
        ifaceName,
        sigs,
      );
      decls.push(impl.class);
      if (impl.needsMultipart) needsMultipart = true;
    }
  }
  return { decls, needsMultipart };
}

function interfaceMethods(
  sig: OperationSignature,
  name: string,
  returnType: JType,
): JMethod[] {
  const forwarded = jMethodCall(jIdent("this"), name, [
    ...sig.params.map((p) => jIdent(p.name)),
    jMethodCall(jIdent("RequestOptions"), "defaults"),
  ]);
  return [
    jMethod({
      name,
      params: [...sig.params, optionsParam()],
      returnType,
      doc: sig.doc,
    }),
    jMethod({
      name,
      params: sig.params,
      returnType,
      modifiers: ["default"],
      body: [isVoid(returnType) ? jExprStmt(forwarded) : jReturn(forwarded)],
    }),
  ];
}
