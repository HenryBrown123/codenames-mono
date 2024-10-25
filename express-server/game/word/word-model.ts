import mongoose, { Schema, model, Document, Model } from "mongoose";

// Model object used for persisting a new word to the database.
export interface WordDocument extends Document {
  word: string;
}

const WordSchema = new Schema<WordDocument>(
  {
    word: { type: String, required: true },
  },
  { timestamps: false }
);

const Word = model("Word", WordSchema);

export default Word;
