import { Centered } from "../../../shared/ui/centered";
import { SpecViewer, useSpec } from "../../spec-viewer";
import { useOrigins } from "../model/origins-context";
import { Empty } from "./empty";
import { OriginPicker } from "./origin-picker";

export function Body() {
  const { origins, selected } = useOrigins();
  const { spec, loading, error } = useSpec();

  if (origins.length === 0) return <Empty />;
  if (!selected) return <OriginPicker />;
  if (loading) return <Centered>Loading spec…</Centered>;
  if (error) {
    return (
      <Centered>
        <div className="max-w-sm text-center text-rose-300">
          <p>Couldn't load spec for {selected}.</p>
          <p className="mt-1 text-[11px] text-zinc-600">{error}</p>
        </div>
      </Centered>
    );
  }
  if (!spec) return <Centered>No spec yet — capture more traffic.</Centered>;
  return <SpecViewer />;
}
