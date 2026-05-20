import type { TurnPhase } from "@frontend/shared/types";
import type { ClaimedPhase } from "../providers/active-game-session-provider";

/**
 * Single-device handoff — entirely separate from the post-turn flow.
 *
 *   'none'      — device is correctly claimed for the active turn
 *   'handoff'   — human turn, role or team differs from claimedPhase
 *   'ai-turn'   — AI turn, team differs from claimedPhase
 *
 * Only meaningful when there IS an active turn. When `active` is null
 * (which is what the post-turn window looks like), this returns 'none'
 * — that's why post-turn and handoff cannot collide.
 */
/** Outcome of the single-device handoff decision. */
export type HandoffView = "none" | "handoff" | "ai-turn";

/**
 * Pure rule: should the single-device flow block on an overlay, and
 * which one?
 *
 * Only meaningful when there IS an active turn. When `active` is
 * null (the post-turn window), this returns `"none"` — that's why
 * post-turn and handoff cannot collide.
 */
export function deriveHandoffView(
  active: TurnPhase | null,
  claimedPhase: ClaimedPhase | null,
): HandoffView {
  if (!active) return "none";

  if (active.isAi) {
    return active.teamName !== claimedPhase?.teamName ? "ai-turn" : "none";
  }

  const roleMatches = active.role === claimedPhase?.role;
  const teamMatches = active.teamName === claimedPhase?.teamName;
  return roleMatches && teamMatches ? "none" : "handoff";
}
