const mongoose = require('mongoose')
var AutoIncrement = require('mongoose-sequence')(mongoose)
var Schema = mongoose.Schema

var Game = new Schema({

    /* game states */
    in_progress: {type : Boolean, required:true, default:true},
    red_score: {type: Number, required: true, default: 0},
    green_score: {type: Number, required: true, default: 0},

    /* ----------- */

    words : [{
        word: { type: String, required: true },
        color: {type: String, required: true},
        selected: {type: Boolean, required:true, default:false}
    }]

})
module.exports = mongoose.model('game',Game);


