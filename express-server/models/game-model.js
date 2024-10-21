import mongoose from "mongoose";
import shortid from "shortid";

// shortid used so identifier is more human readable & easier to type when joining a game
shortid.characters(
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@"
);

// sub-schema for a game word
const CardSchema = new mongoose.Schema(
  {
    word: {
      type: String,
      required: true,
    },
    team: {
      type: String,
      required: true,
      enum: ["red", "green", "none", "assassin"],
    },
    selected: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { _id: false }
);

// sub-schema for each round
const RoundSchema = new mongoose.Schema(
  {
    team: { type: String },
    codeword: { type: String },
    guessesAllowed: {
      type: Number,
    },
    guessedWords: [String],
  },
  { _id: false }
);

// sub-schema for settings
const SettingsSchema = new mongoose.Schema(
  {
    numberOfCards: {
      type: Number,
      required: true,
      default: 24,
    },
    startingTeam: {
      type: String,
      required: true,
      default: "green",
      enum: ["green", "red"],
    },
    numberOfAssassins: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  { _id: false }
);

// sub-schema for game state (stuff you need to know to track gameplay)
const GameStateSchema = new mongoose.Schema(
  {
    stage: {
      type: String,
      required: true,
      default: "intro",
      enum: ["intro", "codemaster", "codebreaker", "gameover"],
    },
    winner: { type: String, required: false },
    cards: [CardSchema],
    rounds: [RoundSchema],
  },
  { _id: false }
);

const GameSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: shortid.generate,
    },
    state: GameStateSchema,
    settings: SettingsSchema,
  },
  { timestamps: true }
);

// Virtuals for derived scores
GameSchema.virtual("redScore").get(function () {
  return this.state.cards.filter(
    (word) => word.color === "red" && word.selected
  ).length;
});

GameSchema.virtual("greenScore").get(function () {
  return this.state.cards.filter(
    (word) => word.color === "green" && word.selected
  ).length;
});

// Ensure virtuals are included in JSON and object output
GameSchema.set("toJSON", { virtuals: true });
GameSchema.set("toObject", { virtuals: true });

export default mongoose.model("Game", GameSchema);
