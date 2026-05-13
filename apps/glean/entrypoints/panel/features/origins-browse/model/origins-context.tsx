import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { recon } from "../../../app/recon-proxy";
import type { OriginStats } from "../../../recon-service";

const INITIAL: OriginStats = { totalSamples: 0, origins: [] };

interface OriginsValue extends OriginStats {
  /** Currently inspected origin, `null` when the picker is showing. */
  selected: string | null;
  select: (origin: string) => void;
  back: () => void;
  clearAll: () => void;
  clearOrigin: (origin: string) => void;
}

const OriginsContext = createContext<OriginsValue | null>(null);

export function OriginsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<OriginStats>(INITIAL);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    let cancelled = false;
    void recon.subscribe(setStats).then((u) => {
      if (cancelled) u();
      else unsub = u;
    });
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  useEffect(() => {
    if (selected && !stats.origins.some(([o]) => o === selected)) {
      setSelected(null);
    }
  }, [stats.origins, selected]);

  const select = useCallback((origin: string) => setSelected(origin), []);
  const back = useCallback(() => setSelected(null), []);

  const clearAll = useCallback(() => {
    const prev = { stats, selected };
    setStats(INITIAL);
    setSelected(null);
    recon.clear().catch((err) => {
      console.error("[glean] recon.clear failed; restoring UI", err);
      setStats(prev.stats);
      setSelected(prev.selected);
    });
  }, [stats, selected]);

  const clearOrigin = useCallback(
    (origin: string) => {
      const prev = { stats, selected };
      setStats((s) => ({
        ...s,
        origins: s.origins.filter(([o]) => o !== origin),
      }));
      setSelected((current) => (current === origin ? null : current));
      recon.clearOrigin(origin).catch((err) => {
        console.error("[glean] recon.clearOrigin failed; restoring UI", err);
        setStats(prev.stats);
        setSelected(prev.selected);
      });
    },
    [stats, selected],
  );

  const value = useMemo<OriginsValue>(
    () => ({
      ...stats,
      selected,
      select,
      back,
      clearAll,
      clearOrigin,
    }),
    [stats, selected, select, back, clearAll, clearOrigin],
  );

  return (
    <OriginsContext.Provider value={value}>{children}</OriginsContext.Provider>
  );
}

export function useOrigins(): OriginsValue {
  const ctx = useContext(OriginsContext);
  if (!ctx) {
    throw new Error("useOrigins must be used inside <OriginsProvider>");
  }
  return ctx;
}
