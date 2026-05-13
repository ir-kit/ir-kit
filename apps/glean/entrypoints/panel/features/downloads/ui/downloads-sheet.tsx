import { useEffect, useRef } from "react";
import { downloadUrl } from "../lib/download-url";
import type { ScannedDownload } from "../model/scan-script";
import { useDownloads } from "../model/use-downloads";

interface DownloadsSheetProps {
  onClose: () => void;
}

export function DownloadsSheet({ onClose }: DownloadsSheetProps) {
  const { items, loading, error, refresh } = useDownloads();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-3 top-12 z-30 w-md overflow-hidden rounded-lg border border-white/10 bg-zinc-900 shadow-2xl shadow-black/60"
    >
      <header className="flex items-center justify-between gap-2 border-b border-white/5 px-3 py-2">
        <div>
          <h3 className="text-xs font-medium text-zinc-100">
            Detected downloads
          </h3>
          <p className="text-[11px] text-zinc-500">
            JSON / YAML / spec URLs scanned from the inspected page.
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="rounded-md border border-white/10 bg-zinc-800/60 px-2 py-1 text-[11px] text-zinc-300 hover:bg-zinc-800"
        >
          Rescan
        </button>
      </header>
      <div className="max-h-96 overflow-y-auto">
        {loading && (
          <p className="px-3 py-4 text-center text-xs text-zinc-500">
            Scanning…
          </p>
        )}
        {error && !loading && (
          <p className="px-3 py-4 text-center text-xs text-rose-400">{error}</p>
        )}
        {!loading && !error && items.length === 0 && (
          <p className="px-3 py-4 text-center text-xs text-zinc-600">
            Nothing found. Make sure the inspected tab is the docs page, not
            DevTools itself.
          </p>
        )}
        <ul className="py-1">
          {items.map((item) => (
            <Item key={`${item.hint}|${item.url}`} item={item} />
          ))}
        </ul>
      </div>
    </div>
  );
}

function Item({ item }: { item: ScannedDownload }) {
  return (
    <li className="group mx-1 flex items-stretch rounded-md hover:bg-zinc-800/50">
      <div className="flex min-w-0 flex-1 flex-col px-2.5 py-1.5">
        <span className="truncate font-mono text-[11px] text-zinc-200">
          {item.url}
        </span>
        <span className="text-[10px] text-zinc-600">{item.hint}</span>
      </div>
      <button
        type="button"
        onClick={() => void downloadUrl(item.url)}
        aria-label={`Download ${item.url}`}
        title="Download (falls back to opening in a new tab if blocked by CORS)"
        className="px-3 text-xs text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100 hover:text-white"
      >
        ↓
      </button>
    </li>
  );
}
