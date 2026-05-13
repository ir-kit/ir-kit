import { useEffect } from "react";
import { recon } from "../../../app/recon-proxy";
import { harToSerialized } from "../../../network";
import { getCapturing } from "./capture-store";

const STATIC_EXT =
  /\.(css|js|mjs|map|png|jpe?g|gif|svg|webp|avif|ico|woff2?|ttf|otf|eot|html?|pdf|mp4|webm|mp3|wav)(\?|$)/i;
const SKIPPED_METHODS = new Set(["OPTIONS", "HEAD", "TRACE", "CONNECT"]);

function isStaticAsset(url: string): boolean {
  try {
    return STATIC_EXT.test(new URL(url).pathname);
  } catch {
    return false;
  }
}

let bound = false;
function bind(): void {
  if (bound) return;
  bound = true;
  browser.devtools.network.onRequestFinished.addListener(async (entry) => {
    if (!getCapturing()) return;
    if (SKIPPED_METHODS.has(entry.request.method.toUpperCase())) return;
    if (isStaticAsset(entry.request.url)) return;
    try {
      const payload = await harToSerialized(entry);
      void recon.observe(payload);
    } catch (e) {
      console.error("[glean] HAR serialize failed", e);
    }
  });
}

/** Bind once per panel mount — DevTools network events fan into the recon worker. */
export function useNetworkBinding(): void {
  useEffect(bind, []);
}
