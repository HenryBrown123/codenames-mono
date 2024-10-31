import { Settings, Team, Card, GameData } from "@game/game-common-types";
import { TEAM, STAGE } from "@game/game-common-constants";

/**
 * Generates an array of colors to be allocated randomly to the game words for any number of total cards
 * @param settings - Game settings.
 * @param otherTeam - The other team's color.
 * @returns Array of colors.
 */
const createGameCards = (settings: Settings, words: string[]): Card[] => {
  const otherTeam = settings.startingTeam == TEAM.RED ? TEAM.GREEN : TEAM.RED;
  const numberOfCardsNonTeam = Math.round((8 / 25) * settings.numberOfCards);
  const numberOfCardsStartingTeam = Math.ceil(
    (settings.numberOfCards - numberOfCardsNonTeam) / 2
  );
  const numberOfCardsOtherTeam = Math.floor(
    (settings.numberOfCards - numberOfCardsNonTeam) / 2
  );
  const numberOfCardsAssassins = settings.numberOfAssassins;
  const numberOfCardsBystander =
    settings.numberOfCards -
    numberOfCardsStartingTeam -
    numberOfCardsOtherTeam -
    numberOfCardsAssassins;

  const startingTeamCards: Team[] = Array.from(
    { length: numberOfCardsStartingTeam },
    () => settings.startingTeam
  );
  const otherTeamCards: Team[] = Array.from(
    { length: numberOfCardsOtherTeam },
    () => otherTeam
  );
  const assassinCards: Team[] = Array.from(
    { length: numberOfCardsAssassins },
    () => TEAM.ASSASSIN
  );
  const bystanderCards: Team[] = Array.from(
    { length: numberOfCardsBystander },
    () => TEAM.BYSTANDER
  );

  const teamsToAllocate = [
    ...startingTeamCards,
    ...otherTeamCards,
    ...assassinCards,
    ...bystanderCards,
  ];

  const gameCards: Card[] = words.map((word) => {
    const randomIndex = Math.floor(Math.random() * teamsToAllocate.length);
    const wordColor = teamsToAllocate.splice(randomIndex, 1)[0];
    return { word: word, team: wordColor, selected: false };
  });

  return gameCards;
};

export const createGameData = (
  settings: Settings,
  words: string[]
): GameData => {
  return {
    settings,
    state: {
      stage: STAGE.INTRO,
      cards: createGameCards(settings, words),
      rounds: [{ team: settings.startingTeam }],
    },
  };
};
