// @ts-nocheck
import {
  CODEBREAKER_OUTCOME,
  TEAM,
  STAGE,
} from "@codenames/shared/src/game/game-constants";
import {
  GameState,
  TurnOutcome,
  Team,
} from "@codenames/shared/src/game/game-types";
import GameStateProcessor from "./gameplay-state-common";

const { OTHER_TEAM_CARD, BYSTANDER_CARD, ASSASSIN_CARD, CORRECT_TEAM_CARD } =
  CODEBREAKER_OUTCOME;

export default class CodebreakerStateProcessor extends GameStateProcessor {
  private static readonly decisionTable = [
    {
      outcome: CORRECT_TEAM_CARD,
      action: (processor: CodebreakerStateProcessor) => {
        processor.handleCorrectTeamCard();
      },
    },
    {
      outcome: BYSTANDER_CARD,
      action: (processor: CodebreakerStateProcessor) => {
        processor.handleBystanderCard();
      },
    },
    {
      outcome: OTHER_TEAM_CARD,
      action: (processor: CodebreakerStateProcessor) => {
        processor.handleOtherTeamCard();
      },
    },
    {
      outcome: ASSASSIN_CARD,
      action: (processor: CodebreakerStateProcessor) => {
        processor.handleAssassinCard();
      },
    },
  ];

  private constructor(gameState: GameState) {
    super(gameState);
  }

  static from(gameState: GameState): CodebreakerStateProcessor {
    return new CodebreakerStateProcessor(gameState);
  }

  markCardAsSelected(): CodebreakerStateProcessor {
    const guessedWord = this.guessedWord;
    const selectedCard = this.gameState.cards.find(
      (card) => card.word === guessedWord,
    );

    if (!selectedCard) {
      throw new Error(
        `Guessed word '${guessedWord}' does not match any card in the game state.`,
      );
    }

    selectedCard.selected = true;
    return this;
  }

  updateTurnOutcome(): CodebreakerStateProcessor {
    const turnOutcome = this.determineTurnOutcome();
    const currentTurn = this.latestTurn;
    if (currentTurn) {
      currentTurn.outcome = turnOutcome;
    }

    return this;
  }

  executeCodebreakerTurnStrategy(): CodebreakerStateProcessor {
    if (this.gameState.stage !== STAGE.CODEBREAKER) {
      throw new Error("Method can only be called on the codebreaker stage.");
    }

    const turnOutcome = this.latestTurn?.outcome;

    if (!turnOutcome) {
      throw new Error(
        "Turn outcome is missing, cannot execute gameplay strategy.",
      );
    }

    const decisionEntry = CodebreakerStateProcessor.decisionTable.find(
      (entry) => entry.outcome === turnOutcome,
    );

    if (!decisionEntry || !decisionEntry.action) {
      throw new Error(`Invalid or unsupported turn outcome: '${turnOutcome}'.`);
    }

    decisionEntry.action(this);

    return this;
  }

  private determineTurnOutcome(): TurnOutcome {
    const guessedWord = this.guessedWord;
    const selectedCard = this.gameState.cards.find(
      (card) => card.word === guessedWord,
    );

    if (!selectedCard) {
      throw new Error(
        `Guessed word '${guessedWord}' does not match any card in the game state.`,
      );
    }

    if (selectedCard.team === TEAM.ASSASSIN) {
      return ASSASSIN_CARD;
    }

    if (selectedCard.team === this.currentTeam) {
      return CORRECT_TEAM_CARD;
    }

    if (selectedCard.team === TEAM.BYSTANDER) {
      return BYSTANDER_CARD;
    }

    if (selectedCard.team !== this.currentTeam) {
      return OTHER_TEAM_CARD;
    }

    throw new Error(
      `Invalid card team '${selectedCard.team}' encountered during outcome determination.`,
    );
  }

  private handleCorrectTeamCard(): void {
    const currentRound = this.lastRound;

    if (!currentRound!.turns) {
      throw new Error("No active round found.");
    }

    if (currentRound!.turns.length >= (currentRound!.guessesAllowed ?? 0) + 1) {
      this.addNewRound(this.otherTeam!);
      this.gameState.stage = STAGE.CODEMASTER;
      return;
    }

    if (this.selectedCardsForTeam === this.totalCardsForTeam) {
      this.setGameOver(this.currentTeam!);
      return;
    }

    // Default: allow more guesses
  }

  private handleBystanderCard(): void {
    this.addNewRound(this.otherTeam!);
    this.gameState.stage = STAGE.CODEMASTER;
  }

  private handleOtherTeamCard(): void {
    this.addNewRound(this.otherTeam!);
    this.gameState.stage = STAGE.CODEMASTER;
  }

  private handleAssassinCard(): void {
    this.setGameOver(this.otherTeam!);
  }

  private setGameOver(winner: Team): void {
    this.gameState.stage = STAGE.GAMEOVER;
    this.gameState.winner = winner;
  }
}
