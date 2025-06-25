import { testRoundCreationFlow } from "./test-round-creation-flow";

// Run the test
testRoundCreationFlow(true)
  .then(() => {
    console.log("\nTest completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nTest failed:", error);
    process.exit(1);
  });