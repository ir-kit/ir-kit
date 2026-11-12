import type { TypiaPlugin } from "./types.js";
import { handlerV1 } from "./v1/plugin.js";

export const handler: TypiaPlugin["Handler"] = (args) => handlerV1(args);
