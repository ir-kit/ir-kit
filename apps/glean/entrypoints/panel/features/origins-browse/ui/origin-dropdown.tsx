import { useEffect, useMemo, useRef, useState } from "react";
import { stripScheme } from "../../../shared/lib/origin";
import { useOrigins } from "../model/origins-context";
import { OriginRow } from "./origin-row";

export function OriginDropdown() {
  const { origins, selected, select } = useOrigins();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const selectedCount =
    (selected && origins.find(([o]) => o === selected)?.[1]) ?? 0;
  const visible = useMemo(
    () =>
      origins.filter(([o]) => o.toLowerCase().includes(filter.toLowerCase())),
    [origins, filter],
  );

  if (!selected) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="glean-origin-dropdown-list"
        aria-label={`Switch origin (currently ${stripScheme(selected)})`}
        className="flex items-center gap-2 rounded-md border border-white/10 bg-zinc-800/60 px-2 py-1 font-mono text-[11px] text-zinc-200 hover:bg-zinc-800"
      >
        <span className="truncate">{stripScheme(selected)}</span>
        <span className="tabular-nums text-zinc-500">{selectedCount}</span>
        <svg
          aria-hidden="true"
          width="8"
          height="8"
          viewBox="0 0 8 8"
          className="fill-current text-zinc-500"
        >
          <path d="M1 2 L4 6 L7 2 Z" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1.5 w-80 overflow-hidden rounded-lg border border-white/10 bg-zinc-900 shadow-2xl shadow-black/60">
          <div className="border-b border-white/5 p-2">
            <input
              autoFocus
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter origins…"
              aria-label="Filter origins"
              className="w-full rounded-md bg-zinc-950 px-2 py-1 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/30"
            />
          </div>
          <ul
            id="glean-origin-dropdown-list"
            role="listbox"
            className="max-h-80 overflow-y-auto py-1"
          >
            {visible.length === 0 && (
              <li className="px-3 py-2 text-xs text-zinc-600">No matches.</li>
            )}
            {visible.map(([o, n]) => (
              <OriginRow
                key={o}
                origin={o}
                count={n}
                isSelected={o === selected}
                onClick={() => {
                  select(o);
                  setOpen(false);
                }}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
