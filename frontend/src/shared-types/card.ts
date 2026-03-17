import { CARD_TYPE } from "@codenames/shared/types";
import { assertEnum } from "./assert-enum";

/** Card type on the game board */
export type CardType = (typeof CARD_TYPE)[keyof typeof CARD_TYPE];

/** A word card on the game board */
export interface Card {
  word: string;
  selected: boolean;
  teamName: string | null;
  cardType: string;
}

/** Asserts a string is a valid card type. Throws if the API contract is broken. */
const cardTypes = new Set<string>(Object.values(CARD_TYPE));

export function assertCardType(value: string): asserts value is CardType {
  assertEnum<CardType>(value, cardTypes, "CardType");
}
