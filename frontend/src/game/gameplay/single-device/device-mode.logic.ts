import type { TurnPhase } from "@frontend/shared/types";
import type { ClaimedPhase } from "../providers/active-game-session-provider";

/**
 * Pure function: should the handoff overlay be shown?
 *
 * Multi-device: never — server handles perspective via JWT.
 *
 * Single-device rules:
 *   • Human turn, role or team changed from claimed  → true
 *   • AI turn,   team differs from claimed team      → true  (pass device to other team)
 *   • AI turn,   team matches claimed team           → false (just show AI overlay)
 *   • No active turn                                  → false
 */
export function needsHandoff(
  active: TurnPhase | null,
  claimedPhase: ClaimedPhase | null,
  isMultiDevice: boolean,
): boolean {
  if (isMultiDevice || active === null) return false;

  // AI turns are always handled by AiTurnOverlay — never the handoff overlay
  if (active.isAi) return false;

  return active.role !== claimedPhase?.role || active.teamName !== claimedPhase?.teamName;
}
