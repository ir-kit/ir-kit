let capturing = true;
const listeners = new Set<(next: boolean) => void>();

export function getCapturing(): boolean {
  return capturing;
}

export function setCapturing(next: boolean): void {
  if (capturing === next) return;
  capturing = next;
  for (const fn of listeners) fn(next);
}

export function onCapturingChange(fn: (next: boolean) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
