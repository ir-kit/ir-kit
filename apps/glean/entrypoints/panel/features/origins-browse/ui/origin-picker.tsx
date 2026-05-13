import { useMemo, useState } from "react";
import { useOrigins } from "../model/origins-context";
import { OriginRow } from "./origin-row";

export function OriginPicker() {
  const { origins, select } = useOrigins();
  const [filter, setFilter] = useState("");
  const visible = useMemo(
    () =>
      origins.filter(([o]) => o.toLowerCase().includes(filter.toLowerCase())),
    [origins, filter],
  );

  return (
    <div className="mx-auto flex h-full max-w-xl flex-col gap-4 px-6 py-10">
      <div>
        <h2 className="text-base font-medium tracking-tight text-zinc-100">
          Pick an origin to inspect
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Each origin builds its own OpenAPI 3.1 spec from observed traffic.
        </p>
      </div>
      <input
        type="search"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter origins…"
        aria-label="Filter origins"
        className="rounded-md border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/30"
      />
      <ul className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
        {visible.length === 0 && (
          <li className="text-xs text-zinc-600">No matches.</li>
        )}
        {visible.map(([o, n]) => (
          <OriginRow key={o} origin={o} count={n} onClick={() => select(o)} />
        ))}
      </ul>
    </div>
  );
}
