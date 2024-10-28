import {
  handleIntroStage,
  handleCodemasterStage,
  handleCodebreakerStage,
  handleGameOverStage,
} from "@game/services/gameplay/gameplay-handlers";
import { TEAM, STAGE } from "@game/game-common-constants";
import { GameState } from "@game/game-common-types";

describe("Stage Handling Functions", () => {
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

  describe("handleIntroStage", () => {
    it("should move stage from intro to codemaster", () => {
      const newState = handleIntroStage(mockGameState);
      expect(newState.stage).toBe(STAGE.CODEMASTER);
    });

    it("should throw an error if validation fails for the intro stage", () => {
      const gameState: GameState = {
        ...mockGameState,
        stage: STAGE.INTRO,
        cards: [{ word: "test", team: TEAM.RED, selected: true }],
      };
      expect(() => handleIntroStage(gameState)).toThrow();
    });
  });

  describe("handleCodemasterStage", () => {
    it("should move stage from codemaster to codebreaker", () => {
      const gameState: GameState = {
        ...mockGameState,
        stage: STAGE.CODEMASTER,
        rounds: [{ team: TEAM.RED, codeword: "test", guessesAllowed: 3 }],
        cards: generateMockCards([]),
      };
      const newState = handleCodemasterStage(gameState);
      expect(newState.stage).toBe(STAGE.CODEBREAKER);
    });

    it("should throw an error if validation fails for the codemaster stage", () => {
      const gameState: GameState = {
        ...mockGameState,
        stage: STAGE.CODEMASTER,
      };
      expect(() => handleCodemasterStage(gameState)).toThrow();
    });
  });

  describe("handleCodebreakerStage", () => {
    it("should update cards and determine the red team as the winner", () => {
      const testGameState: GameState = {
        ...mockGameState,
        stage: STAGE.CODEBREAKER,
        rounds: [
          { team: TEAM.RED, guessedWords: ["red1", "red2"], guessesAllowed: 2 },
        ],
        cards: generateMockCards(["red1", "red2"]),
      };
      const newState = handleCodebreakerStage(testGameState);
      expect(newState.winner).toBe(TEAM.RED);
    });

    it("should update cards and determine the green team as the winner", () => {
      const testGameState: GameState = {
        ...mockGameState,
        stage: STAGE.CODEBREAKER,
        rounds: [
          {
            team: TEAM.GREEN,
            guessedWords: ["green1", "green2"],
            guessesAllowed: 2,
          },
        ],
        cards: generateMockCards(["green1", "green2"]),
      };
      const newState = handleCodebreakerStage(testGameState);
      expect(newState.winner).toBe(TEAM.GREEN);
    });

    it("should update cards and determine the green team as the winner when red picks assassin", () => {
      const testGameState: GameState = {
        ...mockGameState,
        stage: STAGE.CODEBREAKER,
        rounds: [
          { team: TEAM.RED, guessedWords: ["assassin"], guessesAllowed: 1 },
        ],
        cards: generateMockCards(["assassin"]),
      };
      const newState = handleCodebreakerStage(testGameState);
      expect(newState.winner).toBe(TEAM.GREEN);
    });

    it("should throw an error when both teams win", () => {
      const testGameState: GameState = {
        ...mockGameState,
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
      expect(() => handleCodebreakerStage(testGameState)).toThrow();
    });

    it("should return null when no team has won", () => {
      const testGameState: GameState = {
        ...mockGameState,
        stage: STAGE.CODEBREAKER,
        rounds: [{ team: TEAM.RED, guessedWords: ["red1"], guessesAllowed: 1 }],
        cards: generateMockCards(["red1"]),
      };
      const newState = handleCodebreakerStage(testGameState);
      expect(newState.winner).not.toBe(TEAM.RED);
      expect(newState.winner).not.toBe(TEAM.GREEN);
    });
  });

  describe("handleGameOverStage", () => {
    it("should throw an error indicating the game is over and no more turns are allowed", () => {
      const gameState: GameState = { ...mockGameState, stage: STAGE.GAMEOVER };
      expect(() => handleGameOverStage(gameState)).toThrow();
    });
  });
});
