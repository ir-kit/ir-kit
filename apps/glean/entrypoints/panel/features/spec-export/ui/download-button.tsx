import { useOrigins } from "../../origins-browse";
import { useSpec } from "../../spec-viewer";
import { downloadSpec } from "../lib/download-spec";

export function DownloadButton() {
  const { selected } = useOrigins();
  const { spec } = useSpec();
  if (!spec || !selected) return null;
  return (
    <button
      type="button"
      onClick={() => downloadSpec(spec, selected)}
      className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-white hover:bg-white/10"
    >
      Download
    </button>
  );
}
