import { Card, Team, GameState } from "@game/game-common-types";
import { TEAM, STAGE } from "@game/game-common-constants";

/**
 * Lookup for the next turn stages, excluding game winning routes. This controls the game flow between
 * stages. I.e. intro -> codemaster <-> codebreaker (-> gameover)
 */
const NEXT_TURN = {
  INTRO: STAGE.CODEMASTER,
  CODEMASTER: STAGE.CODEBREAKER,
  CODEBREAKER: STAGE.CODEMASTER,
} as const;

/**
 * Processes the 'intro' stage and returns an updated game object.
 *
 * @param {GameData} inputGameState - The current state of the game.
 * @returns {GameData} - The updated game state after processing the intro stage.
 */
export function processIntroStage(inputGameState: GameState): GameState {
  const nextState: Partial<GameState> = {
    stage: NEXT_TURN.INTRO,
  };
  return { ...inputGameState, ...nextState };
}

/**
 * Processes the 'codemaster' stage and returns an updated game object.
 *
 * @param {GameData} inputGameState - The current state of the game.
 * @returns {GameData} - The updated game state after processing the codemaster stage.
 */
export function processCodemasterStage(inputGameState: GameState): GameState {
  const nextGameState: Partial<GameState> = {
    stage: NEXT_TURN.CODEMASTER,
  };
  return { ...inputGameState, ...nextGameState };
}

/**
 * Processes the 'codebreaker' stage and returns an updated game object.
 *
 * @param {GameData} inputGameState - The current state of the game.
 * @returns {GameData} - The updated game state after processing the codebreaker stage.
 */
export function processCodebreakerStage(inputGameState: GameState): GameState {
  // Get relevant details for the current round from the input object
  const lastRound = inputGameState.rounds.at(-1);
  const selectedWord = lastRound?.guessedWords.at(-1);
  const currentTeam = lastRound?.team;
  const otherTeam = currentTeam === TEAM.RED ? TEAM.GREEN : TEAM.RED;

  // Update the "selected" property of the corresponding card in the cards array
  const updatedCards = inputGameState.cards.map((card) =>
    card.word === selectedWord ? { ...card, selected: true } : card
  );

  // Updated game object for merging with input game object
  const nextGameState: Partial<GameState> = {
    ...inputGameState,
    cards: updatedCards,
  };

  // Determine if there's a winning team based on the selected card(s).
  const determinedWinner = determineWinner(updatedCards);
  const actualWinningTeam =
    determinedWinner === TEAM.ASSASSIN ? otherTeam : determinedWinner;

  if (actualWinningTeam) {
    nextGameState.stage = STAGE.GAMEOVER;
    nextGameState.winner = actualWinningTeam;
    return { ...inputGameState, ...nextGameState };
  }

  const numberOfGuessesRemaining =
    (lastRound?.guessesAllowed || 0) - (lastRound?.guessedWords.length || 0);

  if (numberOfGuessesRemaining === 0) {
    nextGameState.stage = NEXT_TURN.CODEBREAKER;
    nextGameState.rounds = [...inputGameState.rounds, { team: otherTeam }];
    return { ...inputGameState, ...nextGameState };
  }

  // Determine whether the last selected card is for the current team
  const isCardForCurrentTeam = nextGameState.cards?.some(
    (card) =>
      card.selected &&
      card.team === lastRound?.team &&
      card.word === selectedWord
  );

  // if the correct team, proceed with next codebreaker turn, otherwise, new round for codemaster

  if (isCardForCurrentTeam) {
    return { ...inputGameState, ...nextGameState };
  }

  nextGameState.stage = NEXT_TURN.CODEMASTER;
  nextGameState.rounds = [...inputGameState.rounds, { team: otherTeam }];

  return { ...inputGameState, ...nextGameState };
}

/**
 * Determines the winner based on the selected cards.
 *
 * @param {Card[]} cardArray - The array of cards in the game state.
 * @returns {Team | null} - The winning team ('red' or 'green') or null if no winner.
 * @throws {Error} - If its determined that both teams win.
 */
function determineWinner(cardArray: Card[]): Team | null {
  // .reduce() to prevent unnecessary iterations of the array
  const counts = cardArray.reduce(
    (acc, card) => {
      if (card.team === TEAM.GREEN) acc.totalGreen += 1;
      if (card.team === TEAM.RED) acc.totalRed += 1;
      if (card.team === TEAM.ASSASSIN) acc.totalAssassin += 1;
      if (card.selected && card.team === TEAM.GREEN) acc.greenScore += 1;
      if (card.selected && card.team === TEAM.RED) acc.redScore += 1;
      if (card.selected && card.team === TEAM.ASSASSIN) acc.assassinScore += 1;
      return acc;
    },
    {
      totalGreen: 0,
      totalRed: 0,
      totalAssassin: 0,
      greenScore: 0,
      redScore: 0,
      assassinScore: 0,
    }
  );

  const {
    totalGreen,
    totalRed,
    totalAssassin,
    greenScore,
    redScore,
    assassinScore,
  } = counts;

  if (redScore === totalRed && greenScore === totalGreen) {
    throw new Error("Failed to determine winner... both teams win!");
  }

  // all assassins selected (normally only a single assassin)
  if (totalAssassin === assassinScore) {
    return TEAM.ASSASSIN;
  }

  return redScore === totalRed
    ? TEAM.RED
    : greenScore === totalGreen
    ? TEAM.GREEN
    : null;
}
