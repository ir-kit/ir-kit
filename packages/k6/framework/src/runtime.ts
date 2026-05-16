export { buildQuery, mergeTags, parseJson } from "./client-runtime.js";

export type HeaderMap = Record<string, string>;

export interface Middleware {
  headers?(): HeaderMap;
}

let __middleware: ReadonlyArray<Middleware> = [];

export function setMiddleware(middleware: ReadonlyArray<Middleware>): void {
  __middleware = middleware;
}

export function applyMiddlewareHeaders(into: HeaderMap = {}): HeaderMap {
  for (const m of __middleware) {
    const h = m.headers?.();
    if (h) Object.assign(into, h);
  }
  return into;
}

/** Per-scenario BASE_URL override; `undefined` → __ENV.BASE_URL → fallback. */
let __baseUrl: string | undefined;

export function setBaseUrl(url: string | undefined): void {
  __baseUrl = url;
}

declare const __ENV: Record<string, string | undefined> | undefined;

export function getBaseUrl(fallback: string): string {
  if (__baseUrl !== undefined) return __baseUrl;
  const env = typeof __ENV !== "undefined" ? __ENV?.BASE_URL : undefined;
  return env ?? fallback;
}

export interface StepCtx {
  readonly vu: number;
  readonly iter: number;
  env(name: string, defaultValue?: string): string;
}

declare const __VU: number | undefined;
declare const __ITER: number | undefined;

export function makeStepCtx(): StepCtx {
  return {
    get vu() {
      return typeof __VU !== "undefined" ? __VU : 0;
    },
    get iter() {
      return typeof __ITER !== "undefined" ? __ITER : 0;
    },
    env(name, defaultValue) {
      const v = (globalThis as { __ENV?: Record<string, string> }).__ENV?.[
        name
      ];
      if (v !== undefined) return v;
      if (defaultValue !== undefined) return defaultValue;
      throw new Error(`Missing env var: ${name}`);
    },
  };
}
