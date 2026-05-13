import { stripScheme } from "../../../shared/lib/origin";
import { useOrigins } from "../model/origins-context";

interface OriginRowProps {
  origin: string;
  count: number;
  isSelected?: boolean;
  onClick: () => void;
}

export function OriginRow({
  origin,
  count,
  isSelected = false,
  onClick,
}: OriginRowProps) {
  const { clearOrigin } = useOrigins();
  return (
    <li
      className={`group mx-1 flex items-stretch rounded-md ${
        isSelected ? "bg-zinc-800/80" : "hover:bg-zinc-800/50"
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        className={`flex-1 truncate px-2.5 py-1.5 text-left font-mono text-[11px] ${
          isSelected ? "text-white" : "text-zinc-300"
        }`}
      >
        {stripScheme(origin)}
      </button>
      <span className="flex items-center px-2 text-[11px] tabular-nums text-zinc-500">
        {count}
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          clearOrigin(origin);
        }}
        aria-label={`Drop ${origin}`}
        title={`Drop ${origin}`}
        className="px-2 text-xs text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100 hover:text-rose-400"
      >
        ✕
      </button>
    </li>
  );
}
