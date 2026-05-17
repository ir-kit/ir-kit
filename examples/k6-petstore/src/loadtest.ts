import {
  defineLoadTest,
  flow,
  load,
  smoke,
  spike,
  stress,
} from "@ahmedrowaihi/k6";

import * as api from "./gen/client.js";
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
      scenario: smoke({ vus: 1, duration: "30s" }),
      flow: flow()
        .step("seeded read", () => api.getPetById(1))
        .step("category", (pet) => api.getPetById(pet.id!)),
    },

    write: {
      scenario: load({
        target: 10,
        rampUp: "30s",
        hold: "1m",
        rampDown: "30s",
      }),
      flow: flow()
        .step("create", () => api.addPet(data.Pet()))
        .step("read", (pet) => api.getPetById(pet.id!))
        .step("update", (pet) => api.updatePet({ ...pet, status: "sold" }))
        .step("verify", (pet) => api.getPetById(pet.id!))
        .expect(
          (pet) => pet.status === "sold",
          "status should be sold after update",
        )
        .step("cleanup", (pet) => api.deletePet(pet.id!)),
    },

    // Open-model parallel fan-out via the generated `async` namespace.
    pageLoad: {
      scenario: smoke({ vus: 5, duration: "30s" }),
      flow: flow()
        .step("seed", () => 1)
        .batch("fan-out", (id) => ({
          id,
          available: api.async.findPetsByStatus({ status: "available" }),
          pending: api.async.findPetsByStatus({ status: "pending" }),
          pet: api.async.getPetById(id),
        }))
        .check(
          "all branches resolved",
          (res) =>
            res.pet !== null &&
            Array.isArray(res.available) &&
            Array.isArray(res.pending),
        ),
    },

    stressTest: {
      scenario: stress({ ceiling: 60, step: 20, perStep: "30s" }),
      flow: flow().step(() => api.findPetsByStatus({ status: "available" })),
    },

    spikeTest: {
      scenario: spike({
        baseline: 10,
        peak: 100,
        spikeDuration: "20s",
        recoverDuration: "30s",
      }),
      flow: flow().step(() => api.findPetsByStatus({ status: "available" })),
    },
  },
});

export const options = lt.options;
export default lt.default;
// k6 dispatches `exec: "<name>"` to module-level exports — re-export each
// named scenario so the bundle has matching top-level functions.
export const browse = lt.scenarios.browse;
export const write = lt.scenarios.write;
export const pageLoad = lt.scenarios.pageLoad;
export const stressTest = lt.scenarios.stressTest;
export const spikeTest = lt.scenarios.spikeTest;
