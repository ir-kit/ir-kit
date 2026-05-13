import type { ReactNode } from "react";

/**
 * Layout primitives. Pure containers with no app state — just slots.
 *
 *   <Shell>
 *     <Shell.Header>
 *       <Brand />
 *       <SampleCount />
 *       <OriginDropdown />
 *       <Shell.Spacer />
 *       <CaptureToggle />
 *       <DownloadButton />
 *       <ClearButton />
 *     </Shell.Header>
 *     <Shell.Main>
 *       <Body />
 *     </Shell.Main>
 *   </Shell>
 */
export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full flex-col bg-zinc-950 text-zinc-100">
      {children}
    </div>
  );
}

function Header({ children }: { children: ReactNode }) {
  return (
    <header className="flex h-11 shrink-0 items-center gap-3 border-b border-white/5 bg-zinc-900/60 px-3 text-xs backdrop-blur">
      {children}
    </header>
  );
}

function Main({ children }: { children: ReactNode }) {
  return <main className="flex-1 overflow-hidden">{children}</main>;
}

function Spacer() {
  return <div className="ml-auto flex items-center gap-1.5" />;
}

/** Push subsequent children to the right and group them with consistent spacing. */
function HeaderActions({ children }: { children: ReactNode }) {
  return <div className="ml-auto flex items-center gap-1.5">{children}</div>;
}

Shell.Header = Header;
Shell.Main = Main;
Shell.Spacer = Spacer;
Shell.HeaderActions = HeaderActions;
