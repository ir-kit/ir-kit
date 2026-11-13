// Run once after ir-kit is on npm: marks the old @ir-kit/* packages as
// deprecated with a pointer to the ir-kit subpath that replaced them.
// Needs an npm login with publish rights. Pass --dry to only print.
import { execFileSync } from "node:child_process";

const moved = {
  "@ir-kit/cli": "ir-kit (the `ir` command)",
  "@ir-kit/spec-loader": "ir-kit/spec",
  "@ir-kit/spec-convert": "ir-kit/spec",
  "@ir-kit/spec-diff": "ir-kit/spec",
  "@ir-kit/spec-docs": "ir-kit/spec",
  "@ir-kit/openapi-loader": "ir-kit/spec/openapi",
  "@ir-kit/asyncapi-loader": "ir-kit/spec/asyncapi",
  "@ir-kit/typespec-loader": "ir-kit/spec/typespec",
  "@ir-kit/openapi-go": "ir-kit/sdk/go",
  "@ir-kit/openapi-java": "ir-kit/sdk/java",
  "@ir-kit/openapi-kotlin": "ir-kit/sdk/kotlin",
  "@ir-kit/openapi-swift": "ir-kit/sdk/swift",
  "@ir-kit/openapi-typescript": "ir-kit/sdk/typescript",
  "@ir-kit/k6-gen": "ir-kit/sdk/k6",
  "@ir-kit/asyncapi-typescript": "ir-kit/sdk/asyncapi",
  "@ir-kit/codegen-core": "ir-kit/codegen",
  "@ir-kit/schema": "ir-kit/schema",
  "@ir-kit/openapi": "ir-kit/openapi",
  "@ir-kit/openapi-tools": "ir-kit/openapi-tools",
  "@ir-kit/asyncapi-core": "ir-kit/asyncapi",
  "@ir-kit/openapi-ts-faker": "ir-kit/openapi-ts/faker",
  "@ir-kit/openapi-ts-orpc": "ir-kit/openapi-ts/orpc",
  "@ir-kit/openapi-ts-paths": "ir-kit/openapi-ts/paths",
  "@ir-kit/openapi-ts-typia": "ir-kit/openapi-ts/typia",
  "@ir-kit/openapi-ts-plugin-kit": "ir-kit/openapi-ts/kit",
  "@ir-kit/openapi-ts-k6": "ir-kit/openapi-ts/k6",
  "@ir-kit/fn-schema-core": "ir-kit/fn-schema",
  "@ir-kit/fn-schema-loader": "ir-kit/fn-schema/loader",
  "@ir-kit/fn-schema-transformer": "ir-kit/fn-schema/transformer",
  "@ir-kit/fn-schema-typescript": "ir-kit/fn-schema/typescript",
  "@ir-kit/fn-schema-unplugin": "ir-kit/fn-schema/unplugin",
  "@ir-kit/k6-toolkit": "ir-kit/k6-toolkit",
  "@ir-kit/openapi-recon": "ir-kit/recon",
  "@ir-kit/compiler-go": "ir-kit/sdk/go",
  "@ir-kit/compiler-java": "ir-kit/sdk/java",
  "@ir-kit/compiler-kotlin": "ir-kit/sdk/kotlin",
  "@ir-kit/compiler-swift": "ir-kit/sdk/swift",
};

const dry = process.argv.includes("--dry");
for (const [name, target] of Object.entries(moved)) {
  const message = `Moved into the ir-kit package. Install ir-kit and use ${target}.`;
  console.log(`${name}: ${message}`);
  if (!dry)
    execFileSync("npm", ["deprecate", name, message], { stdio: "inherit" });
}
