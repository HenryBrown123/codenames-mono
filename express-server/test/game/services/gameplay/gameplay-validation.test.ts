import {
  validateIntroStage,
  validateCodemasterStage,
  validateCodebreakerStage,
} from "@game/services/gameplay/gameplay-validation";
import { GameState } from "@game/game-common-types";
import { TEAM, STAGE } from "@game/game-common-constants";

describe("Game stage validation functions", () => {
  const generateMockCards = (selectedWords: string[]) => {
    return [
      {
        word: "red1",
        team: TEAM.RED,
        selected: selectedWords.includes("red1"),
      },
      {
        word: "red2",
        team: TEAM.RED,
        selected: selectedWords.includes("red2"),
      },
      {
        word: "green1",
        team: TEAM.GREEN,
        selected: selectedWords.includes("green1"),
      },
      {
        word: "green2",
        team: TEAM.GREEN,
        selected: selectedWords.includes("green2"),
      },
      {
        word: "assassin",
        team: TEAM.ASSASSIN,
        selected: selectedWords.includes("assassin"),
      },
    ];
  };

  const mockGameState: GameState = {
    stage: STAGE.INTRO,
    rounds: [],
    cards: generateMockCards([]),
  };

  describe("validateIntroStage", () => {
    it("should pass validation with no selected cards", () => {
      const gameState: GameState = {
        ...mockGameState,
        stage: STAGE.INTRO,
        cards: generateMockCards([]),
      };
      expect(() => validateIntroStage(gameState)).not.toThrow();
    });

    it("should fail validation with selected cards", () => {
      const gameState: GameState = {
        ...mockGameState,
        stage: STAGE.INTRO,
        cards: generateMockCards(["red1"]),
      };
      expect(() => validateIntroStage(gameState)).toThrow(
        "No cards should be selected in the intro stage."
      );
    });
  });

  describe("validateCodemasterStage", () => {
    it("should pass validation with a codeword and number of guesses specified against the current round", () => {
      const gameState: GameState = {
        ...mockGameState,
        stage: STAGE.CODEMASTER,
        rounds: [{ team: TEAM.RED, codeword: "test", guessesAllowed: 3 }],
        cards: generateMockCards([]),
      };
      expect(() => validateCodemasterStage(gameState)).not.toThrow();
    });

    it("should fail validation with no round data", () => {
      const gameState: GameState = {
        ...mockGameState,
        stage: STAGE.CODEMASTER,
        cards: generateMockCards([]),
      };
      expect(() => validateCodemasterStage(gameState)).toThrow(
        "No rounds found in the game state."
      );
    });

    it("should fail validation with no codeword", () => {
      const gameState: GameState = {
        ...mockGameState,
        stage: STAGE.CODEMASTER,
        rounds: [{ team: TEAM.RED, guessesAllowed: 3 }],
        cards: generateMockCards([]),
      };
      expect(() => validateCodemasterStage(gameState)).toThrow(
        "The latest round must have a codeword set."
      );
    });

    it("should fail validation with no guessesAllowed", () => {
      const gameState: GameState = {
        ...mockGameState,
        stage: STAGE.CODEMASTER,
        rounds: [{ team: TEAM.RED, codeword: "test" }],
        cards: generateMockCards([]),
      };
      expect(() => validateCodemasterStage(gameState)).toThrow(
        "The latest round must have guessesAllowed set."
      );
    });
  });

  describe("validateCodebreakerStage", () => {
    it("should pass validation", () => {
      const gameState: GameState = {
        ...mockGameState,
        stage: STAGE.CODEBREAKER,
        cards: generateMockCards([]),
        rounds: [{ team: TEAM.RED, codeword: "test", guessedWords: ["red1"] }],
      };
      expect(() => validateCodebreakerStage(gameState)).not.toThrow();
    });

    it("should fail validation if no guessed words", () => {
      const gameState: GameState = {
        ...mockGameState,
        stage: STAGE.CODEBREAKER,
        cards: generateMockCards([]),
        rounds: [{ team: TEAM.RED, codeword: "test", guessedWords: [] }],
      };
      expect(() => validateCodebreakerStage(gameState)).toThrow(
        "No guessed words against current round"
      );
    });

    it("should fail validation if gussed word not in cards", () => {
      const gameState: GameState = {
        ...mockGameState,
        stage: STAGE.CODEBREAKER,
        cards: generateMockCards([]),
        rounds: [{ team: TEAM.RED, codeword: "test", guessedWords: ["bad"] }],
      };
      expect(() => validateCodebreakerStage(gameState)).toThrow(
        "Guessed word not found in cards"
      );
    });
  });
});
