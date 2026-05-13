import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";
import { useSpec } from "../model/spec-context";

export function SpecViewer() {
  const { spec } = useSpec();
  if (!spec) return null;
  return (
    <div className="h-full overflow-auto">
      <ApiReferenceReact
        configuration={{
          content: spec,
          theme: "deepSpace",
          layout: "modern",
          hideDarkModeToggle: true,
        }}
      />
    </div>
  );
}
