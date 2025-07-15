import { Card } from "@frontend/shared-types";

// Card colors
export const CARD_COLORS = {
  neutral: "#494646",
  assassin: "#0a0a0a",
  bystander: "#697188",
  red: "#B22222",
  blue: "#4169E1",
  green: "#228B22",
} as const;

/**
 * Gets the appropriate color for a card based on its type and team
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

/**
 * Gets icon for card based on color
 */
export const getCardIcon = (cardColor: string) => {
  if (cardColor === CARD_COLORS.red) return "★";
  if (cardColor === CARD_COLORS.blue) return "♦";
  if (cardColor === CARD_COLORS.green) return "🌿";
  if (cardColor === CARD_COLORS.assassin) return "☠";
  if (cardColor === CARD_COLORS.bystander) return "●";
  return null;
};

/**
 * Gets symbol string for team symbol overlay
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
 * Helper function to determine team type for AR elements
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
 * Helper function to determine if this is your team (for targeting brackets)
 * TODO: This should be derived from actual player/team context
 */
export const isYourTeam = (card: Card): boolean => {
  const team = card.teamName?.toLowerCase();
  // For now, assume red team is "your team" - this should be dynamic
  return team?.includes("red") || false;
};