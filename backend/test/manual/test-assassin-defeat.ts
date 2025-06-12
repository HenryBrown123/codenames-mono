/**
 * Assassin Defeat Test Scenario
 * Team immediately loses by hitting the assassin card
 */

import { runGameTest } from "./test-runner";
import type { TestScenario } from "./test-common";

export const ASSASSIN_DEFEAT_SCENARIO: TestScenario = {
  name: "Assassin Defeat",
  description: "Team loses by hitting the assassin",
  strategy: ["ASSASSIN_CARD"],
  expectedOutcome: "Immediate loss via assassin",
};

export async function runAssassinDefeatTest(verbose = true) {
  return await runGameTest(ASSASSIN_DEFEAT_SCENARIO, verbose);
}
