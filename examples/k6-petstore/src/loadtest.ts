import {
  defineLoadTest,
  flow,
  load,
  smoke,
  spike,
  stress,
} from "@ahmedrowaihi/k6";

import {
  addPet,
  deletePet,
  findPetsByStatus,
  getPetById,
  updatePet,
} from "./gen/client.js";
import { data } from "./gen/data.js";

// For an authed API, add `use: [useAuth.bearer({ env: "API_TOKEN" })]`.
const lt = defineLoadTest({
  // petstore3 demo is flaky (intermittent 5xx); budgets are loose here.
  // Tighten against your own backend.
  budgets: {
    p95: "500ms",
    p99: "1.5s",
    errors: "50%",
    ops: {
      getPetById: { p95: "300ms" },
      addPet: { p95: "500ms" },
    },
  },

  scenarios: {
    browse: {
      pace: smoke({ vus: 1, duration: "30s" }),
      flow: flow()
        .step("seeded read", () => getPetById(1))
        .step("category", (pet) => getPetById(pet.id!)),
    },

    write: {
      pace: load({ target: 10, rampUp: "30s", hold: "1m", rampDown: "30s" }),
      flow: flow()
        .step("create", () => addPet(data.Pet()))
        .step("read", (pet) => getPetById(pet.id!))
        .step("update", (pet) => updatePet({ ...pet, status: "sold" }))
        .step("verify", (pet) => getPetById(pet.id!))
        .expect(
          (pet) => pet.status === "sold",
          "status should be sold after update",
        )
        .step("cleanup", (pet) => deletePet(pet.id!)),
    },

    stressTest: {
      pace: stress({ ceiling: 60, step: 20, perStep: "30s" }),
      flow: flow().step(() => findPetsByStatus({ status: "available" })),
    },

    spikeTest: {
      pace: spike({
        baseline: 10,
        peak: 100,
        spikeDuration: "20s",
        recoverDuration: "30s",
      }),
      flow: flow().step(() => findPetsByStatus({ status: "available" })),
    },
  },
});

export const options = lt.options;
export default lt.default;
// k6 dispatches `exec: "<name>"` to module-level exports — these three lines
// are the bridge between the scenarios block and the runtime.
export const { browse, write, stressTest, spikeTest } = lt.scenarios;
