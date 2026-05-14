import type { HeaderMap, Middleware } from "./runtime.js";

declare const __ENV: Record<string, string | undefined>;

function readEnv(name: string): string {
  const v =
    (typeof __ENV !== "undefined" ? __ENV[name] : undefined) ??
    (typeof process !== "undefined" ? process.env?.[name] : undefined);
  if (v === undefined) throw new Error(`Missing env var: ${name}`);
  return v;
}

function b64(input: string): string {
  if (typeof globalThis.btoa === "function") return globalThis.btoa(input);
  if (typeof Buffer !== "undefined")
    return Buffer.from(input, "utf8").toString("base64");
  throw new Error("No base64 encoder available in this runtime");
}

export interface BearerOpts {
  /** Static token. Pass either this or `env`. */
  token?: string;
  /** Env var holding the token. Read at request time. */
  env?: string;
  /** @default "Authorization" */
  header?: string;
  /** @default "Bearer" */
  scheme?: string;
}

function bearer(opts: BearerOpts): Middleware {
  if (!opts.token && !opts.env)
    throw new Error("useAuth.bearer requires `token` or `env`");
  const header = opts.header ?? "Authorization";
  const scheme = opts.scheme ?? "Bearer";
  return {
    headers(): HeaderMap {
      const token = opts.token ?? readEnv(opts.env!);
      return { [header]: `${scheme} ${token}` };
    },
  };
}

export interface BasicOpts {
  user: string | { env: string };
  pass: string | { env: string };
}

function basic(opts: BasicOpts): Middleware {
  const resolve = (v: string | { env: string }): string =>
    typeof v === "string" ? v : readEnv(v.env);
  return {
    headers(): HeaderMap {
      return {
        Authorization: `Basic ${b64(`${resolve(opts.user)}:${resolve(opts.pass)}`)}`,
      };
    },
  };
}

export interface ApiKeyOpts {
  /** Header name (e.g. `X-API-Key`). */
  name: string;
  /** @default "header" */
  in?: "header";
  value?: string;
  env?: string;
}

function apiKey(opts: ApiKeyOpts): Middleware {
  if (!opts.value && !opts.env)
    throw new Error("useAuth.apiKey requires `value` or `env`");
  return {
    headers(): HeaderMap {
      const v = opts.value ?? readEnv(opts.env!);
      return { [opts.name]: v };
    },
  };
}

export interface CustomOpts {
  headers: () => HeaderMap;
}

function custom(opts: CustomOpts): Middleware {
  return { headers: opts.headers };
}

/** Auth recipes. Pass via `defineLoadTest({ use: [auth] })` to inject headers into every request. */
export const useAuth = { bearer, basic, apiKey, custom } as const;
