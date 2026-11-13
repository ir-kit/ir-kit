import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import { styleText } from "node:util";

export const interactive = (): boolean => Boolean(stdin.isTTY && stdout.isTTY);

async function question(message: string): Promise<string> {
  const rl = createInterface({ input: stdin, output: stdout });
  rl.once("SIGINT", () => {
    rl.close();
    stdout.write("\nCancelled.\n");
    process.exit(1);
  });
  try {
    return (await rl.question(`${styleText("cyan", "?")} ${message} `)).trim();
  } finally {
    rl.close();
  }
}

/** Ask for text. Empty answers fall back to `fallback`, or ask again. */
export async function ask(message: string, fallback?: string): Promise<string> {
  for (;;) {
    const hint = fallback ? styleText("dim", `(${fallback})`) : "";
    const answer = (await question(`${message} ${hint}`)) || fallback;
    if (answer) return answer;
  }
}

/** Ask for one of `choices`, by number or name. */
export async function choose<T extends string>(
  message: string,
  choices: ReadonlyArray<T>,
  fallback: T = choices[0]!,
): Promise<T> {
  const list = choices.map((c, i) => `  ${i + 1}. ${c}`).join("\n");
  for (;;) {
    const answer = await ask(`${message}\n${list}\n `, fallback);
    const picked =
      choices[Number(answer) - 1] ?? choices.find((c) => c === answer);
    if (picked) return picked;
  }
}

/** Ask for some of `choices`, comma-separated, by number or name. */
export async function chooseSome<T extends string>(
  message: string,
  choices: ReadonlyArray<T>,
): Promise<T[]> {
  const list = choices.map((c, i) => `  ${i + 1}. ${c}`).join("\n");
  for (;;) {
    const answer = await ask(`${message} (comma-separated)\n${list}\n `);
    const picked = answer
      .split(",")
      .map((a) => a.trim())
      .map((a) => choices[Number(a) - 1] ?? choices.find((c) => c === a));
    if (picked.length > 0 && picked.every(Boolean)) return picked as T[];
  }
}
