import {
  $,
  type MaybeTsDsl,
  type TsDsl,
  type TypeTsDsl,
} from "@hey-api/openapi-ts";
import type { IR } from "../../../ir/index.js";
import type { TypeExpr } from "../dsl.js";
import {
  schemaToTypeNode,
  toIdent,
  type WalkedOperation,
  walkOperations,
} from "../ir/index.js";
import { GENERATED_HEADER, printModule } from "../print.js";
import { clientPreamble } from "./client-preamble.js";
import { bodyArg, urlExpression } from "./operation-expressions.js";

type Func = ReturnType<typeof $.func>;

/** Namespace alias for type imports — generated client emits `T.Pet`. */
const TYPE_NAMESPACE = "T";

function typed(schema: IR.Schema): TypeExpr {
  return schemaToTypeNode(schema, {
    typeNamespace: TYPE_NAMESPACE,
  });
}

function returnType(op: WalkedOperation): TypeExpr {
  return op.successSchema ? typed(op.successSchema) : $.type("void");
}

export interface ClientEmitOptions {
  defaultBaseUrl?: string;
  schemaNames?: ReadonlyArray<string>;
}

/**
 * Emit the generated client file. Per-op output is one-line wrappers around
 * preamble helpers (`call`/`callAsync`/`buildSpec`); see `client-preamble.ts`
 * for the helpers themselves.
 */
export function emitClientFile(
  paths: IR.Paths | undefined,
  opts: ClientEmitOptions = {},
): string {
  const preamble = clientPreamble({
    defaultBaseUrl: opts.defaultBaseUrl ?? "",
    typeNamespace: TYPE_NAMESPACE,
    hasTypes: (opts.schemaNames?.length ?? 0) > 0,
  });
  const operations = Array.from(walkOperations(paths));
  return printModule({
    header: GENERATED_HEADER,
    imports: preamble.imports,
    nodes: [
      ...preamble.nodes,
      ...operations.map((op) => operationFn(op, false)),
      ...operations.map((op) => operationFn(op, true)),
      ...operations.map(specAssignment),
      asyncNamespaceExport(operations),
    ],
  });
}

/**
 * `export function getPet(...): Pet { return call<Pet>(...); }`, or the
 * internal `async function getPet_async(...): Promise<Pet>` variant.
 */
function operationFn(op: WalkedOperation, asyncCall: boolean): TsDsl {
  const type = returnType(op);
  const fn = withParams(
    $.func(asyncCall ? asyncInternalName(op) : toIdent(op.id)),
    op,
  )
    .async(asyncCall)
    .returns(asyncCall ? $.type("Promise").generic(type) : type)
    .do(
      $.return(requestCall(op, asyncCall ? "callAsync" : "call").generic(type)),
    );
  return asyncCall ? fn : fn.export();
}

function asyncInternalName(op: WalkedOperation): string {
  return `${toIdent(op.id)}_async`;
}

/** `call("GET", url, "getPet", null, opts)` against one of the preamble helpers. */
function requestCall(
  op: WalkedOperation,
  helper: "buildSpec" | "call" | "callAsync",
) {
  return $(helper).call(
    $.literal(op.method.toUpperCase()),
    urlExpression(op),
    $.literal(op.id),
    bodyArg(op),
    $("opts"),
  );
}

/**
 * `getPet.spec = (args, opts?) => buildSpec("GET", url, "getPet", null, opts);`
 *
 * Lets users drop to raw `http.request(spec.method, spec.url, spec.body,
 * spec.params)` with all the wiring done — keeping access to the raw Response
 * for status checks, timings, `http.batch()` composition, etc.
 */
function specAssignment(op: WalkedOperation): TsDsl {
  return $.stmt(
    $(toIdent(op.id))
      .attr("spec")
      .assign(
        withParams($.func(), op).do($.return(requestCall(op, "buildSpec"))),
      ),
  );
}

/**
 * Shared parameter list for sync/async/spec emit — all three present the same
 * signature to the user. (path params, optional query, optional body, opts).
 */
function withParams<F extends Func>(fn: F, op: WalkedOperation): F {
  for (const p of op.pathParams) {
    fn.param(toIdent(p.name), (param) => param.type(typed(p.schema)));
  }
  if (op.queryParams.length) {
    const query = $.type.object();
    for (const p of op.queryParams) {
      query.prop(p.name, (prop) => {
        if (!p.required) prop.optional();
        prop.type(typed(p.schema));
      });
    }
    fn.param("query", (param) => {
      if (op.queryParams.every((p) => !p.required)) param.optional();
      param.type(query);
    });
  }
  const body = op.body;
  if (body) {
    fn.param("body", (param) => {
      if (!body.required) param.optional();
      param.type(typed(body.schema));
    });
  }
  fn.param("opts", (param) => param.optional().type($.type("CallOpts")));
  return fn;
}

/**
 * Emit:
 *
 * ```ts
 * export const async = {
 *   getPet: getPet_async,
 *   addPet: addPet_async,
 *   // ...
 * };
 * ```
 */
function asyncNamespaceExport(
  operations: ReadonlyArray<WalkedOperation>,
): TsDsl {
  const props = $.object().pretty();
  for (const op of operations)
    props.prop(toIdent(op.id), $(asyncInternalName(op)));
  return $.const("async").export().assign(props);
}
