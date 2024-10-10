import mongoose from "mongoose";
import shortid from "shortid";

shortid.characters("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@");

// sub-schema for a game word
const WordSchema = new mongoose.Schema({
  word: { 
    type: String, 
    required: true,
  },
  color: { 
    type: String, 
    required: true, 
    enum: ["red", "green", "blue"] 
  },
  selected: { 
    type: Boolean, 
    required: true, 
    default: false 
  },
});

// sub-schema for each round 
const RoundSchema = new mongoose.Schema({
  sequence: { type: Number },
  roundStartedAt: { type: Date },
  team: { type: String },
  codeword: { type: String },
  guessesAllowed: { 
    type: Number,
  },
  guessedWords: [String],
});

// sub-schema for settings 
const SettingsSchema = new mongoose.Schema({
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
});

// sub-schema for game state (stuff you need to know to track gameplay)
const GameStateSchema = new mongoose.Schema({
  stage: { 
    type: String, 
    required: true, 
    default: "none",
    enum: ["none", "intro", "codemaster","codebreaker","gameover"],
  },
  words: [WordSchema],
  rounds: [RoundSchema],
});

const GameSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: shortid.generate,
  },
  settings: SettingsSchema,
  state: GameStateSchema,
}, { timestamps: true });

// Virtuals for derived scores
GameSchema.virtual("redScore").get(function () {
  return this.state.words.filter(word => word.color === "red" && word.selected).length;
});

GameSchema.virtual("greenScore").get(function () {
  return this.state.words.filter(word => word.color === "green" && word.selected).length;
});

// Ensure virtuals are included in JSON and object output
GameSchema.set("toJSON", { virtuals: true });
GameSchema.set("toObject", { virtuals: true });

export default mongoose.model("Game", GameSchema);
