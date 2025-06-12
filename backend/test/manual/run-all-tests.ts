/**
 * Main entry point for running all test scenarios
 * Provides summary reporting and handles both individual and batch execution
 */

import { colors, type TestResult } from "./test-common";
import { runQuickVictoryTest } from "./test-quick-victory";
import { runAssassinDefeatTest } from "./test-assassin-defeat";
import { runMixedStrategyTest } from "./test-mixed-strategy";
import { runRandomPlayTest } from "./test-random-play";

/**
 * All available test scenarios
 */
const ALL_SCENARIOS = [
  { name: "quick", runner: runQuickVictoryTest },
  { name: "assassin", runner: runAssassinDefeatTest },
  { name: "mixed", runner: runMixedStrategyTest },
  { name: "random", runner: runRandomPlayTest },
];

/**
 * Formats duration in a human-readable way
 */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * Prints a comprehensive test summary
 */
function printSummary(results: TestResult[], totalDuration: number) {
  console.log(`\n${colors.bright}📊 Test Summary${colors.reset}`);
  console.log(`${"=".repeat(60)}`);

  const passed = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);
  const completed = results.filter((r) => r.roundCompleted);

  console.log(
    `${colors.bright}Overall:${colors.reset} ${passed.length}/${results.length} scenarios passed`,
  );
  console.log(
    `${colors.bright}Rounds:${colors.reset} ${completed.length}/${results.length} completed`,
  );
  console.log(
    `${colors.bright}Duration:${colors.reset} ${formatDuration(totalDuration)}`,
  );

  if (failed.length > 0) {
    console.log(`\n${colors.red}❌ Failed Scenarios:${colors.reset}`);
    failed.forEach((result) => {
      console.log(`  • ${result.scenario}: ${result.error || "Unknown error"}`);
    });
  }

  console.log(`\n${colors.bright}📋 Detailed Results:${colors.reset}`);
  results.forEach((result) => {
    const status = result.success
      ? `${colors.green}✓${colors.reset}`
      : `${colors.red}✗${colors.reset}`;
    const completion = result.roundCompleted
      ? `${colors.green}Complete${colors.reset}`
      : `${colors.yellow}Incomplete${colors.reset}`;

    console.log(
      `  ${status} ${result.scenario.padEnd(15)} | ${completion.padEnd(17)} | ${result.turnsPlayed.toString().padStart(2)} turns | ${formatDuration(result.duration || 0).padStart(6)}`,
    );
  });

  if (passed.length === results.length) {
    console.log(
      `\n${colors.green}🎉 All tests passed! Your game logic is solid.${colors.reset}`,
    );
  } else {
    console.log(
      `\n${colors.yellow}⚠️  Some tests failed. Check the error details above.${colors.reset}`,
    );
  }
}

/**
 * Runs all test scenarios
 */
async function runAllScenarios(): Promise<TestResult[]> {
  console.log(`${colors.bright}🚀 Running All Test Scenarios${colors.reset}\n`);

  const results: TestResult[] = [];

  for (const scenario of ALL_SCENARIOS) {
    const result = await scenario.runner(false); // Run in quiet mode
    results.push(result);
  }

  return results;
}

/**
 * Runs a specific scenario by name
 */
async function runSingleScenario(scenarioName: string): Promise<void> {
  const scenario = ALL_SCENARIOS.find((s) =>
    s.name.toLowerCase().includes(scenarioName.toLowerCase()),
  );

  if (!scenario) {
    console.log(
      `${colors.red}❌ Scenario "${scenarioName}" not found${colors.reset}`,
    );
    console.log(
      `Available scenarios: ${ALL_SCENARIOS.map((s) => s.name).join(", ")}`,
    );
    process.exit(1);
  }

  console.log(
    `${colors.bright}🎯 Running Single Scenario: ${scenario.name}${colors.reset}\n`,
  );
  const startTime = Date.now();
  const result = await scenario.runner(true); // Run in verbose mode
  const endTime = Date.now();

  console.log(`\n${colors.bright}📊 Single Test Summary${colors.reset}`);
  console.log(`${"=".repeat(40)}`);
  console.log(`${colors.bright}Scenario:${colors.reset} ${result.scenario}`);
  console.log(
    `${colors.bright}Status:${colors.reset} ${result.success ? `${colors.green}✓ Passed${colors.reset}` : `${colors.red}✗ Failed${colors.reset}`}`,
  );
  console.log(
    `${colors.bright}Round:${colors.reset} ${result.roundCompleted ? `${colors.green}Completed${colors.reset}` : `${colors.yellow}Incomplete${colors.reset}`}`,
  );
  console.log(`${colors.bright}Turns:${colors.reset} ${result.turnsPlayed}`);
  console.log(
    `${colors.bright}Strategy:${colors.reset} ${result.strategyExecuted}`,
  );
  console.log(
    `${colors.bright}Duration:${colors.reset} ${formatDuration(endTime - startTime)}`,
  );

  if (!result.success && result.error) {
    console.log(
      `${colors.bright}Error:${colors.reset} ${colors.red}${result.error}${colors.reset}`,
    );
  }

  if (result.success) {
    console.log(`\n${colors.green}🎉 Test passed!${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}💥 Test failed!${colors.reset}`);
    process.exit(1);
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    if (!command || command === "all") {
      // Run all scenarios
      const startTime = Date.now();
      const results = await runAllScenarios();
      const endTime = Date.now();

      printSummary(results, endTime - startTime);

      const allPassed = results.every((r) => r.success);
      process.exit(allPassed ? 0 : 1);
    } else if (command === "help" || command === "--help" || command === "-h") {
      // Show help
      console.log(`${colors.bright}Strategic Game Test Runner${colors.reset}`);
      console.log("Usage: npx tsx run-all-tests.ts [scenario|all|help]");
      console.log("\nCommands:");
      console.log("  all (default)  Run all test scenarios");
      console.log("  help           Show this help message");
      console.log("\nAvailable scenarios:");
      ALL_SCENARIOS.forEach((scenario) => {
        console.log(
          `  ${colors.cyan}${scenario.name}${colors.reset}         Run ${scenario.name} scenario only`,
        );
      });
      console.log("\nExamples:");
      console.log("  npx tsx run-all-tests.ts");
      console.log("  npx tsx run-all-tests.ts all");
      console.log("  npx tsx run-all-tests.ts quick");
      console.log("  npx tsx run-all-tests.ts assassin");
    } else {
      // Run single scenario
      await runSingleScenario(command);
    }
  } catch (error) {
    console.error(`${colors.red}Test runner failed:${colors.reset}`, error);
    process.exit(1);
  }
}

main();
