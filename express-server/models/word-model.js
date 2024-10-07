/*
Model object used for persisting a new word to the database
*/

import mongoose from 'mongoose'
import random from 'mongoose-simple-random'
import AutoIncrementFactory from 'mongoose-sequence'

const Schema = mongoose.Schema

const AutoIncrement = AutoIncrementFactory(mongoose);

const Word = new Schema(
    {
        word: { type: String, required: true },
    },
    { timestamps: false },
)

Word.plugin(random);
Word.plugin(AutoIncrement, {inc_field: 'id'});

export default mongoose.model('word',Word);




