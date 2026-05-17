import type { Duration } from "./format.js";
import { type Ctx, k6Bridge } from "./runtime.js";

export type Awaitable<T> = T | Promise<T>;

/** A step body — may be sync or async; framework awaits Promise returns. */
export type StepFn<TIn, TOut, VuState = unknown> = (
  input: TIn,
  ctx: Ctx<VuState>,
) => Awaitable<TOut>;

export type ExpectFn<T> = (value: T) => boolean;

/** Object whose values are sync, async, or both. `batch` awaits Promise values. */
export type BatchSpec<T extends Record<string, unknown>> = {
  [K in keyof T]: Awaitable<T[K]>;
};

/** Resolved batch result — Promise values unwrapped, sync passed through. */
export type BatchResult<T extends Record<string, unknown>> = {
  [K in keyof T]: Awaited<T[K]>;
};

type Op =
  | {
      kind: "step";
      name?: string;
      fn: (input: unknown, ctx: Ctx<unknown>) => Awaitable<unknown>;
    }
  | {
      kind: "batch";
      name: string;
      fn: (
        input: unknown,
        ctx: Ctx<unknown>,
      ) => Awaitable<Record<string, unknown>>;
    }
  | {
      kind: "group";
      name: string;
      inner: FlowBuilder<unknown, unknown>;
    }
  | {
      kind: "check";
      name: string;
      fn: (input: unknown) => boolean;
    }
  | {
      kind: "sleep";
      seconds: number;
    }
  | {
      kind: "expect";
      name: string;
      fn: (input: unknown) => boolean;
    };

const DURATION_RE = /^(\d+(?:\.\d+)?)(ms|s|m|h)$/;

function durationToSeconds(input: Duration | number): number {
  if (typeof input === "number") return input;
  const m = DURATION_RE.exec(input.trim());
  if (!m) throw new Error(`Invalid duration: "${input}"`);
  const value = Number(m[1]);
  switch (m[2]) {
    case "ms":
      return value / 1000;
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 3600;
  }
  throw new Error(`Unreachable duration unit: ${m[2]}`);
}

/**
 * Fluent flow chain. Each op's return value threads into the next as typed input
 * — full inference, no manual generics. Steps may be sync or async; `run()` is
 * always async and awaits each.
 */
export class FlowBuilder<TLast, VuState = unknown> {
  private readonly ops: Op[];

  constructor(ops: Op[] = []) {
    this.ops = ops;
  }

  /** Append a step. Receives previous output as input; return becomes next input. */
  step<TNext>(fn: StepFn<TLast, TNext, VuState>): FlowBuilder<TNext, VuState>;
  step<TNext>(
    name: string,
    fn: StepFn<TLast, TNext, VuState>,
  ): FlowBuilder<TNext, VuState>;
  step<TNext>(
    nameOrFn: string | StepFn<TLast, TNext, VuState>,
    maybeFn?: StepFn<TLast, TNext, VuState>,
  ): FlowBuilder<TNext, VuState> {
    const name = typeof nameOrFn === "string" ? nameOrFn : undefined;
    const fn = typeof nameOrFn === "string" ? maybeFn! : nameOrFn;
    return new FlowBuilder<TNext, VuState>([
      ...this.ops,
      {
        kind: "step",
        name,
        fn: (input, ctx) => fn(input as TLast, ctx as Ctx<VuState>),
      },
    ]);
  }

  /**
   * Fire labeled requests in parallel. Sync values pass through; Promise values
   * are awaited via `Promise.all`. Use with `api.async.*` for true parallel HTTP.
   */
  batch<TBranches extends Record<string, unknown>>(
    name: string,
    build: (input: TLast, ctx: Ctx<VuState>) => BatchSpec<TBranches>,
  ): FlowBuilder<BatchResult<TBranches>, VuState> {
    return new FlowBuilder<BatchResult<TBranches>, VuState>([
      ...this.ops,
      {
        kind: "batch",
        name,
        fn: async (input, ctx) => {
          const spec = build(input as TLast, ctx as Ctx<VuState>);
          const keys = Object.keys(spec) as Array<keyof TBranches>;
          const resolved = await Promise.all(
            keys.map((k) => Promise.resolve(spec[k])),
          );
          const out = {} as Record<string, unknown>;
          keys.forEach((k, i) => {
            out[k as string] = resolved[i];
          });
          return out;
        },
      },
    ]);
  }

