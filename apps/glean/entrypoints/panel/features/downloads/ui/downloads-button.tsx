import { useState } from "react";
import { DownloadsSheet } from "./downloads-sheet";

export function DownloadsButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-md border border-white/10 bg-zinc-800/60 px-2 py-1 text-zinc-300 hover:bg-zinc-800"
        title="Scan the inspected page for downloadable spec URLs"
      >
        Downloads
      </button>
      {open && <DownloadsSheet onClose={() => setOpen(false)} />}
    </>
  );
}
