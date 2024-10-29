import {
  handleIntroStage,
  handleCodemasterStage,
  handleCodebreakerStage,
  handleGameOverStage,
} from "@game/services/gameplay/gameplay-handlers";
import { TEAM, STAGE } from "@game/game-common-constants";
import { GameState } from "@game/game-common-types";
import {
  generateCards,
  getWinnerProperty,
} from "@test/game/gameplay-test-utils";

describe("Stage Handling Functions", () => {
  describe("handleIntroStage", () => {
    it("should move stage from intro to codemaster", () => {
      const gameState: GameState = {
        stage: STAGE.INTRO,
        cards: generateCards([]),
        rounds: [],
      };
      const newState = handleIntroStage(gameState);
      expect(newState.stage).toBe(STAGE.CODEMASTER);
    });

    it("should throw an error if validation fails for the intro stage", () => {
      const gameState: GameState = {
        stage: STAGE.INTRO,
        cards: generateCards(["red1"]),
        rounds: [],
      };
      expect(() => handleIntroStage(gameState)).toThrow(
        "No cards should be selected in the intro stage."
      );
    });
  });

  describe("handleCodemasterStage", () => {
    it("should move stage from codemaster to codebreaker", () => {
      const gameState: GameState = {
        stage: STAGE.CODEMASTER,
        rounds: [{ team: TEAM.RED, codeword: "test", guessesAllowed: 3 }],
        cards: generateCards([]),
      };
      const newState = handleCodemasterStage(gameState);
      expect(newState.stage).toBe(STAGE.CODEBREAKER);
    });

    it("should throw an error if no round information is", () => {
      const gameState: GameState = {
        stage: STAGE.CODEMASTER,
        rounds: [],
        cards: generateCards([]),
      };
      expect(() => handleCodemasterStage(gameState)).toThrow(
        "No rounds found in the game state."
      );
    });

    it("should throw an error if no codeword is provided", () => {
      const gameState: GameState = {
        stage: STAGE.CODEMASTER,
        rounds: [{ team: TEAM.RED, guessesAllowed: 3 }],
        cards: generateCards([]),
      };
      expect(() => handleCodemasterStage(gameState)).toThrow(
        "The latest round must have a codeword set."
      );
    });

    it("should throw an error if no guessesAllowed is provided", () => {
      const gameState: GameState = {
        stage: STAGE.CODEMASTER,
        rounds: [{ team: TEAM.RED, codeword: "test" }],
        cards: generateCards([]),
      };
      expect(() => handleCodemasterStage(gameState)).toThrow(
        "The latest round must have guessesAllowed set."
      );
    });
  });

  describe("handleCodebreakerStage", () => {
    it("should update cards and remain on codebreaker's turn for more guesses", () => {
      const testGameState: GameState = {
        stage: STAGE.CODEBREAKER,
        rounds: [
          {
            team: TEAM.RED,
            codeword: "test",
            guessedWords: ["red1"],
            guessesAllowed: 2,
          },
        ],
        cards: generateCards([]),
      };

      const newState = handleCodebreakerStage(testGameState);

      // Extract guessed words and check if they are selected
      const guessedWords = testGameState.rounds.flatMap(
        (round) => round.guessedWords
      );
      const allGuessedWordsSelected = guessedWords.every((word) => {
        const card = newState.cards.find((card) => card.word === word);
        return card && card.selected;
      });

      // Assertions
      expect(allGuessedWordsSelected).toBe(true); // Check that all guessed words are selected
      expect(getWinnerProperty(newState)).toBeNull; // Check that there is no winner yet
      expect(newState.stage).toBe(STAGE.CODEBREAKER); // Ensure stage remains correct
    });

    it("should update cards and determine the red team as the winner", () => {
      const testGameState: GameState = {
        stage: STAGE.CODEBREAKER,
        rounds: [
          {
            team: TEAM.RED,
            codeword: "test",
            guessedWords: ["red1", "red2"],
            guessesAllowed: 2,
          },
        ],
        cards: generateCards(["red1", "red2"]),
      };
      const newState = handleCodebreakerStage(testGameState);
      expect(newState.winner).toBe(TEAM.RED);
    });

    it("should update cards and determine the green team as the winner", () => {
      const testGameState: GameState = {
        stage: STAGE.CODEBREAKER,
        rounds: [
          {
            team: TEAM.GREEN,
            codeword: "test",
            guessedWords: ["green1", "green2"],
            guessesAllowed: 2,
          },
        ],
        cards: generateCards(["green1", "green2"]),
      };
      const newState = handleCodebreakerStage(testGameState);
      expect(newState.winner).toBe(TEAM.GREEN);
    });

    it("should update cards and determine the other team as the winner when the current team picks assassin", () => {
      const testGameState: GameState = {
        stage: STAGE.CODEBREAKER,
        rounds: [
          {
            team: TEAM.RED,
            codeword: "test",
            guessedWords: ["assassin"],
            guessesAllowed: 1,
          },
        ],
        cards: generateCards([]),
      };
      const newState = handleCodebreakerStage(testGameState);
      expect(newState.winner).toBe(TEAM.GREEN);
    });

    it("should throw an error when both teams win", () => {
      const testGameState: GameState = {
        stage: STAGE.CODEBREAKER,
        rounds: [
          {
            team: TEAM.RED,
            guessedWords: ["red1", "green1"],
            guessesAllowed: 2,
          },
        ],
        cards: [
          { word: "red1", team: TEAM.RED, selected: true },
          { word: "green1", team: TEAM.GREEN, selected: true },
        ],
      };
      expect(() => handleCodebreakerStage(testGameState)).toThrow(
        "Failed to determine winner... both teams win!"
      );
    });
  });

  describe("handleGameOverStage", () => {
    it("should throw an error indicating the game is over and no more turns are allowed", () => {
      const gameState: GameState = {
        stage: STAGE.GAMEOVER,
        rounds: [
          {
            team: TEAM.RED,
            codeword: "test",
            guessedWords: ["red1", "red2"],
            guessesAllowed: 2,
          },
        ],
        cards: generateCards(["red1", "red2"]),
      };
      expect(() => handleGameOverStage(gameState)).toThrow(
        "Game has finished. No more turns."
      );
    });
  });
});