  /**
   * Wrap a sub-flow in a k6 `group()` so all requests/metrics inside carry the
   * `group:<name>` tag. Sub-flow returns flow into the parent chain.
   */
  group<TNext>(
    name: string,
    build: (sub: FlowBuilder<TLast, VuState>) => FlowBuilder<TNext, VuState>,
  ): FlowBuilder<TNext, VuState> {
    const inner = build(new FlowBuilder<TLast, VuState>([]));
    return new FlowBuilder<TNext, VuState>([
      ...this.ops,
      {
        kind: "group",
        name,
        inner: inner as FlowBuilder<unknown, unknown>,
      },
    ]);
  }

  /**
   * Record a soft k6 `check()`. Feeds the `checks` rate metric — does NOT fail
   * the iteration. Use `.expect()` for hard-fail assertions.
   */
  check(
    name: string,
    predicate: (value: TLast) => boolean,
  ): FlowBuilder<TLast, VuState> {
    return new FlowBuilder<TLast, VuState>([
      ...this.ops,
      {
        kind: "check",
        name,
        fn: (input) => predicate(input as TLast),
      },
    ]);
  }

  /** k6 `sleep()` — duration accepts `"500ms" | "1s" | "2m"` or a raw seconds number. */
  sleep(duration: Duration | number): FlowBuilder<TLast, VuState> {
    return new FlowBuilder<TLast, VuState>([
      ...this.ops,
      { kind: "sleep", seconds: durationToSeconds(duration) },
    ]);
  }

  /**
   * Hard-fail assertion on the last value. Failure throws `FlowExpectError`,
   * aborting the iteration (k6 counts it as a failed iteration).
   */
  expect(
    predicate: ExpectFn<TLast>,
    message?: string,
  ): FlowBuilder<TLast, VuState> {
    return new FlowBuilder<TLast, VuState>([
      ...this.ops,
      {
        kind: "expect",
        name: message ?? "expectation failed",
        fn: (input) => predicate(input as TLast),
      },
    ]);
  }

  /** Execute the flow. Always async — awaits Promise returns from steps/batches. */
  async run(ctx: Ctx<VuState>): Promise<TLast> {
    return (await runOps(this.ops, undefined, ctx)) as TLast;
  }

  describe(): ReadonlyArray<{ kind: Op["kind"]; name?: string }> {
    return this.ops.map((op) => ({
      kind: op.kind,
      name: "name" in op ? op.name : undefined,
    }));
  }
}

async function runOps(
  ops: ReadonlyArray<Op>,
  seed: unknown,
  ctx: Ctx<unknown>,
): Promise<unknown> {
  let value: unknown = seed;
  for (const op of ops) {
    switch (op.kind) {
      case "step":
      case "batch":
        value = await op.fn(value, ctx);
        break;
      case "group": {
        const captured = value;
        value = await k6Bridge().group(op.name, () =>
          runOps(op.inner.describeOps(), captured, ctx),
        );
        break;
      }
      case "check":
        k6Bridge().check(value, { [op.name]: (v) => op.fn(v) });
        break;
      case "sleep":
        k6Bridge().sleep(op.seconds);
        break;
      case "expect":
        if (!op.fn(value)) throw new FlowExpectError(op.name);
        break;
    }
  }
  return value;
}

declare module "./flow.js" {
  interface FlowBuilder<TLast, VuState> {
    /** @internal */
    describeOps(): ReadonlyArray<Op>;
  }
}

FlowBuilder.prototype.describeOps = function describeOps(
  this: FlowBuilder<unknown, unknown>,
) {
  return (this as unknown as { ops: ReadonlyArray<Op> }).ops;
};

export class FlowExpectError extends Error {
  readonly name = "FlowExpectError";
}

/** Start a new flow chain. */
export function flow<VuState = unknown>(): FlowBuilder<void, VuState> {
  return new FlowBuilder<void, VuState>([]);
}
