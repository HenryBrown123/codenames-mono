import { GameAggregate } from "../state/gameplay-state.types";
import { PLAYER_ROLE, PlayerRole, ROUND_STATE } from "@codenames/shared/types";
import { GameplayStateProvider } from "../state/gameplay-state.provider";

/**
 * Service input parameters
 */
export type GetGameStateInput = {
  gameId: string;
  userId: number;
  playerId: string | null;
};

export type GetGameStateResult =
  | { success: true; data: PublicGameStateResponse }
  | { success: false; error: GetGameStateFailure };

/**
 * Public API response structure
 */
export type PublicGameStateResponse = {
  publicId: string;
  status: string;
  gameType: string;
  gameFormat: string;
  createdAt: Date;
  teams: {
    name: string;
    score: number;
    players: {
      publicId: string;
      name: string;
      isActive: boolean;
      username?: string;
    }[];
  }[];
  currentRound: {
    roundNumber: number;
    status: string;
    winningTeamName?: string | null;
    cards: {
      word: string;
      selected: boolean;
      teamName?: string | null;
      cardType?: string;
    }[];
    turns: {
      id: string;
      teamName: string;
      status: string;
      guessesRemaining: number;
      clue?: { word: string; number: number };
      guesses: {
        playerName: string;
        outcome: string | null;
      }[];
    }[];
  } | null;
  playerContext: {
    publicId: string;
    playerName: string;
    teamName: string;
    role: PlayerRole;
  } | null;
};

/**
 * Error types for the service
 */
export const GAME_STATE_ERROR = {
  GAME_NOT_FOUND: "game-not-found",
  UNAUTHORIZED: "unauthorized",
  PLAYER_NOT_FOUND: "player-not-found",
  PLAYER_NOT_IN_GAME: "player-not-in-game",
} as const;

/**
 * Response types
 */
export type GetGameStateFailure =
  | { status: typeof GAME_STATE_ERROR.GAME_NOT_FOUND; gameId: string }
  | { status: typeof GAME_STATE_ERROR.UNAUTHORIZED; userId: number }
  | { status: typeof GAME_STATE_ERROR.PLAYER_NOT_FOUND; playerId: string }
  | { status: typeof GAME_STATE_ERROR.PLAYER_NOT_IN_GAME; playerId: string; gameId: string };

/**
 * Dependencies required by the service
 */
export type GetGameStateDependencies = {
  getGameState: GameplayStateProvider;
};

/**
 * Creates a service for retrieving role-specific game state
 */
export const getGameStateService = (dependencies: GetGameStateDependencies) => {
  return async (input: GetGameStateInput): Promise<GetGameStateResult> => {
    const result = await dependencies.getGameState(input.gameId, input.userId, input.playerId);

    if (result.status === "game-not-found") {
      console.log(`Game not found: gameId=${input.gameId}`);
      return {
        success: false,
        error: {
          status: GAME_STATE_ERROR.GAME_NOT_FOUND,
          gameId: input.gameId,
        },
      };
    }

    if (result.status === "user-not-player") {
      console.log(`User not player: gameId=${input.gameId}, userId=${input.userId}`);
      return {
        success: false,
        error: {
          status: GAME_STATE_ERROR.UNAUTHORIZED,
          userId: input.userId,
        },
      };
    }

    if (result.status === "player-not-found") {
      console.log(`Player not found: playerId=${input.playerId}`);
      return {
        success: false,
        error: {
          status: GAME_STATE_ERROR.PLAYER_NOT_FOUND,
          playerId: input.playerId!, // Safe assertion - this error only occurs when playerId was provided
        },
      };
    }

    if (result.status === "player-not-in-game") {
      console.log(`Player not in game: playerId=${input.playerId}, gameId=${input.gameId}`);
      return {
        success: false,
        error: {
          status: GAME_STATE_ERROR.PLAYER_NOT_IN_GAME,
          playerId: input.playerId!, // Safe assertion - this error only occurs when playerId was provided
          gameId: input.gameId,
        },
      };
    }

    if (result.status === "user-not-authorized") {
      console.log(`User not authorized: userId=${input.userId}, playerId=${input.playerId}`);
      return {
        success: false,
        error: {
          status: GAME_STATE_ERROR.UNAUTHORIZED,
          userId: input.userId,
        },
      };
    }

    // result.status === 'found' (all other cases handled above)
    return {
      success: true,
      data: transformGameState(result.data),
    };
  };
};

/**
 * Transforms the internal game state to the public API format
 */
function transformGameState(gameData: GameAggregate): PublicGameStateResponse {
  const playerRole = gameData.playerContext?.role || PLAYER_ROLE.NONE;

  return {
    publicId: gameData.public_id,
    status: gameData.status,
    gameType: gameData.game_type,
    gameFormat: gameData.game_format,
    createdAt: gameData.createdAt,

    teams: gameData.teams.map((team) => ({
      name: team.teamName,
      score: 0, // Placeholder for score calculation
      players: team.players.map((player) => ({
        publicId: player.publicId,
        name: player.publicName,
        isActive: player.statusId === 1,
        username: player.username,
      })),
    })),

    // Transform current round with role-based visibility
    currentRound: gameData.currentRound
      ? {
          roundNumber: gameData.currentRound.number,
          status: gameData.currentRound.status,
          winningTeamName: gameData.currentRound.winningTeamName,
          cards: gameData.currentRound.cards.map((card) =>
            applyCardVisibility(card, playerRole, gameData.currentRound!.status),
          ),

          turns: gameData.currentRound.turns.map((turn) => ({
            id: turn.publicId,
            teamName: turn.teamName,
            status: turn.status,
            guessesRemaining: turn.guessesRemaining,
            clue: turn.clue
              ? {
                  word: turn.clue.word,
                  number: turn.clue.number,
                }
              : undefined,
            guesses: turn.guesses.map((guess) => ({
              playerName: guess.playerName,
              outcome: guess.outcome,
            })),
          })),
        }
      : null,

    playerContext: gameData.playerContext
      ? {
          publicId: gameData.playerContext.publicId,
          playerName: gameData.playerContext.publicName,
          teamName: gameData.playerContext.teamName,
          role: gameData.playerContext.role,
        }
      : null,
  };
}

/**
 * Applies visibility rules to a card based on player role and round status
 */
function applyCardVisibility(card: any, playerRole: PlayerRole, roundStatus: string) {
  const baseCard = {
    word: card.word,
    selected: card.selected,
  };

  // Show all team names if:
  // 1. Player is a codemaster
  // 2. Card has been selected
  // 3. Round is completed (game over - show all cards)
  if (
    playerRole === PLAYER_ROLE.CODEMASTER ||
    card.selected ||
    roundStatus === ROUND_STATE.COMPLETED
  ) {
    return {
      ...baseCard,
      teamName: card.teamName,
      cardType: card.cardType,
    };
  }

  return baseCard;
}
