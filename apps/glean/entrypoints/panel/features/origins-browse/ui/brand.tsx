import { useOrigins } from "../model/origins-context";

/** "Glean" wordmark; becomes a back button when an origin is selected. */
export function Brand() {
  const { selected, back } = useOrigins();
  if (!selected) {
    return (
      <span className="font-medium tracking-tight text-zinc-200">Glean</span>
    );
  }
  return (
    <button
      type="button"
      onClick={back}
      className="flex items-center gap-1.5 rounded-md border border-white/10 bg-zinc-800/60 px-2 py-1 text-zinc-300 hover:bg-zinc-800"
      title="Back to origin picker"
    >
      <span aria-hidden="true">←</span>
      <span className="font-medium tracking-tight text-zinc-200">Glean</span>
    </button>
  );
}
