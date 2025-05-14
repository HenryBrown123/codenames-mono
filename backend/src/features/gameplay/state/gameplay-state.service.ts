import { GameplayStateProvider } from "../state/gameplay-state.provider";
import { complexProperties } from "../state/gameplay-state.helpers";
import { GameAggregate, Round, Player } from "../state/gameplay-state.types";
import { PLAYER_ROLE, ROUND_STATE, PlayerRole } from "@codenames/shared/types";
import { CardResult } from "@backend/common/data-access/cards.repository";

/**
 * Basic input required to get a game state
 */
export type GetGameStateInput = {
  gameId: string;
  userId: number;
  playerId?: number; // Optional player ID for single-device mode
};

/**
 * Error types for game state retrieval
 */
export const GAME_STATE_ERROR = {
  GAME_NOT_FOUND: "game-not-found",
  UNAUTHORIZED: "unauthorized",
} as const;

/**
 * Represents failure scenarios when retrieving game state
 */
export type GetGameStateFailure =
  | { status: typeof GAME_STATE_ERROR.GAME_NOT_FOUND; gameId: string }
  | {
      status: typeof GAME_STATE_ERROR.UNAUTHORIZED;
      userId: number;
      playerId?: number;
    };

/**
 * The complete result of retrieving a game state
 */
export type GetGameStateResult =
  | { success: true; data: GameStateResponse }
  | { success: false; error: GetGameStateFailure };

/**
 * Client-friendly game state response
 */
export type GameStateResponse = {
  id: number;
  publicId: string;
  status: string;
  gameType: string;
  gameFormat: string;
  createdAt: Date;
  teams: TeamResponse[];
  currentRound: CurrentRoundResponse | null;
  historicalRounds: HistoricalRoundResponse[];
  playerContext: {
    playerId?: number;
    teamId?: number;
    role: PlayerRole;
  };
};

/**
 * Team data for response
 */
export type TeamResponse = {
  id: number;
  name: string;
  score: number;
  players: PlayerResponse[];
};

/**
 * Player data for response
 */
export type PlayerResponse = {
  id: number;
  userId: number;
  name: string;
  isActive: boolean;
};

/**
 * Round role assignment
 */
export type RoleAssignment = {
  playerId: number;
  teamId: number;
  role: PlayerRole;
};

/**
 * Current round data for response
 */
export type CurrentRoundResponse = {
  id: number;
  roundNumber: number;
  status: string;
  startingTeamId: number;
  cards: CardResponse[];
  currentTeamId: number;
  currentTurn?: TurnResponse;
  roleAssignments: RoleAssignment[];
};

/**
 * Card data for response
 */
export type CardResponse = {
  id: number;
  word: string;
  selected: boolean;
  teamId?: number | null;
  cardType?: string;
};

/**
 * Turn data for response
 */
export type TurnResponse = {
  id: number;
  teamId: number;
  clue?: {
    word: string;
    number: number;
  };
  guessesRemaining?: number;
};

/**
 * Historical round data for response
 */
export type HistoricalRoundResponse = {
  id: number;
  roundNumber: number;
  status: string;
  winningTeamId?: number;
  startingTeamId: number;
  cards: CardResponse[];
  roleAssignments: RoleAssignment[];
};

/**
 * Dependencies required by the game state service
 */
export type GetGameStateDependencies = {
  getGameState: GameplayStateProvider;
  getRoundRoleAssignments: (roundId: number) => Promise<RoleAssignment[]>;
};

/**
 * Creates a service for retrieving role-specific game state
 *
 * @param dependencies - External dependencies required by this service
 * @returns Function that retrieves game state with proper role-based visibility
 */
