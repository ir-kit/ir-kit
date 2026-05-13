import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { recon } from "../../../app/recon-proxy";
import { useOrigins } from "../../origins-browse/model/origins-context";

interface SpecValue {
  spec: object | null;
  /** True while a fetch is in flight for the currently selected origin. */
  loading: boolean;
  /** Last fetch failure message, cleared on next successful load. */
  error: string | null;
}

const SpecContext = createContext<SpecValue | null>(null);

export function SpecProvider({ children }: { children: ReactNode }) {
  const { selected, totalSamples } = useOrigins();
  const [spec, setSpec] = useState<object | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selected) {
      setSpec(null);
      setLoading(false);
      setError(null);
      return;
    }
    let stale = false;
    setLoading(true);
    setError(null);
    recon
      .exportSpec(selected)
      .then((doc) => {
        if (stale) return;
        setSpec(doc);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (stale) return;
        setSpec(null);
        setLoading(false);
        setError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      stale = true;
    };
  }, [selected, totalSamples]);

  return (
    <SpecContext.Provider value={{ spec, loading, error }}>
      {children}
    </SpecContext.Provider>
  );
}

export function useSpec(): SpecValue {
  const ctx = useContext(SpecContext);
  if (!ctx) {
    throw new Error("useSpec must be used inside <SpecProvider>");
  }
  return ctx;
}
