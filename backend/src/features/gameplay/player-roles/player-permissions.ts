import { Player } from "@codenames/shared/types";

/** View permissions */

const viewCardType = { viewCardType: true } as const;
type ViewCardType = typeof viewCardType;

export type CodemasterViewPermissions = ViewCardType;
export type CodebreakerViewPermissions = {};

/** Action permissions */

const giveClue = { giveClue: true } as const;
type GiveClue = typeof giveClue;

const giveGuess = { giveCodeWord: true } as const;
type GiveGuess = typeof giveGuess;

const endTurn = { endTurn: true } as const;
type EndTurn = typeof endTurn;

export type CodemasterActionPermissions = GiveClue;
export type CodebreakerActionPermissions = GiveGuess & EndTurn;

/** Authorized player */

type AuthorizedPlayer<T, B> = Player & T & B;

export type AuthorizedCodemaster = AuthorizedPlayer<
  CodemasterViewPermissions,
  CodemasterActionPermissions
>;

export type AuthorizedCodebereaker = AuthorizedPlayer<
  CodebreakerViewPermissions,
  CodebreakerActionPermissions
>;
