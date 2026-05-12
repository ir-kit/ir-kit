import { useOrigins } from "../model/origins-context";

export function ClearButton() {
  const { clearAll } = useOrigins();
  return (
    <button
      type="button"
      onClick={clearAll}
      className="rounded-md border border-white/10 bg-zinc-800/60 px-2 py-1 text-zinc-300 hover:bg-zinc-800"
      title="Clear all captured data"
    >
      Clear
    </button>
  );
}
