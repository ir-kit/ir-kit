import { type CommandDef, defineCommand, runMain } from "citty";

import type { AnyCommandSpec } from "./command-spec.js";
import {
  fillFromPrompts,
  schemaToCittyArgs,
  validateInput,
} from "./schema-args.js";

interface Node {
  meta?: { name?: string; description?: string };
  subCommands: Record<string, Node>;
  leaf?: AnyCommandSpec;
}

function commandToCitty(spec: AnyCommandSpec): CommandDef {
  const argsDef = schemaToCittyArgs(spec.args);
  const name = spec.path[spec.path.length - 1] ?? "command";
  return defineCommand({
    meta: { name, description: spec.description },
    args: argsDef,
    run: async ({ args }) => {
      const partial = stripCittyMeta(args);
      const filled = await fillFromPrompts(spec.args, partial, {
        title: `ir ${spec.path.join(" ")}`,
      });
      validateInput(spec.args, filled);
      await spec.handler(filled);
    },
  });
}

function stripCittyMeta(
  args: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(args)) {
    if (k === "_") continue;
    if (v === undefined) continue;
    if (typeof v === "string" && v === "") continue;
    out[k] = v;
  }
  return out;
}

function buildTree(commands: ReadonlyArray<AnyCommandSpec>): Node {
  const root: Node = { subCommands: {} };
  for (const cmd of commands) {
    let cursor = root;
    for (let i = 0; i < cmd.path.length - 1; i++) {
      const seg = cmd.path[i]!;
      cursor.subCommands[seg] ??= { subCommands: {} };
      cursor = cursor.subCommands[seg]!;
    }
    const leafName = cmd.path[cmd.path.length - 1]!;
    cursor.subCommands[leafName] = { subCommands: {}, leaf: cmd };
  }
  return root;
}

function treeToCitty(
  node: Node,
  name: string,
  description: string,
): CommandDef {
  const subCommands: Record<string, CommandDef> = {};
  for (const [childName, child] of Object.entries(node.subCommands)) {
    if (child.leaf) {
      subCommands[childName] = commandToCitty(child.leaf);
    } else {
      subCommands[childName] = treeToCitty(
        child,
        childName,
        `${childName} subcommands`,
      );
    }
  }
  return defineCommand({
    meta: { name, description },
    subCommands,
  });
}

export interface RunCliOptions {
  name: string;
  version: string;
  description: string;
  commands: ReadonlyArray<AnyCommandSpec>;
}

export async function runCli(opts: RunCliOptions): Promise<void> {
  const tree = buildTree(opts.commands);
  const root = defineCommand({
    meta: {
      name: opts.name,
      version: opts.version,
      description: opts.description,
    },
    subCommands: Object.fromEntries(
      Object.entries(tree.subCommands).map(([childName, child]) => [
        childName,
        child.leaf
          ? commandToCitty(child.leaf)
          : treeToCitty(child, childName, `${childName} subcommands`),
      ]),
    ),
  });
  await runMain(root);
}

export type { AnyCommandSpec };
