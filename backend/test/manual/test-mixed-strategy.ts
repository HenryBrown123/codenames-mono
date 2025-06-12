/**
 * Mixed Strategy Test Scenario
 * Realistic gameplay with various card outcomes and turn transitions
 */

import { runGameTest } from "./test-runner";
import type { TestScenario } from "./test-common";

export const MIXED_STRATEGY_SCENARIO: TestScenario = {
  name: "Mixed Strategy",
  description: "Realistic gameplay with mixed outcomes",
  strategy: [
    "CORRECT_TEAM_CARD",
    "CORRECT_TEAM_CARD",
    "BYSTANDER_CARD",
    "CORRECT_TEAM_CARD",
    "OTHER_TEAM_CARD",
    "CORRECT_TEAM_CARD",
    "BYSTANDER_CARD",
    "CORRECT_TEAM_CARD",
  ],
  expectedOutcome: "Turn transitions and strategic play",
};

export async function runMixedStrategyTest(verbose = true) {
  return await runGameTest(MIXED_STRATEGY_SCENARIO, verbose);
}
