import { VisibilityContext } from "./context";

/** True for a codemaster. */
export const isCodemaster = (ctx: VisibilityContext): boolean => ctx.role === "CODEMASTER";

/** True for a codebreaker. */
export const isCodebreaker = (ctx: VisibilityContext): boolean => ctx.role === "CODEBREAKER";

/** True for spectators and unrostered viewers. */
export const isSpectator = (ctx: VisibilityContext): boolean =>
  ctx.role === "SPECTATOR" || ctx.role === "NONE";

/** True when the viewer holds any role on a team. */
export const hasRole = (ctx: VisibilityContext): boolean =>
  ctx.role !== "NONE" && ctx.teamName !== undefined;

/** Active human codemaster on their own team with no clue submitted yet. */
export const isCodemasterGivingClue = (ctx: VisibilityContext): boolean =>
  !ctx.isAiSession && ctx.hasActiveTurn && ctx.role === "CODEMASTER" && ctx.isActiveTeam && !ctx.hasClue;

/** Codemaster watching — not their turn or clue already given. */
export const isCodemasterObserving = (ctx: VisibilityContext): boolean =>
  ctx.role === "CODEMASTER" && (!ctx.hasActiveTurn || !ctx.isActiveTeam || ctx.hasClue);

/** Active human codebreaker on their own team with a clue and guesses left. */
export const isCodebreakerGuessing = (ctx: VisibilityContext): boolean =>
  !ctx.isAiSession && ctx.hasActiveTurn && ctx.role === "CODEBREAKER" && ctx.isActiveTeam && ctx.hasClue && ctx.guessesRemaining > 0;

/** Codebreaker watching — not their turn, no clue, or out of guesses. */
export const isCodebreakerObserving = (ctx: VisibilityContext): boolean =>
  ctx.role === "CODEBREAKER" && (!ctx.hasActiveTurn || !ctx.isActiveTeam || !ctx.hasClue || ctx.guessesRemaining === 0);

/** Any "watching, not acting" state — spectator or off-turn role. */
export const isObserving = (ctx: VisibilityContext): boolean =>
  isSpectator(ctx) || isCodemasterObserving(ctx) || isCodebreakerObserving(ctx);

/** Pre-game lobby — no round yet, or round still in setup. */
export const isInLobby = (ctx: VisibilityContext): boolean =>
  !ctx.hasRound || ctx.roundStatus === "SETUP";

/** Current round finished (winner decided). */
export const isRoundComplete = (ctx: VisibilityContext): boolean => ctx.roundStatus === "COMPLETED";

/** Current round actively being played. */
export const isRoundInProgress = (ctx: VisibilityContext): boolean =>
  ctx.roundStatus === "IN_PROGRESS";

/** Round is in progress or completed (i.e. cards have been dealt). */
export const isRoundActive = (ctx: VisibilityContext): boolean =>
  ctx.roundStatus === "IN_PROGRESS" || ctx.roundStatus === "COMPLETED";

/** Lobby with no cards yet — deal action is available. */
export const canDealCards = (ctx: VisibilityContext): boolean => isInLobby(ctx) && !ctx.hasCards;

/** Lobby with cards already dealt — start-round action is available. */
export const canStartRound = (ctx: VisibilityContext): boolean => isInLobby(ctx) && ctx.hasCards;

/** Lobby with cards already dealt — re-deal action is available. */
export const canRedeal = (ctx: VisibilityContext): boolean => isInLobby(ctx) && ctx.hasCards;

/** True while the AI is on turn (either available to trigger or already thinking). */
export const isAiActive = (ctx: VisibilityContext): boolean =>
  isRoundInProgress(ctx) && ctx.hasActiveTurn && (ctx.aiAvailable || ctx.aiThinking);

/**
 * Whether to expose the AR (spymaster enhanced vision) toggle.
 *
 * Restricted to a human codemaster during an active round. Hidden
 * during AI turns — the AI doesn't need the lens, and showing it
 * while the AI is playing would be confusing.
 */
export const canUseArToggle = (ctx: VisibilityContext): boolean =>
  !ctx.isAiSession && isCodemaster(ctx) && isRoundInProgress(ctx);

/** Constant-true visibility rule. */
export const always = (_ctx: VisibilityContext): boolean => true;

/** Constant-false visibility rule. */
export const never = (_ctx: VisibilityContext): boolean => false;
