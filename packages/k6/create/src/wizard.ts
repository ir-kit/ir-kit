import { type AuthFlavor, init } from "@ahmedrowaihi/k6-toolkit";
import {
  cancel,
  confirm,
  intro,
  isCancel,
  outro,
  select,
  text,
} from "@clack/prompts";

interface Answers {
  cwd: string;
  spec: string;
  output: string;
  auth: AuthFlavor;
  scaffoldStubs: boolean;
}

export async function runWizard(cwd: string = process.cwd()): Promise<void> {
  intro("create-k6 — scaffold a load-test project");

  const answers = await collectAnswers(cwd);
  if (!answers) return;

  const result = await init({
    cwd: answers.cwd,
    input: answers.spec,
    output: answers.output,
    auth: answers.auth,
    scaffold: answers.scaffoldStubs,
    noOverwrite: true,
  });

  const stubCount = result.generated.files.filter((f) =>
    f.path.startsWith("loadtests/"),
  ).length;
  const summary = [
    `Wrote ${result.generated.files.length} files to ${answers.output}.`,
    `Loadtest entry: ${answers.cwd}/loadtest.ts`,
    stubCount > 0 ? `Per-op stubs: ${stubCount}` : null,
    "Next: edit loadtest.ts, then run it via @ahmedrowaihi/k6-toolkit `runK6()`.",
  ].filter(Boolean);
  outro(summary.join("\n"));
}

async function collectAnswers(cwd: string): Promise<Answers | null> {
  const spec = await text({
    message: "Path or URL to your OpenAPI spec?",
    placeholder: "./openapi.yaml or https://api.example.com/openapi.yaml",
    validate: (v) => (v && v.trim().length ? undefined : "Required"),
  });
  if (isCancel(spec)) return bail();

  const output = await text({
    message: "Where should the typed client land?",
    initialValue: "./src/gen",
  });
  if (isCancel(output)) return bail();

  const auth = (await select({
    message: "Auth flavor for the loadtest starter?",
    options: [
      { value: "none", label: "None — public API or custom middleware later" },
      { value: "bearer", label: "Bearer token from env var (API_TOKEN)" },
    ],
    initialValue: "none",
  })) as AuthFlavor | symbol;
  if (isCancel(auth)) return bail();

  const scaffoldStubs = await confirm({
    message: "Also emit one stub loadtest per spec operation?",
    initialValue: false,
  });
  if (isCancel(scaffoldStubs)) return bail();

  return {
    cwd,
    spec: spec as string,
    output: output as string,
    auth: auth as AuthFlavor,
    scaffoldStubs: scaffoldStubs as boolean,
  };
}

function bail(): null {
  cancel("Aborted.");
  return null;
}
