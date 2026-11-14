// Deletes (unpublishes) every old @ir-kit/* package that ir-kit replaced.
// @ir-kit/k6 is kept. npm only unpublishes a package that no other public
// package depends on, so dependents go first. Pass --dry to only print.
// Needs `npm login` as the packages' owner.
import { execFileSync } from "node:child_process";

const dry = process.argv.includes("--dry");
const old = [
  "asyncapi-core",
  "asyncapi-loader",
  "asyncapi-typescript",
  "cli",
  "codegen-core",
  "compiler-go",
  "compiler-java",
  "compiler-kotlin",
  "compiler-swift",
  "create-k6",
  "fn-schema-core",
  "fn-schema-loader",
  "fn-schema-transformer",
  "fn-schema-typescript",
  "fn-schema-unplugin",
  "k6-gen",
  "k6-toolkit",
  "openapi",
  "openapi-core",
  "openapi-go",
  "openapi-java",
  "openapi-kotlin",
  "openapi-loader",
  "openapi-recon",
  "openapi-swift",
  "openapi-tools",
  "openapi-ts-faker",
  "openapi-ts-k6",
  "openapi-ts-orpc",
  "openapi-ts-paths",
  "openapi-ts-plugin-kit",
  "openapi-ts-typia",
  "openapi-typescript",
  "schema",
  "spec-convert",
  "spec-diff",
  "spec-docs",
  "spec-loader",
  "typespec-loader",
].map((n) => `@ir-kit/${n}`);

const registry = execFileSync("npm", ["config", "get", "registry"], {
  encoding: "utf8",
})
  .trim()
  .replace(/\/$/, "");
const packument = async (name) => {
  const res = await fetch(`${registry}/${name.replace("/", "%2f")}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${name}: npm registry returned ${res.status}`);
  return res.json();
};

console.log(`Reading ${old.length} packages from ${registry} ...`);
const docs = await Promise.all(old.map(packument));
const deps = new Map();
old.forEach((name, i) => {
  const versions = Object.values(docs[i]?.versions ?? {});
  if (!versions.length) {
    console.log(`skip ${name}: not on npm`);
    return;
  }
  const uses = new Set();
  for (const m of versions)
    for (const field of [
      m.dependencies,
      m.peerDependencies,
      m.optionalDependencies,
    ])
      for (const dep of Object.keys(field ?? {}))
        if (old.includes(dep)) uses.add(dep);
  deps.set(name, uses);
});

// Dependents before the packages they use.
const order = [];
const seen = new Set();
const visit = (name) => {
  if (seen.has(name)) return;
  seen.add(name);
  for (const [other, uses] of deps) if (uses.has(name)) visit(other);
  order.push(name);
};
for (const name of deps.keys()) visit(name);

const failed = [];
for (const name of order) {
  console.log(`${dry ? "would unpublish" : "unpublish"} ${name}`);
  if (dry) continue;
  try {
    execFileSync("npm", ["unpublish", name, "--force"], { stdio: "inherit" });
  } catch {
    failed.push(name);
  }
}
if (failed.length) {
  console.error(`\nnpm refused: ${failed.join(", ")}`);
  console.error(
    "Usually another package still depends on it, or it's over npm's download limit. Re-run to retry.",
  );
  process.exit(1);
}
