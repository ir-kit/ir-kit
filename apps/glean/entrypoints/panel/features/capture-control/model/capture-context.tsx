import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  getCapturing,
  onCapturingChange,
  setCapturing as setCapturingStore,
} from "./capture-store";

interface CaptureValue {
  capturing: boolean;
  toggle: () => void;
  setCapturing: (next: boolean) => void;
}

const CaptureContext = createContext<CaptureValue | null>(null);

export function CaptureProvider({ children }: { children: ReactNode }) {
  const [capturing, setCapturingState] = useState<boolean>(getCapturing);

  useEffect(() => onCapturingChange(setCapturingState), []);

  const setCapturing = (next: boolean) => {
    setCapturingStore(next);
  };

  return (
    <CaptureContext.Provider
      value={{
        capturing,
        toggle: () => setCapturing(!capturing),
        setCapturing,
      }}
    >
      {children}
    </CaptureContext.Provider>
  );
}

export function useCapture(): CaptureValue {
  const ctx = useContext(CaptureContext);
  if (!ctx) {
    throw new Error("useCapture must be used inside <CaptureProvider>");
  }
  return ctx;
}
