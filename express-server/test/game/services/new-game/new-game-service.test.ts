import { createNewGame } from "@game/services/new-game/new-game-service";
import Game from "@game/game-model";
import { getRandomWords } from "@game/word/word-ctrl";
import { TEAM } from "@game/game-common-constants";
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
  it("should create a new game with default numberOfCards", async () => {
    const gameDocument = await createNewGame();
    expect(gameDocument.settings.numberOfCards).toBe(25);
  });

  it("should create a new game with default startingTeam", async () => {
    const gameDocument = await createNewGame();
    expect(gameDocument.state.rounds.at(-1).team).toBe(TEAM.RED);
  });

  it("should create a new game with default numberOfAssassins", async () => {
    const gameDocument = await createNewGame();
    const numberOfAssassins = gameDocument.state.cards.filter(
      (card) => card.team === TEAM.ASSASSIN
    ).length;
    expect(numberOfAssassins).toBe(1);
  });

  it("should call save on the game document", async () => {
    const gameDocument = await createNewGame();
    expect(gameDocument.save).toHaveBeenCalled();
  });

  it("should match expected game data with game created with default settings", async () => {
    const gameDocument = await createNewGame();
    expect(gameDocument).toMatchObject(expectedGameDataDefault);
  });

  it("should create a new game with the number of cards specified in custom game settings", async () => {
    const customSettings = {
      numberOfCards: 30,
      startingTeam: TEAM.GREEN,
      numberOfAssassins: 2,
    };
    const gameDocument = await createNewGame(customSettings);
    expect(gameDocument.state.cards.length).toBe(30);
  });

  it("should create a new game with custom startingTeam", async () => {
    const customSettings = {
      numberOfCards: 30,
      startingTeam: TEAM.GREEN,
      numberOfAssassins: 2,
    };
    const gameDocument = await createNewGame(customSettings);
    expect(gameDocument.state.rounds.at(-1).team).toBe(TEAM.GREEN);
  });

  it("should create a new game with custom numberOfAssassins", async () => {
    const customSettings = {
      numberOfCards: 30,
      startingTeam: TEAM.GREEN,
      numberOfAssassins: 2,
    };
    const gameDocument = await createNewGame(customSettings);
    const numberOfAssassins = gameDocument.state.cards.filter(
      (card) => card.team === TEAM.ASSASSIN
    ).length;

    expect(numberOfAssassins).toBe(2);
  });

  it("should call save on the game document with custom settings", async () => {
    const customSettings = {
      numberOfCards: 30,
      startingTeam: TEAM.GREEN,
      numberOfAssassins: 2,
    };
    const gameDocument = await createNewGame(customSettings);
    expect(gameDocument.save).toHaveBeenCalled();
  });

  it("should match expected game data with game created with custom settings", async () => {
    const customSettings = {
      numberOfCards: 30,
      startingTeam: TEAM.GREEN,
      numberOfAssassins: 2,
    };
    const gameDocument = await createNewGame(customSettings);
    expect(gameDocument).toMatchObject(expectedGameDataCustom);
  });

  it("should handle errors correctly", async () => {
    (
      getRandomWords as jest.MockedFunction<typeof getRandomWords>
    ).mockRejectedValueOnce(new Error("Failed to get words"));

    await expect(createNewGame()).rejects.toThrow(
      "Failed to create new game: Failed to get words"
    );
  });
});
