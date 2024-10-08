/** 
* Game model object .. stores game states and words used within the game. 
*/
import mongoose from 'mongoose';
import shortid from 'shortid';

// this is the id used to join a game.. restricting to characters that are easy to read/type
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@');

const Game = new mongoose.Schema({
  _id: {
    type: String,
    default: shortid.generate
  },
  /* game settings */
  number_of_cards: {
    type: Number,
    required: true,
    default: 24
  },
  starting_team: {
    type: String,
    required: true,
    default: 'green'
  },
  number_of_assassins: {
    type: Number,
    required: true,
    default: 1
  },
  /* game states */
  game_paused: {
    type: Boolean,
    required: true,
    default: true
  },
  game_over: {
    type: Boolean,
    required: true,
    default: false
  },
  /* json array of word objects */
  words: [{
    word: {
      type: String,
      required: true
    },
    color: {
      type: String,
      required: true
    },
    selected: {
      type: Boolean,
      required: true,
      default: false
    }
  }]
});

/*
 * virtuals added to derive the red_score and green_score based on the number of selected cards for each team
 */
Game.virtual('red_score').get(function() {
  return this.words.filter(word => word.color === 'red' && word.selected).length;
});


Game.virtual('green_score').get(function() {
  return this.words.filter(word => word.color === 'green' && word.selected).length;
});

// Ensure virtuals are included in JSON and object output
Game.set('toJSON', { virtuals: true });
Game.set('toObject', { virtuals: true });

export default mongoose.model('Game', Game);
