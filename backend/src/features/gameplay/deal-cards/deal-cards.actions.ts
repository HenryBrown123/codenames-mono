import type {
  RandomWordsSelector,
  CardsCreator,
  CardInput,
} from "@backend/common/data-access/cards.repository";
import type { DealCardsValidGameState } from "./deal-cards.rules";
import { complexProperties } from "../state/gameplay-state.helpers";
import type { TeamId } from "@backend/common/data-access/teams.repository";
import { UnexpectedGameplayError } from "../errors/gameplay.errors";

/**
 * Card distribution specification for teams
 */
type TeamDistribution = {
  teamId: TeamId;
  count: number;
};

/**
 * Randomly selects a team while tracking remaining counts
 * Returns the selected team and the updated distribution
 */
const selectRandomTeam = (
  distribution: TeamDistribution[],
): [TeamId, TeamDistribution[]] => {
  const availableTeams = distribution.filter((t) => t.count > 0);

  if (availableTeams.length === 0) {
    throw new Error("No teams available for card distribution");
  }

  const randomIndex = Math.floor(Math.random() * availableTeams.length);
  const selectedTeam = availableTeams[randomIndex];

  const updatedDistribution = distribution.map((team) =>
    team.teamId === selectedTeam.teamId
      ? { ...team, count: team.count - 1 }
      : team,
  );

  return [selectedTeam.teamId, updatedDistribution];
};

/**
 * Factory function that creates a card dealing action with repository dependencies
 *
 * @param getRandomWords - Repository function for retrieving random words
 * @param createCards - Repository function for creating new cards
 * @returns Function that deals cards for a validated game state
 */
export const dealCardsToRound = (
  getRandomWords: RandomWordsSelector,
  createCards: CardsCreator,
) => {
  /**
   * Deals cards to a round for a pre-validated game state
   *
   * @param gameState - Validated game state that meets all business rules
   * @param teams - Available teams in the game
   * @returns Dealt cards data
   */
  const dealCards = async (
    gameState: DealCardsValidGameState,
    teams: { id: number; teamName: string }[],
  ) => {
    const latestRound = complexProperties.getLatestRound(gameState);
    if (!latestRound) {
      throw new UnexpectedGameplayError(
        "Cannot deal cards: no active round found",
      );
    }

    // Find team IDs
    const redTeam = teams.find((t) =>
      t.teamName.toLowerCase().includes("red"),
    )?.id;
    const greenTeam = teams.find((t) =>
      t.teamName.toLowerCase().includes("green"),
    )?.id;
    const bystanderTeam = teams.find((t) =>
      t.teamName.toLowerCase().includes("bystander"),
    )?.id;
    const assassinTeam = teams.find((t) =>
      t.teamName.toLowerCase().includes("assassin"),
    )?.id;

    if (!redTeam || !greenTeam || !bystanderTeam || !assassinTeam) {
      throw new UnexpectedGameplayError(
        "Cannot deal cards: missing required team types",
      );
    }

    // Determine starting team randomly
    const startingTeamId = Math.random() > 0.5 ? redTeam : greenTeam;
    const otherTeamId = startingTeamId === redTeam ? greenTeam : redTeam;

    // Initial team distribution
    let teamDistribution: TeamDistribution[] = [
      { teamId: startingTeamId, count: 9 }, // Starting team gets 9 cards
      { teamId: otherTeamId, count: 8 }, // Other team gets 8 cards
      { teamId: assassinTeam, count: 1 }, // 1 assassin card
      { teamId: bystanderTeam, count: 7 }, // 7 bystander cards
    ];

    const totalCards = teamDistribution.reduce(
      (sum, { count }) => sum + count,
      0,
    );

    const words = await getRandomWords(totalCards);

    const cardInputs: CardInput[] = [];

    for (const word of words) {
      const [teamId, updatedDistribution] = selectRandomTeam(teamDistribution);
      teamDistribution = updatedDistribution;

      cardInputs.push({
        roundId: latestRound.id,
        word,
        teamId,
      });
    }

    const cards = await createCards(cardInputs);

    return {
      roundId: latestRound.id,
      roundNumber: latestRound.roundNumber,
      startingTeamId,
      totalCards: cards.length,
      cards,
    };
  };

  return dealCards;
};
