---
"@ir-kit/asyncapi-typescript": major
---

Generate `types.gen.ts` with `@hey-api/openapi-ts` instead of `@asyncapi/modelina`. Component schemas keep their spec names and `allOf` stays an intersection, instead of Modelina's invented names like `OneOf_0AllOf_1Subscription`. Free-form objects become `{ [key: string]: unknown }` instead of `Map<string, any>`, enums become string-literal unions, and schema descriptions carry over as doc comments. The output now passes `isolatedModules` / `verbatimModuleSyntax`. Breaking: declarations are `type` aliases instead of `interface`/`enum`, nested anonymous objects are inlined, and the peer dependency `@asyncapi/modelina` is replaced by `@hey-api/openapi-ts >=0.99.0`. The `event-map` plugin's `messageSuffix` option, already ignored, is removed; set it on the `typescript` plugin.
