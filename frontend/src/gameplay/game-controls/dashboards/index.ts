// Shared dashboard state hook
export { useDashboardState } from "./use-dashboard-state";
export type { DashboardState } from "./use-dashboard-state";

// Panel config exports
export * from "./config";
export * from "./panels";

// Shared terminal components
export * from "./shared";

// Keep CodeWordInput as it's used externally
export { CodeWordInput } from "./panels/codemaster-input";