export const getGameStateService = (dependencies: GetGameStateDependencies) => {
  /**
   * Retrieves the game state with visibility rules applied based on player role
   *
   * @param input - Game ID, user ID, and optional player ID
   * @returns Role-specific game state or error
   */
  return async (input: GetGameStateInput): Promise<GetGameStateResult> => {
    // Retrieve raw game state from provider
    const gameData = await dependencies.getGameState(input.gameId);

    if (!gameData) {
      return {
        success: false,
        error: {
          status: GAME_STATE_ERROR.GAME_NOT_FOUND,
          gameId: input.gameId,
        },
      };
    }

    // Determine player's role for the current round
    const currentRound = complexProperties.getLatestRound(gameData);
    const roleAssignments = currentRound
      ? await dependencies.getRoundRoleAssignments(currentRound.id)
      : [];

    // TODO: improve this role lookup.... seems silly I need the whole of gamedata, roleassignments along with
    // userId and playerId.... can't we p
    const playerRole = determinePlayerRole(
      input.userId,
      input.playerId,
      roleAssignments,
      gameData,
    );

    if (playerRole === PLAYER_ROLE.NONE) {
      return {
        success: false,
        error: {
          status: GAME_STATE_ERROR.UNAUTHORIZED,
          userId: input.userId,
          playerId: input.playerId,
        },
      };
    }

    // Build the response with role-specific visibility rules
    return {
      success: true,
      data: buildGameStateResponse(
        gameData,
        playerRole,
        roleAssignments,
        input.playerId,
      ),
    };
  };
};

/**
 * Determines a player's role based on role assignments and game context
 *
 * @param userId - User ID requesting the state
 * @param playerId - Optional player ID in the game
 * @param roleAssignments - Current role assignments
 * @param gameData - Complete game state
 * @returns The determined player role
 */
const determinePlayerRole = (
  userId: number,
  playerId: number | undefined,
  roleAssignments: RoleAssignment[],
  gameData: GameAggregate,
): PlayerRole => {
  if (!playerId) {
    return PLAYER_ROLE.CODEMASTER;
  }

  // Check if player belongs to this game
  const playerExists = gameData.teams.some((team) =>
    team.players.some(
      (player) => player.id === playerId && player.userId === userId,
    ),
  );

  if (!playerExists) {
    return PLAYER_ROLE.NONE;
  }

  // Multi-device mode checks role assignments
  const playerAssignment = roleAssignments.find((r) => r.playerId === playerId);
  return playerAssignment?.role || PLAYER_ROLE.SPECTATOR;
};

/**
 * Builds a complete game state response with proper role-based visibility
 *
 * @param gameData - Complete aggregated game data
 * @param playerRole - Role of the requesting player
 * @param roleAssignments - Current role assignments
 * @param playerId - Optional player ID in the game
 * @returns Complete game state response
 */
const buildGameStateResponse = (
  gameData: GameAggregate,
  playerRole: PlayerRole,
  roleAssignments: RoleAssignment[],
  playerId?: number,
): GameStateResponse => {
  const currentRound = complexProperties.getLatestRound(gameData);
  const historicalRounds = gameData.rounds.filter(
    (round) =>
      round.id !== currentRound?.id && round.status === ROUND_STATE.COMPLETED,
  );

  // Find the player's team
  const playerTeam = playerId
    ? findPlayerTeam(playerId, gameData.teams)
    : undefined;

  return {
    id: gameData.id,
    publicId: gameData.public_id,
    status: gameData.status,
    gameType: gameData.game_type,
    gameFormat: gameData.game_format,
    createdAt: new Date(), // This would ideally come from gameData

    teams: buildTeamsResponse(gameData.teams, historicalRounds),

    currentRound: currentRound
      ? buildCurrentRoundResponse(currentRound, playerRole, roleAssignments)
      : null,

    historicalRounds: historicalRounds.map((round) =>
      buildHistoricalRoundResponse(round, playerRole, roleAssignments),
    ),

    playerContext: {
      playerId,
      teamId: playerTeam?.id,
      role: playerRole,
    },
  };
};

/**
 * Finds a player's team
 *
 * @param playerId - ID of the player to find
 * @param teams - Available teams in the game
 * @returns The player's team or undefined
 */
const findPlayerTeam = (playerId: number, teams: GameAggregate["teams"]) => {
  return teams.find((team) =>
    team.players.some((player) => player.id === playerId),
  );
};

/**
 * Builds the teams section of the response
 *
 * @param teams - Teams from the game data
 * @param historicalRounds - Completed rounds for score calculation
 * @returns Array of team responses
 */
const buildTeamsResponse = (
  teams: GameAggregate["teams"],
  historicalRounds: Round[],
): TeamResponse[] => {
  return teams.map((team) => ({
    id: team.id,
    name: team.teamName,
    score: calculateTeamScore(team.id, historicalRounds),
    players: team.players.map((player) => ({
      id: player.id,
      userId: player.userId,
      name: player.publicName,
      isActive: player.statusId === 1, // Assuming status 1 = active
    })),
  }));
};

