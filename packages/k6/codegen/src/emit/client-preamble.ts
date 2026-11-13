import { $, type TsDsl } from "@hey-api/openapi-ts";

import type { ModuleImport } from "../print.js";
import { defaultImport, namedImport, namespaceImport } from "./ast.js";

export interface ClientPreambleInput {
  defaultBaseUrl: string;
  typeNamespace: string;
  hasTypes: boolean;
}

export interface ClientPreamble {
  imports: ModuleImport[];
  nodes: TsDsl[];
}

export function clientPreamble(input: ClientPreambleInput): ClientPreamble {
  const imports = [
    namespaceImport("http", "k6/http"),
    namedImport(["check", "group", "sleep"], "k6"),
    namedImport(["Counter", "Gauge", "Rate", "Trend"], "k6/metrics"),
    defaultImport("exec", "k6/execution"),
    namedImport(
      [
        "applyMiddlewareHeaders",
        "applyMiddlewareParams",
        "buildQuery",
        "getBaseUrl",
        "installK6Bridge",
        "installMetricsFactory",
        "mergeTags",
        "parseJson",
        "setExecModule",
      ],
      "@ir-kit/k6/runtime",
    ),
  ];
  if (input.hasTypes) {
    imports.push(
      namespaceImport(input.typeNamespace, "./types.js", { typeOnly: true }),
    );
  }

  return {
    imports,
    nodes: [
      $.stmt(
        $("installK6Bridge").call(
          $.object()
            .prop("check", $("check"))
            .prop("group", $("group"))
            .prop("sleep", $("sleep")),
        ),
      ),
      $.stmt($("setExecModule").call($("exec"))),
      metricsInstall(),
      $.const("DEFAULT_BASE_URL")
        .type($.type("string"))
        .assign($.literal(input.defaultBaseUrl)),
      callOptsTypeAlias(),
      ...helperStatements(),
    ],
  };
}

/**
 * Centralized per-request wiring. Each generated op is a one-line wrapper
 * around `call<T>` / `callAsync<T>` / `buildSpec`. Living here (one source of
 * truth) keeps the per-op output short and ensures any change to the request
 * shape lands in one place.
 */
function helperStatements(): TsDsl[] {
  return [requestSpecTypeAlias(), buildSpecFn(), callFn(false), callFn(true)];
}

const nullableString = () => $.type.or($.type("string"), $.type.literal(null));

/** `type RequestSpec = { method: string; url: string; body: string | null; params: Record<string, unknown>; };` */
function requestSpecTypeAlias() {
  return $.type.alias("RequestSpec").type(
    $.type
      .object()
      .prop("method", (p) => p.type($.type("string")))
      .prop("url", (p) => p.type($.type("string")))
      .prop("body", (p) => p.type(nullableString()))
      .prop("params", (p) =>
        p.type($.type("Record").generics($.type("string"), $.type("unknown"))),
      ),
  );
}

/**
 * ```ts
 * function buildSpec(method, url, opId, body, opts?): RequestSpec {
 *   const contentType: Record<string, string> =
 *     body !== null ? { "Content-Type": "application/json" } : {};
 *   return {
 *     method, url, body,
 *     params: {
 *       ...applyMiddlewareParams(),
 *       ...opts,
 *       headers: applyMiddlewareHeaders({ ...contentType, ...opts?.headers }),
 *       tags: mergeTags(opId, opts?.tags),
 *     },
 *   };
 * }
 * ```
 */
function buildSpecFn() {
  const contentType = $.const("contentType")
    .type($.type("Record").generics($.type("string"), $.type("string")))
    .assign(
      $.ternary($("body").neq($.literal(null)))
        .do($.object().prop("Content-Type", $.literal("application/json")))
        .otherwise($.object()),
    );
  const params = $.object()
    .pretty()
    .spread($("applyMiddlewareParams").call())
    .spread($("opts"))
    .prop(
      "headers",
      $("applyMiddlewareHeaders").call(
        $.object()
          .spread($("contentType"))
          .spread($("opts").attr("headers").optional()),
      ),
    )
    .prop(
      "tags",
      $("mergeTags").call($("opId"), $("opts").attr("tags").optional()),
    );
  const spec = $.object()
    .pretty()
    .prop("method", $("method"))
    .prop("url", $("url"))
    .prop("body", $("body"))
    .prop("params", params);
  return callHelperParams($.func("buildSpec"))
    .returns($.type("RequestSpec"))
    .do(contentType, $.return(spec));
}

