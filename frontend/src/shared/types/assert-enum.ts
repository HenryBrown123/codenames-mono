/**
 * Asserts a string value belongs to an enum's value set.
 * Throws with a descriptive message if it doesn't — this is intentional.
 * API contract violations should scream, not silently degrade.
 */
export function assertEnum<T extends string>(
  value: string,
  validValues: Set<string>,
  label: string,
): asserts value is T {
  if (!validValues.has(value)) {
    throw new Error(
      `Invalid ${label}: "${value}". Expected one of: ${[...validValues].join(", ")}`,
    );
  }
}
