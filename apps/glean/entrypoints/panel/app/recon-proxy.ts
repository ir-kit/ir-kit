import {
  type Adapter,
  defineProxy,
  type OnMessage,
  type SendMessage,
} from "comctx";
import { RECON_NAMESPACE, type ReconService } from "../recon-service";
import ReconWorker from "../recon-worker.ts?worker";

class WorkerInjectAdapter implements Adapter {
  constructor(public worker: Worker) {}
  sendMessage: SendMessage = (message) => this.worker.postMessage(message);
  onMessage: OnMessage = (callback) => {
    const handler = (event: MessageEvent) => callback(event.data);
    this.worker.addEventListener("message", handler);
    return () => this.worker.removeEventListener("message", handler);
  };
}

const [, injectRecon] = defineProxy(() => ({}) as ReconService, {
  namespace: RECON_NAMESPACE,
});

/** Singleton worker-backed Recon proxy. One instance per panel lifetime. */
export const recon = injectRecon(new WorkerInjectAdapter(new ReconWorker()));
