import { useOrigins } from "../model/origins-context";

export function SampleCount() {
  const { totalSamples } = useOrigins();
  return (
    <span className="text-[11px] tabular-nums text-zinc-500">
      {totalSamples} sample{totalSamples === 1 ? "" : "s"}
    </span>
  );
}
