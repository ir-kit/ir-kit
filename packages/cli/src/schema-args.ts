import { intro, isCancel, outro, select, text } from "@clack/prompts";
import { isSchemaObject, type Schema } from "@ir-kit/schema";
import type { ArgsDef } from "citty";

/**
 * Convert a JSON Schema 2020-12 object schema into citty's `ArgsDef` map.
 * Each top-level property becomes one citty arg. The first required
 * string property is rendered positional; everything else is a named flag.
 * `enum` constraints become `string` flags + are validated post-parse.
 */
export function schemaToCittyArgs(schema: Schema): ArgsDef {
  const args: ArgsDef = {};
  const required = new Set(schema.required ?? []);
  const props = Object.entries(schema.properties ?? {});

  const firstRequiredString = props.find(
    ([name, p]) =>
      required.has(name) &&
      isSchemaObject(p) &&
      (p as Schema).type === "string",
  )?.[0];

  for (const [name, propUnknown] of props) {
    if (!isSchemaObject(propUnknown)) continue;
    const prop = propUnknown as Schema;
    const description = prop.description ?? "";

    if (name === firstRequiredString) {
      args[name] = {
        type: "positional",
        description,
        required: true,
      };
      continue;
    }

    const t = Array.isArray(prop.type) ? prop.type[0] : prop.type;
    if (t === "boolean") {
      args[name] = {
        type: "boolean",
        description,
        default: prop.default as boolean | undefined,
      };
    } else if (t === "number" || t === "integer") {
      args[name] = {
        type: "string",
        description,
        default: prop.default as string | undefined,
        required: required.has(name) && prop.default === undefined,
      };
    } else {
      args[name] = {
        type: "string",
        description,
        default: prop.default as string | undefined,
        required: required.has(name) && prop.default === undefined,
      };
    }
  }

  return args;
}

/**
 * Walk a JSON Schema and prompt the user for any required field whose
 * value is missing in `partial`. Returns a fully-populated input object.
 * Run AFTER citty has parsed argv so explicit flags win over prompts.
 */
export async function fillFromPrompts<T extends Record<string, unknown>>(
  schema: Schema,
  partial: Partial<T>,
  opts: { title?: string } = {},
): Promise<T> {
  const required = new Set(schema.required ?? []);
  const props = Object.entries(schema.properties ?? {});
  const missing = props.filter(
    ([name]) => required.has(name) && partial[name] === undefined,
  );
  if (missing.length === 0) return partial as T;

  if (opts.title) intro(opts.title);
  const filled: Record<string, unknown> = { ...partial };

  for (const [name, propUnknown] of missing) {
    if (!isSchemaObject(propUnknown)) continue;
    const prop = propUnknown as Schema;
    const message = prop.description ?? name;

    let value: string | symbol;
    if (Array.isArray(prop.enum) && prop.enum.length > 0) {
      const options = prop.enum.map((v) => ({
        value: String(v),
        label: String(v),
      }));
      value = await select({
        message,
        options,
        initialValue: (prop.default as string | undefined) ?? options[0]?.value,
      });
    } else {
      value = await text({
        message,
        placeholder: prop.examples?.[0] != null ? String(prop.examples[0]) : "",
        initialValue: prop.default as string | undefined,
        validate: (v) => {
          if (!v || !v.trim()) return `${name} is required`;
        },
      });
    }
    if (isCancel(value)) {
      outro("Cancelled.");
      process.exit(1);
    }
    filled[name] = value;
  }

  return filled as T;
}

/**
 * Validate a fully-populated input against the schema's `enum` /
 * required constraints. Throws on validation failure with a one-line
 * error matching the offending property.
 */
export function validateInput(
  schema: Schema,
  input: Record<string, unknown>,
): void {
  const required = schema.required ?? [];
  for (const name of required) {
    if (input[name] === undefined || input[name] === "") {
      throw new Error(`Missing required argument: --${name}`);
    }
  }
  for (const [name, propUnknown] of Object.entries(schema.properties ?? {})) {
    if (!isSchemaObject(propUnknown)) continue;
    const prop = propUnknown as Schema;
    if (Array.isArray(prop.enum) && input[name] !== undefined) {
      const allowed = prop.enum.map(String);
      if (!allowed.includes(String(input[name]))) {
        throw new Error(
          `Invalid value for --${name}: ${input[name]}. Allowed: ${allowed.join(", ")}`,
        );
      }
    }
  }
}
