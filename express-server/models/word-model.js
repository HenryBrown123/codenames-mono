/*
Model object used for persisting a new word to the database
*/

const mongoose = require('mongoose')
var Schema = mongoose.Schema

var random = require('mongoose-simple-random'); // plugin
var AutoIncrement = require('mongoose-sequence')(mongoose)

var Word = new Schema(
    {
        word: { type: String, required: true },
    },
    { timestamps: false },
)
Word.plugin(random);
Word.plugin(AutoIncrement, {inc_field: 'id'});
module.exports = mongoose.model('word',Word);



