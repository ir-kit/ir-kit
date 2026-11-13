import { $ } from "@hey-api/openapi-ts";

import type { Expr } from "../dsl.js";

import { GENERATED_HEADER } from "../print.js";
import { namedImport, namespaceImport, printLoadtest } from "./ast.js";

export interface LoadtestStubInput {
  fnName: string;
  summary: string;
  clientImport: string;
  dataImport: string;
  callArgs: ReadonlyArray<Expr>;
}

export function renderLoadtestStub(input: LoadtestStubInput): string {
  const header = `${GENERATED_HEADER}\n//\n// Stub loadtest for \`${input.fnName}\` — ${input.summary}.\n// Fill in pace, budgets, and assertions. Safe to edit.`;

  return printLoadtest({
    header,
    imports: [
      namedImport(["defineLoadTest", "flow", "smoke"], "@ir-kit/k6"),
      namespaceImport("api", input.clientImport),
      namedImport(["data"], input.dataImport),
    ],
    nodes: [defineLoadTestConst(input)],
  });
}

function defineLoadTestConst(input: LoadtestStubInput) {
  const step = $.func().do(
    $.stmt(
      $("api")
        .attr(input.fnName)
        .call(...input.callArgs),
    ),
  );
  const config = $.object()
    .pretty()
    .prop(
      "scenario",
      $("smoke").call($.object().prop("duration", $.literal("30s"))),
    )
    .prop(
      "budgets",
      $.object()
        .pretty()
        .prop("p95", $.literal("500ms"))
        .prop("errors", $.literal("1%")),
    )
    .prop(
      "flow",
      $("flow").call().attr("step").call($.literal(input.fnName), step),
    );
  return $.const("lt").assign($("defineLoadTest").call(config));
}
