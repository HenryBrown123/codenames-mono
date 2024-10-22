import mongoose from 'mongoose';
import random from 'mongoose-simple-random';
import AutoIncrementFactory from 'mongoose-sequence';
import { WordDocument } from './types';


/**
 * Model object used for persisting a new word to the database.
 */
const WordSchema = new mongoose.Schema<WordDocument>(
  {
    word: { type: String, required: true },
  },
  { timestamps: false }
);

// Apply plugins to the schema
WordSchema.plugin(random);

const AutoIncrement = AutoIncrementFactory(mongoose);
WordSchema.plugin(AutoIncrement, { inc_field: 'id' });

// Export the model
export default mongoose.model<WordDocument>('word', WordSchema);
