import mongoose, { Model } from "mongoose";
import shortid from "shortid";
import {
  Settings,
  Card,
  Round,
  GameState,
  GameData,
} from "src/game/game-common-types";

import { TEAM, STAGE } from "@game/game-common-constants";

export interface GameDocument extends Document, GameData {
  _id: string;
  save(): Promise<GameDocument>;
}

shortid.characters(
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@"
);

// Sub-schema for a game word
const CardSchema = new mongoose.Schema<Card>(
  {
    word: { type: String, required: true },
    team: { type: String, required: true, enum: Object.values(TEAM) },
    selected: { type: Boolean, required: true, default: false },
  },
  { _id: false }
);

// Sub-schema for each round
const RoundSchema = new mongoose.Schema<Round>(
  {
    team: { type: String, enum: Object.values(TEAM) },
    codeword: { type: String },
    guessesAllowed: { type: Number },
    guessedWords: [String],
  },
  { _id: false }
);

// Sub-schema for settings
const SettingsSchema = new mongoose.Schema<Settings>(
  {
    numberOfCards: { type: Number, required: true, default: 24 },
    startingTeam: {
      type: String,
      required: true,
      default: TEAM.GREEN,
      enum: Object.values(TEAM),
    },
    numberOfAssassins: { type: Number, required: true, default: 1 },
  },
  { _id: false }
);

// Sub-schema for game state (stuff you need to know to track gameplay)
const GameStateSchema = new mongoose.Schema<GameState>(
  {
    stage: {
      type: String,
      required: true,
      default: STAGE.INTRO,
      enum: Object.values(STAGE),
    },
    winner: { type: String },
    cards: [CardSchema],
    rounds: [RoundSchema],
  },
  { _id: false }
);

// Main schema for game
const GameSchema = new mongoose.Schema<GameDocument>(
  {
    _id: { type: String, default: shortid.generate },
    state: GameStateSchema,
    settings: SettingsSchema,
  },
  { timestamps: true, strict: true }
);

// Virtuals for derived scores
GameSchema.virtual("redScore").get(function (this: GameDocument) {
  return this.state.cards.filter(
    (card) => card.team === TEAM.RED && card.selected
  ).length;
});

GameSchema.virtual("greenScore").get(function (this: GameDocument) {
  return this.state.cards.filter(
    (card) => card.team === TEAM.GREEN && card.selected
  ).length;
});

// Ensure virtuals are included in JSON and object output
GameSchema.set("toJSON", { virtuals: true });
GameSchema.set("toObject", { virtuals: true });

const GameModel = mongoose.model<GameDocument>("Game", GameSchema);

export default GameModel;
