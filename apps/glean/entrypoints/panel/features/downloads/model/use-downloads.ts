import { useCallback, useEffect, useState } from "react";
import { SCANNER_EXPRESSION, type ScannedDownload } from "./scan-script";

interface DownloadsState {
  items: ScannedDownload[];
  loading: boolean;
  error: string | null;
}

const EMPTY: DownloadsState = { items: [], loading: false, error: null };

/**
 * Runs the page scanner via `chrome.devtools.inspectedWindow.eval` and
 * keeps the result in React state. Refreshes whenever the inspected page
 * navigates and on explicit `refresh()` calls.
 */
export function useDownloads(): DownloadsState & { refresh: () => void } {
  const [state, setState] = useState<DownloadsState>(EMPTY);

  const refresh = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    browser.devtools.inspectedWindow.eval<ScannedDownload[]>(
      SCANNER_EXPRESSION,
      (result, exception) => {
        if (exception) {
          setState({
            items: [],
            loading: false,
            error:
              typeof exception === "object" && exception != null
                ? JSON.stringify(exception)
                : String(exception),
          });
          return;
        }
        setState({
          items: Array.isArray(result) ? result : [],
          loading: false,
          error: null,
        });
      },
    );
  }, []);

  // Initial scan + re-scan on page navigation.
  useEffect(() => {
    refresh();
    const onNavigated = () => refresh();
    browser.devtools.network.onNavigated.addListener(onNavigated);
    return () => {
      browser.devtools.network.onNavigated.removeListener(onNavigated);
    };
  }, [refresh]);

  return { ...state, refresh };
}
