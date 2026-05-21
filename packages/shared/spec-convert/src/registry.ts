import type { ConverterPair, SpecFormat } from "./types.js";

const registry = new Map<string, ConverterPair>();

const key = (from: SpecFormat, to: SpecFormat): string => `${from}->${to}`;

export function registerConverter(pair: ConverterPair): void {
  registry.set(key(pair.from, pair.to), pair);
}

export function findConverter(
  from: SpecFormat,
  to: SpecFormat,
): ConverterPair | undefined {
  return registry.get(key(from, to));
}

export function listConverters(): ReadonlyArray<{
  from: SpecFormat;
  to: SpecFormat;
}> {
  return Array.from(registry.values()).map(({ from, to }) => ({ from, to }));
}
