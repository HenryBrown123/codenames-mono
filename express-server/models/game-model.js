const mongoose = require('mongoose')
var AutoIncrement = require('mongoose-sequence')(mongoose)
var Schema = mongoose.Schema

var Game = new Schema(
    {
        word: { type: String, required: true },
        color: {type: String, required: true},
    },
    { timestamps: false },
)
Game.plugin(AutoIncrement, {inc_field: 'gameid'});
module.exports = mongoose.model('game',Game);



