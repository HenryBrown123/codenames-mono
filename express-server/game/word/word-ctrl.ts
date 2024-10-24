import { Request, Response } from "express";
import Word, { WordDocument } from "./word-model";

// Define types for request objects
export interface PostWordArrayRequest extends Request {
  body: Array<{ word: string }>;
}

export interface CreateWordRequest extends Request {
  body: { word: string };
}

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

export const getRandomWords = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const results = await Word.findRandom({}, {}, { limit: 12 });
    if (!results) {
      return res.status(404).json({
        success: false,
        error:
          "No words found, populate db with start point (express-server/db/startpoint.json)",
      });
    }
    return res.status(200).json({ success: true, words: results });
  } catch (err) {
    return res.status(400).json({ success: false, error: err });
  }
};

export const getRandomWord = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const word = await Word.findOneRandom();
    if (!word) {
      return res.status(404).json({
        success: false,
        error:
          "No words found, populate db with start point (express-server/db/startpoint.json)",
      });
    }
    return res.status(200).json({ success: true, data: word });
  } catch (err) {
    return res.status(400).json({ success: false, error: err });
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
