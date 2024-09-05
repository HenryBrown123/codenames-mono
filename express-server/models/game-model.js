/** 
* Game model object .. stores game states and words used within the game. 
*/

const mongoose = require('mongoose')
var Schema = mongoose.Schema

// this is the id used to join a game.. restricting to characters that are easy to read/type
var shortid = require('shortid')
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@');

var Game = new Schema({
    _id: {
        'type': String,
        'default': shortid.generate
      },

    /* game settings */
    number_of_cards: {type: Number, required: true, default: 24} ,
    starting_team: {type: String, required: true, default: 'green'},
    number_of_assasins: {type: Number, required: true, default: 1},

    /* game states */
    game_paused: {type : Boolean, required:true, default:true},  
    round: {type: Number, required:true, default: 1},
    elapsed_round_time: {type: Number, required:true, default:0},
    red_score: {type: Number, required: true, default: 0},
    green_score: {type: Number, required: true, default: 0},
    game_over: {type : Boolean, required:true, default:false},
    

    /* json array of word objects */
    words : [{
        word: { type: String, required: true },
        color: {type: String, required: true},
        selected: {type: Boolean, required:true, default:false}
    }]

})
module.exports = mongoose.model('game',Game);