/**
 * Calculates a team's score based on completed rounds
 *
 * @param teamId - ID of the team
 * @param historicalRounds - Completed rounds
 * @returns The team's score
 */
const calculateTeamScore = (
  teamId: number,
  historicalRounds: Round[],
): number => {
  // Count rounds where this team was the winner
  return historicalRounds.filter((round) => {
    // This would be replaced with actual logic to determine winners
    // For now it's just a placeholder
    return false; // Replace with actual winner logic
  }).length;
};

/**
 * Builds the current round response with role-specific visibility
 *
 * @param round - Current round data
 * @param playerRole - Role of the requesting player
 * @param roleAssignments - Current role assignments
 * @returns Current round response
 */
const buildCurrentRoundResponse = (
  round: Round,
  playerRole: PlayerRole,
  roleAssignments: RoleAssignment[],
): CurrentRoundResponse => {
  // Determine the starting team (this would come from your game logic)
  const startingTeamId = determineStartingTeam(round);

  // Determine the current team's turn (also from game logic)
  const currentTeamId = determineCurrentTeam(round);

  return {
    id: round.id,
    roundNumber: round.roundNumber,
    status: round.status,
    startingTeamId,
    cards: round.cards.map((card) =>
      applyCardVisibilityRules(card, playerRole),
    ),
    currentTeamId,
    currentTurn: buildCurrentTurnResponse(round),
    roleAssignments: roleAssignments,
  };
};

/**
 * Determines the starting team for a round
 *
 * @param round - Round data
 * @returns ID of the starting team
 */
const determineStartingTeam = (round: Round): number => {
  // This would use your game logic to determine the starting team
  // For now, return a placeholder value
  return 1;
};

/**
 * Determines the team currently taking its turn
 *
 * @param round - Round data
 * @returns ID of the current team
 */
const determineCurrentTeam = (round: Round): number => {
  // This would use your game logic to determine the current team
  // For now, return a placeholder value
  return 1;
};

/**
 * Builds the current turn response
 *
 * @param round - Current round data
 * @returns Current turn information or undefined
 */
const buildCurrentTurnResponse = (round: Round): TurnResponse | undefined => {
  // This would extract current turn information from the round
  // For now, return undefined as a placeholder
  return undefined;
};

/**
 * Builds a historical round response with role-specific visibility
 *
 * @param round - Historical round data
 * @param playerRole - Role of the requesting player
 * @param allRoleAssignments - All role assignments
 * @returns Historical round response
 */
const buildHistoricalRoundResponse = (
  round: Round,
  playerRole: PlayerRole,
  allRoleAssignments: RoleAssignment[],
): HistoricalRoundResponse => {
  // Filter to just the role assignments for this round
  const roundRoleAssignments = allRoleAssignments.filter(
    (assignment) => assignment.roundId === round.id,
  );

  return {
    id: round.id,
    roundNumber: round.roundNumber,
    status: round.status,
    winningTeamId: determineWinningTeam(round),
    startingTeamId: determineStartingTeam(round),
    cards: round.cards.map((card) =>
      applyCardVisibilityRules(card, playerRole),
    ),
    roleAssignments: roundRoleAssignments,
  };
};

/**
 * Determines the winning team for a completed round
 *
 * @param round - Completed round data
 * @returns ID of the winning team or undefined
 */
const determineWinningTeam = (round: Round): number | undefined => {
  // This would use your game logic to determine the winner
  // For now, return undefined as a placeholder
  return undefined;
};

/**
 * Applies role-specific visibility rules to a card
 *
 * @param card - Card data
 * @param playerRole - Role of the requesting player
 * @returns Card with appropriate visibility
 */
const applyCardVisibilityRules = (
  card: CardResult,
  playerRole: PlayerRole,
): CardResponse => {
  const baseCard = {
    id: card.id,
    word: card.word,
    selected: card.selected,
  };

  // Codemasters can see everything
  if (playerRole === PLAYER_ROLE.CODEMASTER) {
    return {
      ...baseCard,
      teamId: card.teamId,
      cardType: card.cardType,
    };
  }

  // Others can only see revealed information
  if (card.selected) {
    return {
      ...baseCard,
      teamId: card.teamId,
      cardType: card.cardType,
    };
  }

  // Unrevealed cards show minimal info
  return baseCard;
};
