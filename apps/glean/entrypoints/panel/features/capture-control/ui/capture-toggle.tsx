import { useCapture } from "../model/capture-context";

export function CaptureToggle() {
  const { capturing, toggle } = useCapture();
  return (
    <button
      type="button"
      onClick={toggle}
      className="flex items-center gap-1.5 rounded-md border border-white/10 bg-zinc-800/60 px-2 py-1 text-zinc-300 hover:bg-zinc-800"
      title={capturing ? "Pause capture" : "Resume capture"}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          capturing ? "bg-zinc-100" : "bg-zinc-500"
        }`}
      />
      {capturing ? "Capturing" : "Paused"}
    </button>
  );
}
