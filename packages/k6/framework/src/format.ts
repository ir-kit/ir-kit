export type Duration =
  | `${number}ms`
  | `${number}s`
  | `${number}m`
  | `${number}h`;
export type Percent = `${number}%`;

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
