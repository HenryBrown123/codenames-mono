import mongoose, { Document, Model } from "mongoose";
import random from "mongoose-simple-random";
import AutoIncrementFactory from "mongoose-sequence";

/**
 * Model object used for persisting a new word to the database.
 */
export interface WordDocument extends Document {
  word: string;
}

const WordSchema = new mongoose.Schema<WordDocument>(
  {
    word: { type: String, required: true },
  },
  { timestamps: false }
);

// Apply plugins to the schema
WordSchema.plugin(random);
const AutoIncrement = AutoIncrementFactory(mongoose);
WordSchema.plugin(AutoIncrement, { inc_field: "id" });

// Explicitly declare the type for the Word model
interface WordModel extends Model<WordDocument> {
  findRandom: (
    conditions: any,
    projection?: any,
    options?: any
  ) => Promise<WordDocument[]>; // Simplified without callback
  findOneRandom: () => Promise<WordDocument>; // Simplified without callback
}

const Word: WordModel = mongoose.model<WordDocument, WordModel>(
  "Word",
  WordSchema
);
export default Word;
