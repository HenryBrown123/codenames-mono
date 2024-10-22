import mongoose, { Model } from 'mongoose';
import shortid from 'shortid';
import { Team, Stage, Card, Round, Settings, GameState, GameDocument } from './types'

shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@');

// Sub-schema for a game word
const CardSchema = new mongoose.Schema<Card>(
  {
    word: { type: String, required: true },
    team: { type: String, required: true, enum: Object.values(Team) },
    selected: { type: Boolean, required: true, default: false },
  },
  { _id: false }
);

// Sub-schema for each round
const RoundSchema = new mongoose.Schema<Round>(
  {
    team: { type: String, enum: Object.values(Team) },
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
    startingTeam: { type: String, required: true, default: Team.Green, enum: Object.values(Team) },
    numberOfAssassins: { type: Number, required: true, default: 1 },
  },
  { _id: false }
);

// Sub-schema for game state (stuff you need to know to track gameplay)
const GameStateSchema = new mongoose.Schema<GameState>(
  {
    stage: { type: String, required: true, default: Stage.Intro, enum: Object.values(Stage) },
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
  { timestamps: true }
);

// Virtuals for derived scores
GameSchema.virtual('redScore').get(function (this: GameDocument) {
  return this.state.cards.filter((card) => card.team === Team.Red && card.selected).length;
});

GameSchema.virtual('greenScore').get(function (this: GameDocument) {
  return this.state.cards.filter((card) => card.team === Team.Green && card.selected).length;
});

// Ensure virtuals are included in JSON and object output
GameSchema.set('toJSON', { virtuals: true });
GameSchema.set('toObject', { virtuals: true });

const GameModel: Model<GameDocument> = mongoose.model<GameDocument>('Game', GameSchema);

export default GameModel;
