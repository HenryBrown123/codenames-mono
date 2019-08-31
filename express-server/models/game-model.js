const mongoose = require('mongoose')
var shortid = require('shortid')
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@');
var Schema = mongoose.Schema

var Game = new Schema({

    _id: {
        'type': String,
        'default': shortid.generate
      },

    /* game states */
    game_paused: {type : Boolean, required:true, default:true},  
    round: {type: Number, required:true, default: 1},
    elapsed_round_time: {type: Number, required:true, default:0},
    
    red_score: {type: Number, required: true, default: 0},
    green_score: {type: Number, required: true, default: 0},
    game_over: {type : Boolean, required:true, default:false},
    

    /* ----------- */

    words : [{
        word: { type: String, required: true },
        color: {type: String, required: true},
        selected: {type: Boolean, required:true, default:false}
    }]

})
module.exports = mongoose.model('game',Game);


