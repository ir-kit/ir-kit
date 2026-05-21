import {
  cancel,
  confirm,
  isCancel,
  multiselect,
  select,
  text,
} from "@clack/prompts";
import type { WalkedOperation } from "@ir-kit/k6-gen";

import type { AuthFlavor, AuthScaffoldOpts } from "../loadtest-scaffold.js";
import type { ChainMode } from "./chains.js";
import type { PacePreset, ScaffoldScenarioOpts } from "./scenario.js";
import { type SpecOperations, UNTAGGED } from "./spec-tags.js";

/**
 * Wizard answers — a fully-resolved scaffold config ready for `scaffoldScenario`
 * plus the filesystem target (output path).
 */
export interface WizardResult {
  outputPath: string;
  scaffold: ScaffoldScenarioOpts;
}

/** Bail-out helper. */
function bail(): null {
  cancel("Aborted.");
  return null;
}

/**
 * Prompt the user through scenario authoring. Returns `null` if cancelled.
 * Reuses `SpecOperations` for op discovery so the same source-of-truth feeds
 * the CLI's `list-ops` subcommand.
 */
export async function runScenarioWizard(
  spec: SpecOperations,
  defaults: {
    clientImportPath: string;
    outputDir: string;
  },
): Promise<WizardResult | null> {
  const tagOptions = Array.from(spec.byTag.entries()).map(([tag, ops]) => ({
    value: tag,
    label: `${tag === UNTAGGED ? "(untagged)" : tag}  —  ${ops.length} op${ops.length === 1 ? "" : "s"}`,
  }));
  tagOptions.push({ value: "__manual__", label: "Pick ops manually" });

  const tagPick = await select({
    message: "Which group should this scenario cover?",
    options: tagOptions,
  });
  if (isCancel(tagPick)) return bail();

  let ops: ReadonlyArray<WalkedOperation>;
  if (tagPick === "__manual__") {
    const opOptions = spec.all.map((op) => ({
      value: op.id,
      label: `${op.method.toUpperCase()} ${op.path}  ·  ${op.id}`,
    }));
    const picked = (await multiselect({
      message: "Which ops? (space toggles, enter confirms)",
      options: opOptions,
      required: true,
    })) as string[] | symbol;
    if (isCancel(picked)) return bail();
    ops = (picked as string[])
      .map((id) => spec.byId.get(id))
      .filter((o): o is WalkedOperation => o !== undefined);
  } else {
    const tagOps = spec.byTag.get(tagPick as string) ?? [];
    const opOptions = tagOps.map((op) => ({
      value: op.id,
      label: `${op.method.toUpperCase()} ${op.path}  ·  ${op.id}`,
    }));
    const picked = (await multiselect({
      message: `Ops from "${tagPick}" — keep them all or narrow?`,
      options: opOptions,
      initialValues: tagOps.map((o) => o.id),
      required: true,
    })) as string[] | symbol;
    if (isCancel(picked)) return bail();
    ops = (picked as string[])
      .map((id) => spec.byId.get(id))
      .filter((o): o is WalkedOperation => o !== undefined);
  }

  const defaultName =
    tagPick === "__manual__" ? "scenario" : `${tagPick as string}-flow`;
  const name = (await text({
    message: "Scenario name?",
    initialValue: defaultName,
    validate: (v) => (v && v.trim().length ? undefined : "Required"),
  })) as string | symbol;
  if (isCancel(name)) return bail();

  const chain = (await select({
    message: "How should they compose?",
    options: [
      {
        value: "sequential",
        label: "Sequential — chain step outputs (CRUD-style)",
      },
      {
        value: "batch",
        label: "Parallel fan-out — flow().batch() with async ops",
      },
    ],
    initialValue: "sequential",
  })) as ChainMode | symbol;
  if (isCancel(chain)) return bail();

  const pace = (await select({
    message: "Pace preset?",
    options: [
      { value: "smoke", label: "smoke   1 VU × 30s — CI sanity" },
      { value: "load", label: "load    ramp to target VUs — steady state" },
      {
        value: "stress",
        label: "stress  climb to ceiling — find breaking point",
      },
      { value: "spike", label: "spike   baseline → peak → recover" },
      { value: "soak", label: "soak    long-haul — leak detection" },
    ],
    initialValue: "smoke",
  })) as PacePreset | symbol;
  if (isCancel(pace)) return bail();

  const duration = (await text({
    message: "Duration?",
    initialValue: pace === "soak" ? "1h" : "30s",
  })) as string | symbol;
  if (isCancel(duration)) return bail();

  const auth = (await select({
    message: "Auth?",
    options: [
      { value: "none", label: "None" },
      { value: "bearer", label: "Bearer (API_TOKEN env)" },
      { value: "basic", label: "Basic (API_USER / API_PASS env)" },
      { value: "apiKey", label: "API key header (X-API-Key / API_KEY env)" },
      { value: "session", label: "Session cookie (fill signIn yourself)" },
      { value: "digest", label: "HTTP Digest (API_USER / API_PASS env)" },
      { value: "ntlm", label: "NTLM (API_USER / API_PASS env)" },
    ],
    initialValue: "none",
  })) as AuthFlavor | symbol;
  if (isCancel(auth)) return bail();

  const slug = String(name)
    .trim()
    .replace(/[^a-zA-Z0-9-]+/g, "-");
  const outputPath = (await text({
    message: "Output path?",
    initialValue: `${defaults.outputDir}/${slug}.ts`,
  })) as string | symbol;
  if (isCancel(outputPath)) return bail();

  const authOpts: AuthScaffoldOpts = { auth: auth as AuthFlavor };

  return {
    outputPath: outputPath as string,
    scaffold: {
      clientImportPath: defaults.clientImportPath,
      pace: pace as PacePreset,
      duration: duration as string,
      ops,
      chain: chain as ChainMode,
      auth: authOpts,
    },
  };
}

/**
 * Confirm-overwrite prompt — shared by wizard and flag-mode CLI so a single
 * UX rules them both. Returns `true` to proceed.
 */
export async function confirmOverwrite(path: string): Promise<boolean> {
  const ok = await confirm({
    message: `${path} already exists — overwrite?`,
    initialValue: false,
  });
  if (isCancel(ok)) return false;
  return Boolean(ok);
}
