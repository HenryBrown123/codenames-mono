import { createGameData } from "@game/services/new-game/new-game-factory";
import { TEAM, STAGE } from "@game/game-common-constants";

describe("createGameData", () => {
  const settings = {
    numberOfCards: 25,
    startingTeam: TEAM.RED,
    numberOfAssassins: 1,
  };

  const words = Array.from({ length: 25 }, (_, i) => `word${i + 1}`);
  const gameData = createGameData(settings, words);

  it("should create game data with the correct settings", () => {
    expect(gameData.settings).toEqual(settings);
  });

  it("should initialize the game stage to INTRO", () => {
    expect(gameData.state.stage).toBe(STAGE.INTRO);
  });

  it("should create the correct number of game cards", () => {
    expect(gameData.state.cards).toHaveLength(25);
  });

  it("should distribute teams correctly among cards", () => {
    const startingTeamCount = gameData.state.cards.filter(
      (card) => card.team === TEAM.RED
    ).length;
    const otherTeamCount = gameData.state.cards.filter(
      (card) => card.team === TEAM.GREEN
    ).length;
    const assassinCount = gameData.state.cards.filter(
      (card) => card.team === TEAM.ASSASSIN
    ).length;
    const bystanderCount = gameData.state.cards.filter(
      (card) => card.team === TEAM.BYSTANDER
    ).length;

    expect(startingTeamCount).toBe(9);
    expect(otherTeamCount).toBe(8);
    expect(assassinCount).toBe(1);
    expect(bystanderCount).toBe(7);
  });

  it("should initialize the rounds with the starting team", () => {
    expect(gameData.state.rounds).toHaveLength(1);
    expect(gameData.state.rounds[0].team).toBe(TEAM.RED);
  });
});
