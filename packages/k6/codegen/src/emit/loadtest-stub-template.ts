import { $, type CallArgs } from "@hey-api/openapi-ts";

import { GENERATED_HEADER, printModule } from "../print.js";
import {
  defaultExportProp,
  namedImport,
  namespaceImport,
  reExportConst,
} from "./ast.js";

export interface LoadtestStubInput {
  fnName: string;
  summary: string;
  clientImport: string;
  dataImport: string;
  callArgs: ReadonlyArray<NonNullable<CallArgs[number]>>;
}

export function renderLoadtestStub(input: LoadtestStubInput): string {
  const header = `${GENERATED_HEADER}\n//\n// Stub loadtest for \`${input.fnName}\` — ${input.summary}.\n// Fill in pace, budgets, and assertions. Safe to edit.`;

  return printModule({
    header,
    imports: [
      namedImport(["defineLoadTest", "flow", "smoke"], "@ir-kit/k6"),
      namespaceImport("api", input.clientImport),
      namedImport(["data"], input.dataImport),
    ],
    nodes: [
      defineLoadTestConst(input),
      reExportConst("options", "lt", "options"),
    ],
    footer: defaultExportProp("lt", "default"),
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
