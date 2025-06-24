import {
  GameState,
  GameFormat,
  GameType,
  PlayerRole,
  RoundState,
} from "@codenames/shared/types";

// ==========================================
// API RESPONSE TYPES (what comes from backend)
// ==========================================

export interface GameStateApiResponse {
  success: boolean;
  data: {
    game: ApiGameData;
  };
}

export interface ApiGameData {
  publicId: string;
  status: GameState;
  gameType: GameType;
  gameFormat: GameFormat;
  createdAt: string;
  teams: ApiTeam[];
  currentRound: ApiRound | null;
  playerContext: ApiPlayerContext;
}

export interface ApiTeam {
  name: string;
  score: number;
  players: ApiPlayer[];
}

export interface ApiPlayer {
  publicId: string;
  name: string;
  isActive: boolean;
}

export interface ApiRound {
  roundNumber: number;
  status: RoundState;
  cards: ApiCard[];
  turns: ApiTurn[];
}

export interface ApiCard {
  word: string;
  selected: boolean;
  teamName: string | null;
  cardType: string;
}

export interface ApiTurn {
  id: string;
  teamName: string;
  status: string;
  guessesRemaining: number;
  clue?: {
    word: string;
    number: number;
  };
  guesses: ApiGuess[];
}

export interface ApiGuess {
  playerName: string;
  outcome: string | null;
}

export interface ApiPlayerContext {
  playerName: string;
  teamName: string;
  role: PlayerRole;
}

// ==========================================
// UI TYPES (what components use)
// ==========================================

export interface GameData {
  publicId: string;
  status: GameState;
  gameType: GameType;
  gameFormat: GameFormat;
  createdAt: Date;
  teams: Team[];
  currentRound: Round | null;
  playerContext: PlayerContext;
}

export interface Team {
  name: string;
  score: number;
  players: Player[];
}

export interface Player {
  publicId: string;
  name: string;
  isActive: boolean;
}

export interface Round {
  roundNumber: number;
  status: RoundState;
  cards: Card[];
  turns: Turn[];
}

export interface Card {
  word: string;
  selected: boolean;
  teamName: string | null;
  cardType: string;
}

export interface Turn {
  id: string;
  teamName: string;
  status: string;
  guessesRemaining: number;
  clue?: Clue;
  guesses: Guess[];
}

export interface Clue {
  word: string;
  number: number;
}

export interface Guess {
  playerName: string;
  outcome: string | null;
}

export interface PlayerContext {
  playerName: string;
  teamName: string;
  role: PlayerRole;
}

// ==========================================
// API REQUEST TYPES
// ==========================================

export interface CreateGameRequest {
  gameType: GameType;
  gameFormat: GameFormat;
}

export interface GiveClueRequest {
  word: string;
  targetCardCount: number;
}

export interface MakeGuessRequest {
  cardWord: string;
}

// ==========================================
// TURN DATA TYPES (for detailed turn queries)
// ==========================================

export interface TurnGuess {
  cardWord: string;
  playerName: string;
  outcome: string;
  createdAt: Date;
}

export interface TurnClue {
  word: string;
  number: number;
  createdAt: Date;
}

export interface TurnData {
  id: string;
  teamName: string;
  status: "ACTIVE" | "COMPLETED";
  guessesRemaining: number;
  createdAt: Date;
  completedAt: Date | null;
  clue: TurnClue | null;
  hasGuesses: boolean;
  lastGuess: TurnGuess | null;
  prevGuesses: TurnGuess[];
}

export interface ApiTurnResponse {
  id: string;
  teamName: string;
  status: "ACTIVE" | "COMPLETED";
  guessesRemaining: number;
  createdAt: string;
  completedAt: string | null;
  clue: {
    word: string;
    number: number;
    createdAt: string;
  } | null;
  hasGuesses: boolean;
  lastGuess: {
    cardWord: string;
    playerName: string;
    outcome: string;
    createdAt: string;
  } | null;
  prevGuesses: {
    cardWord: string;
    playerName: string;
    outcome: string;
    createdAt: string;
  }[];
}

