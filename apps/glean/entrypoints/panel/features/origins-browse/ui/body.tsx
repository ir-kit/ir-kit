import { Centered } from "../../../shared/ui/centered";
import { SpecViewer, useSpec } from "../../spec-viewer";
import { useOrigins } from "../model/origins-context";
import { Empty } from "./empty";
import { OriginPicker } from "./origin-picker";

/**
 * Conditional view router. Decides between empty / picker / loading / viewer
 * based purely on context — no props from the App shell.
 */
export function Body() {
  const { origins, selected } = useOrigins();
  const { spec, loading } = useSpec();

  if (origins.length === 0) return <Empty />;
  if (!selected) return <OriginPicker />;
  if (loading || !spec) return <Centered>Loading spec…</Centered>;
  return <SpecViewer />;
}
