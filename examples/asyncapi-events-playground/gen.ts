import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  amqplib,
  dispatch,
  eventMap,
  events,
  generate,
  indexBarrel,
  typescript,
} from "@ir-kit/asyncapi-typescript";

const here = dirname(fileURLToPath(import.meta.url));

const result = await generate({
  input: resolve(here, "../../fixtures/user-events.yaml"),
  output: resolve(here, "generated"),
  plugins: [
    typescript(),
    events(),
    eventMap(),
    dispatch(),
    amqplib(),
    indexBarrel(),
  ],
});

console.log(`wrote ${result.files.length} files → ${result.output}`);
