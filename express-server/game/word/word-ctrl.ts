import { Request, Response } from "express";
import Word, { WordDocument } from "./word-model";

/**
 * Utility function that returns an array of unique indices for selecting random words
 *
 * @param numberOfWords
 * @param totalWords
 * @returns number[]
 */

const getUniqueRandomIndices = (
  numberOfWords: number,
  totalWords: number
): number[] => {
  const indices: Set<number> = new Set();
  while (indices.size < numberOfWords) {
    const index = Math.floor(Math.random() * totalWords);
    indices.add(index);
  }
  return Array.from(indices);
};

// Define types for request objects
export interface PostWordArrayRequest extends Request {
  body: Array<{ word: string }>;
}

export interface CreateWordRequest extends Request {
  body: { word: string };
}

// Controller functions

export const getRandomWords = async (
  numberOfWords: number
): Promise<WordDocument[]> => {
  try {
    const totalWords = await Word.countDocuments();
    const randomIndices = getUniqueRandomIndices(numberOfWords, totalWords);
    const randomWordsPromises = randomIndices.map((index) =>
      Word.findOne().skip(index).exec()
    );

    return await Promise.all(randomWordsPromises);
  } catch (error) {
    console.error("Error fetching random words:", error);
    throw error;
  }
};

export const postWordArray = async (
  req: PostWordArrayRequest,
  res: Response
): Promise<Response> => {
  const body = req.body;
  if (!body) {
    return res
      .status(400)
      .json({ success: false, error: "You must provide one or more words" });
  }
  for (const wordData of body) {
    try {
      const word = new Word(wordData);
      await word.save();
      return res
        .status(201)
        .json({ success: true, id: word._id, message: "Word created!" });
    } catch (error) {
      return res
        .status(400)
        .json({ success: false, error, message: "Word not created!" });
    }
  }
};

export const getRandomWordsHandler = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const numberOfWords: number = parseInt(req.query.count as string);

    if (!numberOfWords) {
      return res.status(404).json({
        success: false,
        error: "No count specified for random array",
      });
    }

    const words = await getRandomWords(numberOfWords);
    if (words.length === 0) {
      return res.status(404).json({
        success: false,
        error:
          "No words found, populate db with start point (express-server/db/startpoint.json)",
      });
    }
    return res.status(200).json({ success: true, words: words });
  } catch (err: any) {
    return res
      .status(400)
      .json({ success: false, error: err.message || "Unknown error" });
  }
};

export const getRandomWordHandler = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const words = await getRandomWords(1);
    if (words.length === 0) {
      return res.status(404).json({
        success: false,
        error:
          "No words found, populate db with start point (express-server/db/startpoint.json)",
      });
    }
    return res.status(200).json({ success: true, data: words[0] });
  } catch (err: any) {
    console.error("Error fetching random word:", err.message || err);
    return res
      .status(400)
      .json({ success: false, error: err.message || "Unknown error" });
  }
};

export const createWord = async (
  req: CreateWordRequest,
  res: Response
): Promise<Response> => {
  const body = req.body;
  if (!body) {
    return res
      .status(400)
      .json({ success: false, error: "You must provide a word" });
  }
  try {
    const word = new Word(body);
    await word.save();
    return res
      .status(201)
      .json({ success: true, id: word._id, message: "Word created!" });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, error, message: "Word not created!" });
  }
};
