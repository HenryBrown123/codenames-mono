/**
 * Quick Victory Test Scenario
 * Team systematically guesses all their cards to win quickly
 */

import { runGameTest } from "./test-runner";
import type { TestScenario } from "./test-common";

export const QUICK_VICTORY_SCENARIO: TestScenario = {
  name: "Quick Victory",
  description: "Team wins by guessing all their cards correctly",
  strategy: Array(9).fill("CORRECT_TEAM_CARD"),
  expectedOutcome: "Team victory via completion",
};

export async function runQuickVictoryTest(verbose = true) {
  return await runGameTest(QUICK_VICTORY_SCENARIO, verbose);
}
