/**
 * Fetch a URL from the panel context and trigger a browser download with a
 * sensible filename. Falls back to opening the URL in a new tab when fetch
 * fails (e.g. CORS-restricted).
 */
export async function downloadUrl(url: string): Promise<void> {
  const filename = filenameFor(url);
  try {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    triggerSave(blob, filename);
  } catch {
    // CORS or network failure — open in a new tab and let the user save it.
    window.open(url, "_blank", "noopener");
  }
}

function filenameFor(url: string): string {
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").filter(Boolean).pop();
    if (last) return last;
    return `${u.hostname || "download"}.bin`;
  } catch {
    return "download.bin";
  }
}

function triggerSave(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(objectUrl);
}
