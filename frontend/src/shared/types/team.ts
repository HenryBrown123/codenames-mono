import type { TeamPlayer } from "./player";

/** Visual configuration for rendering a team's identity across the UI */
export interface TeamVisualConfig {
  displayName: string;
  shortName: string;
  cssVar: string;
  fallbackColor: string;
  symbol: string;
  symbolRotate: boolean;
}

export const TEAM_CONFIG = {
  "Team Red": {
    displayName: "RED OPERATIVES",
    shortName: "RED",
    cssVar: "var(--color-team-red, #ff0040)",
    fallbackColor: "#ff0040",
    symbol: "□",
    symbolRotate: true,
  },
  "Team Blue": {
    displayName: "BLUE OPERATIVES",
    shortName: "BLUE",
    cssVar: "var(--color-team-blue, #00d4ff)",
    fallbackColor: "#00d4ff",
    symbol: "□",
    symbolRotate: false,
  },
} as const satisfies Record<string, TeamVisualConfig>;

/** Canonical team name type — derived from config keys */
export type TeamName = keyof typeof TEAM_CONFIG;

/** Runtime array for iteration / validation */
export const TEAM_NAMES = Object.keys(TEAM_CONFIG) as TeamName[];

/** Type guard */
export function isTeamName(value: string): value is TeamName {
  return value in TEAM_CONFIG;
}

/** Safe accessor with fallback for unknown teams */
export function getTeamConfig(teamName: string): TeamVisualConfig {
  if (isTeamName(teamName)) {
    return TEAM_CONFIG[teamName];
  }
  return {
    displayName: teamName.toUpperCase(),
    shortName: teamName.replace("Team ", "").toUpperCase(),
    cssVar: "#6b7280",
    fallbackColor: "#6b7280",
    symbol: "○",
    symbolRotate: false,
  };
}

/** Get the opposite team (works for 2-team games) */
export function getOppositeTeam(teamName: TeamName): TeamName | undefined {
  const others = TEAM_NAMES.filter((t) => t !== teamName);
  return others.length === 1 ? others[0] : undefined;
}

/** A team's state within a game (name, score, roster) */
export interface Team {
  name: string;
  score: number;
  players: TeamPlayer[];
}

export type { TeamPlayer } from "./player";
