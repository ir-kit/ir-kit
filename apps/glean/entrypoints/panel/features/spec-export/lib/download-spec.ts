import { slugifyOrigin } from "../../../shared/lib/origin";

export function downloadSpec(spec: object, origin: string): void {
  const blob = new Blob([JSON.stringify(spec, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slugifyOrigin(origin)}.openapi.json`;
  a.click();
  URL.revokeObjectURL(url);
}
