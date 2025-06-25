import { testQuickStartEndpoint } from "./test-quick-start";

// Run the test
testQuickStartEndpoint(true)
  .then(() => {
    console.log("\nTest completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nTest failed:", error);
    process.exit(1);
  });