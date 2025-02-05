import mongoose, { Schema, model, Document, Model } from "mongoose";

export interface WordData {
  word: string;
}
export interface WordDocument extends WordData, Document {
  _id: string;
}

const WordSchema = new Schema<WordDocument>(
  {
    word: { type: String, required: true },
  },
  { timestamps: false },
);

const Word = model("Word", WordSchema);

export default Word;
