import {
  handleIntroStage,
  handleCodemasterStage,
  handleCodebreakerStage,
  handleGameOverStage,
} from "@backend/game/services/gameplay/gameplay-handlers";
import { TEAM, STAGE } from "@codenames/shared/src/game/game-constants";
import { GameState } from "@codenames/shared/src/game/game-types";
import {
  generateCards,
  getWinnerProperty,
} from "@backend/test/game/gameplay-test-utils";

describe("Stage Handling Functions", () => {
  describe("handleIntroStage", () => {
    it("should move stage from intro to codemaster", async () => {
      const gameState: GameState = {
        stage: STAGE.INTRO,
        cards: generateCards([]),
        rounds: [],
      };
      const newState = await handleIntroStage(gameState);
      expect(newState.stage).toBe(STAGE.CODEMASTER);
    });

    it("should throw an error if validation fails for the intro stage", async () => {
      const gameState: GameState = {
        stage: STAGE.INTRO,
        cards: generateCards(["red1"]),
        rounds: [],
      };
      await expect(handleIntroStage(gameState)).rejects.toThrow(
        "No cards should be selected in the intro stage.",
      );
    });
  });

  describe("handleCodemasterStage", () => {
    it("should move stage from codemaster to codebreaker", async () => {
      const gameState: GameState = {
        stage: STAGE.CODEMASTER,
        rounds: [
          { team: TEAM.RED, codeword: "test", guessesAllowed: 3, turns: [] },
        ],
        cards: generateCards([]),
      };
      const newState = await handleCodemasterStage(gameState);
      expect(newState.stage).toBe(STAGE.CODEBREAKER);
    });

    it("should throw an error if no round information is provided", async () => {
      const gameState: GameState = {
        stage: STAGE.CODEMASTER,
        rounds: [],
        cards: generateCards([]),
      };
      await expect(handleCodemasterStage(gameState)).rejects.toThrow(
        "No rounds found in the game state.",
      );
    });

    it("should throw an error if no codeword is provided", async () => {
      const gameState: GameState = {
        stage: STAGE.CODEMASTER,
        rounds: [{ team: TEAM.RED, guessesAllowed: 3, turns: [] }],
        cards: generateCards([]),
      };
      await expect(handleCodemasterStage(gameState)).rejects.toThrow(
        "The latest round must have a codeword set.",
      );
    });

    it("should throw an error if no guessesAllowed is provided", async () => {
      const gameState: GameState = {
        stage: STAGE.CODEMASTER,
        rounds: [{ team: TEAM.RED, codeword: "test", turns: [] }],
        cards: generateCards([]),
      };
      await expect(handleCodemasterStage(gameState)).rejects.toThrow(
        "The latest round must have guessesAllowed set.",
      );
    });
  });

  describe("handleCodebreakerStage", () => {
    it("should update cards and remain on codebreaker's turn for more guesses", async () => {
      const testGameState: GameState = {
        stage: STAGE.CODEBREAKER,
        rounds: [
          {
            team: TEAM.RED,
            codeword: "test",
            guessesAllowed: 2,
            turns: [{ guessedWord: "red1", outcome: "CORRECT_TEAM_CARD" }],
          },
        ],
        cards: generateCards([]),
      };

      const newState = await handleCodebreakerStage(testGameState);

      const guessedWords = testGameState.rounds[0].turns?.map(
        (turn) => turn.guessedWord,
      );
      const allGuessedWordsSelected = guessedWords?.every((word) => {
        const card = newState.cards.find((card) => card.word === word);
        return card && card.selected;
      });

      expect(allGuessedWordsSelected).toBe(true);
      expect(getWinnerProperty(newState)).toBeNull();
      expect(newState.stage).toBe(STAGE.CODEBREAKER);
    });

    describe("Turn outcome assertions", () => {
      it("should set the outcome to CORRECT_TEAM_CARD for a correct guess", async () => {
        const testGameState: GameState = {
          stage: STAGE.CODEBREAKER,
          rounds: [
            {
              team: TEAM.RED,
              codeword: "test",
              guessesAllowed: 3,
              turns: [{ guessedWord: "red1" }],
            },
          ],
          cards: generateCards(["red1"]),
        };

        const newState = await handleCodebreakerStage(testGameState);
        const turn = newState.rounds[0].turns?.find(
          (t) => t.guessedWord === "red1",
        );
        expect(turn?.outcome).toBe("CORRECT_TEAM_CARD");
      });

      it("should set the outcome to INCORRECT_TEAM_CARD for a wrong guess", async () => {
        const testGameState: GameState = {
          stage: STAGE.CODEBREAKER,
          rounds: [
            {
              team: TEAM.RED,
              codeword: "test",
              guessesAllowed: 3,
              turns: [{ guessedWord: "green1" }],
            },
          ],
          cards: generateCards(["green1"]),
        };

        const newState = await handleCodebreakerStage(testGameState);
        const turn = newState.rounds[0].turns?.find(
          (t) => t.guessedWord === "green1",
        );
        expect(turn?.outcome).toBe("OTHER_TEAM_CARD");
      });

      it("should set the outcome to ASSASSIN_CARD for a guess on the assassin", async () => {
        const testGameState: GameState = {
          stage: STAGE.CODEBREAKER,
          rounds: [
            {
              team: TEAM.RED,
              codeword: "test",
              guessesAllowed: 3,
              turns: [{ guessedWord: "assassin" }],
            },
          ],
          cards: generateCards(["assassin"]),
        };

        const newState = await handleCodebreakerStage(testGameState);
        const turn = newState.rounds[0].turns?.find(
          (t) => t.guessedWord === "assassin",
        );
        expect(turn?.outcome).toBe("ASSASSIN_CARD");
      });

      it("should end the turn if guessesAllowed are exhausted", async () => {
        const testGameState: GameState = {
          stage: STAGE.CODEBREAKER,
          rounds: [
            {
              team: TEAM.RED,
              codeword: "test",
              guessesAllowed: 1,
              turns: [
                { guessedWord: "red1", outcome: "CORRECT_TEAM_CARD" },
                { guessedWord: "red2" },
              ],
            },
          ],
          cards: generateCards(["red1"]),
        };

        const newState = await handleCodebreakerStage(testGameState);
        expect(newState.stage).toBe(STAGE.CODEMASTER);
      });
    });

    it("should update cards and determine the red team as the winner", async () => {
      const testGameState: GameState = {
        stage: STAGE.CODEBREAKER,
        rounds: [
          {
            team: TEAM.RED,
            codeword: "test",
            guessesAllowed: 2,
            turns: [
              { guessedWord: "red1", outcome: "CORRECT_TEAM_CARD" },
              { guessedWord: "red2", outcome: "CORRECT_TEAM_CARD" },
            ],
          },
        ],
        cards: generateCards(["red1", "red2"]),
      };
      const newState = await handleCodebreakerStage(testGameState);
      expect(newState.winner).toBe(TEAM.RED);
    });
  });

  describe("handleGameOverStage", () => {
    it("should throw an error indicating the game is over and no more turns are allowed", async () => {
      const gameState: GameState = {
        stage: STAGE.GAMEOVER,
        rounds: [
          {
            team: TEAM.RED,
            codeword: "test",
            guessesAllowed: 1,
            turns: [
              { guessedWord: "red1", outcome: "CORRECT_TEAM_CARD" },
              { guessedWord: "red2", outcome: "CORRECT_TEAM_CARD" },
              { guessedWord: "red3", outcome: "CORRECT_TEAM_CARD" },
            ],
          },
        ],
        cards: generateCards(["red1", "red2", "red3"]),
      };
      expect(handleGameOverStage(gameState)).rejects.toThrow();
    });
  });
});
