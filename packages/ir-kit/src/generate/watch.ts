import { type FSWatcher, watch as fsWatch } from "node:fs";
import { dirname, extname, resolve, sep } from "node:path";

import { loadIrConfig } from "./load-config.js";
import { generate, type TargetResult } from "./run.js";

export interface WatchOptions {
  cwd?: string;
  configFile?: string;
  only?: ReadonlyArray<string>;
  /** Called after each run. */
  onRun?: (results: TargetResult[]) => void;
  /** Called when a run fails. Watching continues. */
  onError?: (error: unknown) => void;
  signal?: AbortSignal;
}

const SPEC_EXTENSIONS = new Set([".yaml", ".yml", ".json", ".tsp", ".proto"]);

/**
 * Run `generate` once, then again whenever the config file or a local
 * spec changes. Resolves when `signal` aborts.
 */
export async function watch(opts: WatchOptions = {}): Promise<void> {
  let watchers: FSWatcher[] = [];
  let timer: NodeJS.Timeout | undefined;
  let running = Promise.resolve();
  const stopped = () => opts.signal?.aborted === true;

  const run = async () => {
    const { config, file, cwd } = await loadIrConfig(opts);
    if (stopped()) return;
    const outputs = Object.values(config.targets).map(
      (target) => resolve(cwd, target!.output) + sep,
    );
    const inputs = new Set(
      [config.input, ...Object.values(config.targets).map((t) => t!.input)]
        .filter((input): input is string => !!input)
        .filter((input) => !/^https?:\/\//i.test(input))
        .map((input) => dirname(resolve(cwd, input))),
    );
    const relevant = (path: string) =>
      path === file ||
      (SPEC_EXTENSIONS.has(extname(path)) &&
        !path.includes(`${sep}node_modules${sep}`) &&
        !outputs.some((out) => path.startsWith(out)));

    for (const watcher of watchers) watcher.close();
    watchers = [...new Set([dirname(file), ...inputs])].map((dir) =>
      fsWatch(dir, { recursive: dir !== dirname(file) || inputs.has(dir) })
        .on("change", (_event, name) => {
          if (name && relevant(resolve(dir, name.toString()))) schedule();
        })
        .on("error", (error) => opts.onError?.(error)),
    );
    opts.onRun?.(await generate(config, { cwd, only: opts.only }));
  };

  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (stopped()) return;
      running = running.then(run).catch((error) => opts.onError?.(error));
    }, 100);
  };

  running = run().catch((error) => opts.onError?.(error));
  await running;
  await new Promise<void>((done) => {
    if (opts.signal?.aborted) return done();
    opts.signal?.addEventListener("abort", () => done(), { once: true });
  });
  clearTimeout(timer);
  await running;
  for (const watcher of watchers) watcher.close();
}
