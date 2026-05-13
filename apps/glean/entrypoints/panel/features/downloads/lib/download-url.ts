const SAFE_PROTOCOLS = new Set(["http:", "https:"]);

export async function downloadUrl(url: string): Promise<void> {
  if (!isSafeUrl(url)) {
    console.warn("[glean] refusing unsafe download URL", url);
    return;
  }
  const filename = filenameFor(url);
  try {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    triggerSave(blob, filename);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

function isSafeUrl(url: string): boolean {
  try {
    return SAFE_PROTOCOLS.has(new URL(url).protocol);
  } catch {
    return false;
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
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(objectUrl);
  }, 0);
}