/**
 * ```ts
 * function call<T>(method, url, opId, body, opts?): T { ... return parseJson(http.request(...)) as T; }
 * async function callAsync<T>(method, url, opId, body, opts?): Promise<T> { ... }
 * ```
 */
function callFn(asyncCall: boolean) {
  const spec = (name: string) => $("spec").attr(name);
  const request = $("http")
    .attr(asyncCall ? "asyncRequest" : "request")
    .call(spec("method"), spec("url"), spec("body"), spec("params"));
  const buildSpec = $.const("spec").assign(
    $("buildSpec").call($("method"), $("url"), $("opId"), $("body"), $("opts")),
  );
  const parsed = $.return(
    $("parseJson")
      .call(asyncCall ? $("res") : request)
      .as($.type("T")),
  );
  return callHelperParams($.func(asyncCall ? "callAsync" : "call"))
    .async(asyncCall)
    .generic("T")
    .returns(asyncCall ? $.type("Promise").generic($.type("T")) : $.type("T"))
    .do(
      buildSpec,
      ...(asyncCall ? [$.const("res").assign($.await(request))] : []),
      parsed,
    );
}

/** Parameter list shared by `buildSpec` / `call` / `callAsync`. */
function callHelperParams(fn: ReturnType<typeof $.func>) {
  return fn
    .param("method", (p) => p.type($.type("string")))
    .param("url", (p) => p.type($.type("string")))
    .param("opId", (p) => p.type($.type("string")))
    .param("body", (p) => p.type(nullableString()))
    .param("opts", (p) => p.optional().type($.type("CallOpts")));
}

/**
 * Emit:
 * ```ts
 * installMetricsFactory((kind, name) =>
 *   new ({ counter: Counter, gauge: Gauge, rate: Rate, trend: Trend }[kind])(name)
 * );
 * ```
 */
function metricsInstall() {
  const ctors = $.object()
    .prop("counter", $("Counter"))
    .prop("gauge", $("Gauge"))
    .prop("rate", $("Rate"))
    .prop("trend", $("Trend"));
  const kind = $.type.or(
    $.type.literal("counter"),
    $.type.literal("gauge"),
    $.type.literal("rate"),
    $.type.literal("trend"),
  );
  return $.stmt(
    $("installMetricsFactory").call(
      $.func()
        .param("kind", (p) => p.type(kind))
        .param("name", (p) => p.type($.type("string")))
        .do($.return($.new($.attr(ctors, "kind").computed(), $("name")))),
    ),
  );
}

/**
 * `CallOpts` — per-request override. Headers/tags merged with middleware;
 * timeout/redirects/compression/responseType/responseCallback pass through
 * directly to k6's request params.
 */
function callOptsTypeAlias() {
  const stringRecord = () =>
    $.type("Record").generics($.type("string"), $.type("string"));
  return $.type
    .alias("CallOpts")
    .export()
    .type(
      $.type
        .object()
        .prop("headers", (p) => p.optional().type(stringRecord()))
        .prop("tags", (p) => p.optional().type(stringRecord()))
        .prop("timeout", (p) =>
          p.optional().type($.type.or($.type("string"), $.type("number"))),
        )
        .prop("redirects", (p) => p.optional().type($.type("number")))
        .prop("compression", (p) => p.optional().type($.type("string")))
        .prop("responseType", (p) =>
          p
            .optional()
            .type(
              $.type.or(
                $.type.literal("text"),
                $.type.literal("binary"),
                $.type.literal("none"),
              ),
            ),
        ),
    );
}