export interface GetTurnResponse {
  success: true;
  data: {
    turn: ApiTurnResponse;
  };
}

export function transformApiTurnResponse(apiTurn: ApiTurnResponse): TurnData {
  return {
    id: apiTurn.id,
    teamName: apiTurn.teamName,
    status: apiTurn.status,
    guessesRemaining: apiTurn.guessesRemaining,
    createdAt: new Date(apiTurn.createdAt),
    completedAt: apiTurn.completedAt ? new Date(apiTurn.completedAt) : null,
    clue: apiTurn.clue ? {
      word: apiTurn.clue.word,
      number: apiTurn.clue.number,
      createdAt: new Date(apiTurn.clue.createdAt)
    } : null,
    hasGuesses: apiTurn.hasGuesses,
    lastGuess: apiTurn.lastGuess ? {
      cardWord: apiTurn.lastGuess.cardWord,
      playerName: apiTurn.lastGuess.playerName,
      outcome: apiTurn.lastGuess.outcome,
      createdAt: new Date(apiTurn.lastGuess.createdAt)
    } : null,
    prevGuesses: apiTurn.prevGuesses.map(guess => ({
      cardWord: guess.cardWord,
      playerName: guess.playerName,
      outcome: guess.outcome,
      createdAt: new Date(guess.createdAt)
    })),
  };
}

// ==========================================
// TRANSFORM FUNCTIONS
// ==========================================

export function transformApiResponseToGameData(
  apiResponse: GameStateApiResponse,
): GameData {
  const game = apiResponse.data.game;

  return {
    publicId: game.publicId,
    status: game.status,
    gameType: game.gameType,
    gameFormat: game.gameFormat,
    createdAt: new Date(game.createdAt),
    teams: game.teams.map(transformApiTeam),
    currentRound: game.currentRound
      ? transformApiRound(game.currentRound)
      : null,
    playerContext: transformApiPlayerContext(game.playerContext),
  };
}

function transformApiTeam(apiTeam: ApiTeam): Team {
  return {
    name: apiTeam.name,
    score: apiTeam.score,
    players: apiTeam.players.map(transformApiPlayer),
  };
}

function transformApiPlayer(apiPlayer: ApiPlayer): Player {
  return {
    publicId: apiPlayer.publicId,
    name: apiPlayer.name,
    isActive: apiPlayer.isActive,
  };
}

function transformApiRound(apiRound: ApiRound): Round {
  return {
    roundNumber: apiRound.roundNumber,
    status: apiRound.status,
    cards: apiRound.cards.map(transformApiCard),
    turns: apiRound.turns.map(transformApiTurn),
  };
}

function transformApiCard(apiCard: ApiCard): Card {
  return {
    word: apiCard.word,
    selected: apiCard.selected,
    teamName: apiCard.teamName,
    cardType: apiCard.cardType,
  };
}

function transformApiTurn(apiTurn: ApiTurn): Turn {
  return {
    id: apiTurn.id,
    teamName: apiTurn.teamName,
    status: apiTurn.status,
    guessesRemaining: apiTurn.guessesRemaining,
    clue: apiTurn.clue
      ? {
          word: apiTurn.clue.word,
          number: apiTurn.clue.number,
        }
      : undefined,
    guesses: apiTurn.guesses.map(transformApiGuess),
  };
}

function transformApiGuess(apiGuess: ApiGuess): Guess {
  return {
    playerName: apiGuess.playerName,
    outcome: apiGuess.outcome,
  };
}

function transformApiPlayerContext(
  apiContext: ApiPlayerContext,
): PlayerContext {
  return {
    playerName: apiContext.playerName,
    teamName: apiContext.teamName,
    role: apiContext.role,
  };
}
