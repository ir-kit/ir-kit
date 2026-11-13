import { styleText } from "node:util";

type Color = Parameters<typeof styleText>[0];

let quiet = false;

const line =
  (mark: string, color: Color, stream: "stdout" | "stderr", always = false) =>
  (message: string) => {
    if (quiet && !always) return;
    const out = process[stream];
    out.write(`${styleText(color, mark, { stream: out })} ${message}\n`);
  };

/** CLI output. `error` still prints when quiet. */
export const log = {
  success: line("✔", "green", "stdout"),
  info: line("ℹ", "cyan", "stdout"),
  start: line("◐", "magenta", "stdout"),
  warn: line("⚠", "yellow", "stderr"),
  error: line("✖", "red", "stderr", true),
  /** A summary line, set apart from the rest. */
  box: (message: string) => {
    if (quiet) return;
    process.stdout.write(`\n${styleText("bold", message)}\n\n`);
  },
  setQuiet: (value: boolean) => {
    quiet = value;
  },
};
