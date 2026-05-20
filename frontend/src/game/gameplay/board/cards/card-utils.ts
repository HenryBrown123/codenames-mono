import { Card } from "@frontend/shared/types";

/** Palette used by every card-rendering helper in this module. */
export const CARD_COLORS = {
  neutral: "#6b6b6b",      // Lighter neutral
  assassin: "#0a0a0a",     // Keep black
  bystander: "#8b8b8b",    // Lighter gray
  red: "#ff3333",          // Bright red
  blue: "#3399ff",         // Bright blue
  green: "#33cc33",        // Bright green
} as const;

/**
 * Resolves the fill colour for a card. Card type wins (assassin /
 * bystander), then team name is matched substring-wise so locale
 * variants like "Red Team" still pick up the red colour.
 */
export const getCardColor = (card: Card): string => {
  if (card.cardType === "ASSASSIN") return CARD_COLORS.assassin;
  if (card.cardType === "BYSTANDER") return CARD_COLORS.bystander;

  const team = card.teamName?.toLowerCase();
  if (team?.includes("red")) return CARD_COLORS.red;
  if (team?.includes("blue")) return CARD_COLORS.blue;
  if (team?.includes("green")) return CARD_COLORS.green;

  return CARD_COLORS.neutral;
};

/** Returns the glyph paired with a card colour, or null if unmapped. */
export const getCardIcon = (cardColor: string) => {
  if (cardColor === CARD_COLORS.red) return "★";
  if (cardColor === CARD_COLORS.blue) return "♦";
  if (cardColor === CARD_COLORS.green) return "🌿";
  if (cardColor === CARD_COLORS.assassin) return "☠";
  if (cardColor === CARD_COLORS.bystander) return "●";
  return null;
};

/**
 * Returns the team-symbol overlay character for a card colour. Same
 * mapping as {@link getCardIcon} but returns `""` rather than `null`
 * so it drops directly into a template string.
 */
export const getSymbol = (cardColor: string): string => {
  if (cardColor === CARD_COLORS.red) return "★";
  if (cardColor === CARD_COLORS.blue) return "♦";
  if (cardColor === CARD_COLORS.green) return "🌿";
  if (cardColor === CARD_COLORS.assassin) return "☠";
  if (cardColor === CARD_COLORS.bystander) return "●";
  return "";
};

/**
 * Returns the AR-overlay team class name for a card — `"red"`,
 * `"blue"`, `"green"`, `"assassin"`, or `"neutral"`. Matches by team
 * name substring (same logic as {@link getCardColor}).
 */
export const getTeamType = (card: Card): string => {
  if (card.cardType === "ASSASSIN") return "assassin";
  if (card.cardType === "BYSTANDER") return "neutral";
  
  const team = card.teamName?.toLowerCase();
  if (team?.includes("red")) return "red";
  if (team?.includes("blue")) return "blue";
  if (team?.includes("green")) return "green";
  
  return "neutral";
};

/**
 * Whether this card belongs to the viewer's team — used to drive
 * AR-overlay targeting brackets.
 *
 * @todo Derive from the actual player/team context rather than
 *       hard-coding "red" as the viewer's team.
 */
export const isYourTeam = (card: Card): boolean => {
  const team = card.teamName?.toLowerCase();
  return team?.includes("red") || false;
};