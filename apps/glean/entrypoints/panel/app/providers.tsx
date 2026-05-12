import type { ReactNode } from "react";
import { CaptureProvider } from "../features/capture-control";
import { OriginsProvider } from "../features/origins-browse";
import { SpecProvider } from "../features/spec-viewer";

/**
 * Single mount point for all app-wide providers. Order matters: `SpecProvider`
 * reads selection from `OriginsProvider`, so it must be nested inside.
 * `CaptureProvider` is independent.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <CaptureProvider>
      <OriginsProvider>
        <SpecProvider>{children}</SpecProvider>
      </OriginsProvider>
    </CaptureProvider>
  );
}
