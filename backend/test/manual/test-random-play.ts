/**
 * Random Play Test Scenario
 * Completely unpredictable card selection for stress testing
 */

import { runGameTest } from "./test-runner";
import type { TestScenario } from "./test-common";

export const RANDOM_PLAY_SCENARIO: TestScenario = {
  name: "Random Play",
  description: "Completely random card selection",
  strategy: Array(15).fill("RANDOM"),
  expectedOutcome: "Unpredictable gameplay",
};

export async function runRandomPlayTest(verbose = true) {
  return await runGameTest(RANDOM_PLAY_SCENARIO, verbose);
}
