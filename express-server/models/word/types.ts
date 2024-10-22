import { Document } from 'mongoose';

// Interface for the Word document
export interface WordDocument extends Document {
    word: string;
  }

