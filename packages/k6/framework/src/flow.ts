import type { StepCtx } from "./runtime.js";

export type StepFn<TIn, TOut> = (input: TIn, ctx: StepCtx) => TOut;
export type ExpectFn<T> = (value: T) => boolean;

interface StepRecord {
  name?: string;
  fn: (input: unknown, ctx: StepCtx) => unknown;
  kind: "step" | "expect";
}

/**
 * Fluent step chain. Each step's return value flows into the next as typed input —
 * full inference, no manual generics.
 */
export class FlowBuilder<TLast> {
  private readonly steps: StepRecord[];

  constructor(steps: StepRecord[] = []) {
    this.steps = steps;
  }

  /** Append a step. Receives previous step's output; its return becomes the next input. */
  step<TNext>(fn: StepFn<TLast, TNext>): FlowBuilder<TNext>;
  step<TNext>(name: string, fn: StepFn<TLast, TNext>): FlowBuilder<TNext>;
  step<TNext>(
    nameOrFn: string | StepFn<TLast, TNext>,
    maybeFn?: StepFn<TLast, TNext>,
  ): FlowBuilder<TNext> {
    const name = typeof nameOrFn === "string" ? nameOrFn : undefined;
    const fn = typeof nameOrFn === "string" ? maybeFn! : nameOrFn;
    return new FlowBuilder<TNext>([
      ...this.steps,
      { name, kind: "step", fn: (input, ctx) => fn(input as TLast, ctx) },
    ]);
  }

  /** Assert an invariant on the last step's output. Failure throws and aborts the chain. */
  expect(check: ExpectFn<TLast>, message?: string): FlowBuilder<TLast> {
    return new FlowBuilder<TLast>([
      ...this.steps,
      {
        name: message,
        kind: "expect",
        fn: (input) => {
          if (!check(input as TLast)) {
            throw new FlowExpectError(message ?? "expectation failed");
          }
          return input;
        },
      },
    ]);
  }

  run(ctx: StepCtx): TLast {
    let value: unknown = undefined;
    for (const step of this.steps) {
      value = step.fn(value, ctx);
    }
    return value as TLast;
  }

  describe(): ReadonlyArray<{ name?: string; kind: "step" | "expect" }> {
    return this.steps.map((s) => ({ name: s.name, kind: s.kind }));
  }
}

export class FlowExpectError extends Error {
  readonly name = "FlowExpectError";
}

/** Start a new flow chain. */
export function flow(): FlowBuilder<void> {
  return new FlowBuilder<void>([]);
}
