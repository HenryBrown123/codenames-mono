/**
 * Game model object .. stores game states and words used within the game.
 */
import mongoose from "mongoose";
import shortid from "shortid";

// this is the id used to join a game.. restricting to characters that are easy to read/type
shortid.characters(
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@",
);

const Game = new mongoose.Schema({
  _id: {
    type: String,
    default: shortid.generate,
  },

  /* game settings */
  settings: {
    numberOfCards: {
      type: Number,
      required: true,
      default: 24,
    },
    startingTeam: {
      type: String,
      required: true,
      default: "green",
    },
    numberOfAssassins: {
      type: Number,
      required: true,
      default: 1,
    },
  },

  /* current game state */

  state: {
    stage: { type: String, required: true, default: "none" },
    paused: {
      type: Boolean,
      required: true,
      default: true,
    },
    gameOver: {
      type: Boolean,
      required: true,
      default: false,
    },

    codeword: { type: String },
    guesses: { type: Number },

    /* json array of word objects */
    words: [
      {
        word: {
          type: String,
          required: true,
        },
        color: {
          type: String,
          required: true,
        },
        selected: {
          type: Boolean,
          required: true,
          default: false,
        },
      },
    ],
  },

  rounds: [
    {
      sequence: { type: Number },
      team: { type: String },
      codeword: { type: String },
      guessesAllowed: { type: Number },
      guessedWords: { type: Number },
    },
  ],
});

/*
 * virtuals added to derive the red_score and green_score based on the number of selected cards for each team
 */
Game.virtual("redScore").get(function () {
  return this.state.words.filter(
    (word) => word.color === "red" && word.selected,
  ).length;
});

Game.virtual("greenScore").get(function () {
  return this.state.words.filter(
    (word) => word.color === "green" && word.selected,
  ).length;
});

// Ensure virtuals are included in JSON and object output
Game.set("toJSON", { virtuals: true });
Game.set("toObject", { virtuals: true });

export default mongoose.model("Game", Game);
