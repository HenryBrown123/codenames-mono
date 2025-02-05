import { createNewGame } from "@backend/game/services/new-game/new-game-service";
import Game from "@backend/game/models/game-model";
import { getRandomWords } from "@backend/game/controllers/word-ctrl";
import { TEAM } from "@codenames/shared/src/game/game-constants";
import {
  expectedGameDataDefault,
  expectedGameDataCustom,
} from "./new-game-expected";

// Spy on the save method of Game model and mock implementation to resolve with 'this'
jest.spyOn(Game.prototype, "save").mockImplementation(function () {
  return Promise.resolve(this);
});

beforeEach(() => {
  jest.spyOn(global.Math, "random").mockReturnValue(0.123456789);
});

afterEach(() => {
  jest.spyOn(global.Math, "random").mockRestore();
});

const generateMockWords = (numberOfCards: number) => {
  return Array.from({ length: numberOfCards }, (_, i) => {
    return { word: `word${i + 1}` };
  });
};

jest.mock("@game/word/word-ctrl", () => ({
  getRandomWords: jest
    .fn()
    .mockImplementation((numberOfCards) => {
      return generateMockWords(numberOfCards);
    })
    .mockName("getRandomWords"),
}));

describe("createNewGame", () => {
  describe("Default settings", () => {
    it("should create a new game with the correct number of cards", async () => {
      const gameDocument = await createNewGame();
      expect(gameDocument.state.cards.length).toBe(25);
    });

    it("should distribute cards correctly (default settings)", async () => {
      const gameDocument = await createNewGame();
      const startingTeamCount = gameDocument.state.cards.filter(
        (card) => card.team === TEAM.RED,
      ).length;
      const otherTeamCount = gameDocument.state.cards.filter(
        (card) => card.team === TEAM.GREEN,
      ).length;
      const assassinCount = gameDocument.state.cards.filter(
        (card) => card.team === TEAM.ASSASSIN,
      ).length;
      const bystanderCount = gameDocument.state.cards.filter(
        (card) => card.team === TEAM.BYSTANDER,
      ).length;

      expect(startingTeamCount).toBe(9); // Starting team
      expect(otherTeamCount).toBe(8); // Other team
      expect(assassinCount).toBe(1); // Assassin
      expect(bystanderCount).toBe(7); // Bystanders
    });

    it("should create a new game with default startingTeam", async () => {
      const gameDocument = await createNewGame();
      expect(gameDocument.state.rounds.at(-1).team).toBe(TEAM.RED);
    });

    it("should call save on the game document", async () => {
      const gameDocument = await createNewGame();
      expect(gameDocument.save).toHaveBeenCalled();
    });
  });

  describe("Custom settings", () => {
    const customSettings = {
      numberOfCards: 30,
      startingTeam: TEAM.GREEN,
      numberOfAssassins: 2,
    };

    it("should create a new game with the correct number of cards (custom settings)", async () => {
      const gameDocument = await createNewGame(customSettings);
      expect(gameDocument.state.cards.length).toBe(30);
    });

    it("should distribute cards correctly (custom settings)", async () => {
      const gameDocument = await createNewGame(customSettings);
      const startingTeamCount = gameDocument.state.cards.filter(
        (card) => card.team === TEAM.GREEN,
      ).length;
      const otherTeamCount = gameDocument.state.cards.filter(
        (card) => card.team === TEAM.RED,
      ).length;
      const assassinCount = gameDocument.state.cards.filter(
        (card) => card.team === TEAM.ASSASSIN,
      ).length;
      const bystanderCount = gameDocument.state.cards.filter(
        (card) => card.team === TEAM.BYSTANDER,
      ).length;

      expect(startingTeamCount).toBe(10);
      expect(otherTeamCount).toBe(10);
      expect(assassinCount).toBe(2);
      expect(bystanderCount).toBe(8);
    });

    it("should assign the correct starting team in rounds", async () => {
      const gameDocument = await createNewGame(customSettings);
      expect(gameDocument.settings.startingTeam).toBe(TEAM.GREEN);
      expect(gameDocument.state.rounds[0].team).toBe(TEAM.GREEN);
    });

    it("should call save on the game document", async () => {
      const gameDocument = await createNewGame(customSettings);
      expect(gameDocument.save).toHaveBeenCalled();
    });
  });

  describe("Error handling", () => {
    it("should handle errors correctly when word generation fails", async () => {
      (
        getRandomWords as jest.MockedFunction<typeof getRandomWords>
      ).mockRejectedValueOnce(new Error("Failed to get words"));

      await expect(createNewGame()).rejects.toThrow(
        "Failed to create new game: Failed to get words",
      );
    });
  });
});
