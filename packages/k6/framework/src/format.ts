export type Duration =
  | `${number}ms`
  | `${number}s`
  | `${number}m`
  | `${number}h`;
export type Percent = `${number}%`;
/** Rate expression: `"<value>/<unit>"` where unit is `s` / `m` / `h`. e.g. `"100/m"`. */
export type Rate = `${number}/${"s" | "m" | "h"}`;

const DURATION_RE = /^(\d+(?:\.\d+)?)(ms|s|m|h)$/;

export function parseDurationMs(input: string): number {
  const m = DURATION_RE.exec(input.trim());
  if (!m)
    throw new Error(
      `Invalid duration: "${input}" — expected e.g. "500ms", "2s", "1m"`,
    );
  const value = Number(m[1]);
  switch (m[2]) {
    case "ms":
      return value;
    case "s":
      return value * 1_000;
    case "m":
      return value * 60_000;
    case "h":
      return value * 3_600_000;
    default:
      throw new Error(`Unreachable duration unit: ${m[2]}`);
  }
}

const PERCENT_RE = /^(\d+(?:\.\d+)?)%$/;

export function parsePercentRate(input: string): number {
  const m = PERCENT_RE.exec(input.trim());
  if (!m)
    throw new Error(`Invalid percent: "${input}" — expected e.g. "1%", "0.5%"`);
  return Number(m[1]) / 100;
}

const RATE_RE = /^(\d+(?:\.\d+)?)\/(s|m|h)$/;

/** `"100/m"` → 1.6667 (k6 stores rate as per-second). */
export function parseRatePerSecond(input: string): number {
  const m = RATE_RE.exec(input.trim());
  if (!m)
    throw new Error(
      `Invalid rate: "${input}" — expected e.g. "100/m", "5/s", "60/h"`,
    );
  const value = Number(m[1]);
  switch (m[2]) {
    case "s":
      return value;
    case "m":
      return value / 60;
    case "h":
      return value / 3600;
    default:
      throw new Error(`Unreachable rate unit: ${m[2]}`);
  }
}
