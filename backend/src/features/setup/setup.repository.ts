import { DB } from "src/db/db.types";
import { Kysely, sql } from "kysely";

/**
 * Main exported object containing repository functions with partially applied database dependency.
 *
 * @param db - Database instance applied to repository functions
 * @returns An object with repository functions.
 */
export const gameSetupRepository = (db: Kysely<DB>) => ({
  createGame: createGameDb(db),
  createNewRound: createRoundDb(db),
  createRoundCards: createRoundCardsDb(db),
  createPlayers: createPlayersDb(db),
});

/**
 * Type for creating a game record.
 */
export type CreateGameRepository = (
  publicId: string,
) => Promise<{ id: number } | undefined>;

const createGameDb: (db: Kysely<DB>) => CreateGameRepository =
  (db: Kysely<DB>) => async (publicId: string) => {
    const insertedGame = await db
      .insertInto("games")
      .values({
        public_id: publicId,
        created_at: new Date(),
        status_id: 1,
      })
      .returning("id")
      .executeTakeFirst();

    return insertedGame;
  };

/**
 * Type for creating a new round for a game.
 */
export type CreateNewRoundRepository = (
  gameId: number,
) => Promise<{ id: number } | undefined>;

const createRoundDb: (db: Kysely<DB>) => CreateNewRoundRepository =
  (db: Kysely<DB>) => async (gameId: number) => {
    const insertRound = await db
      .insertInto("rounds")
      .values({
        game_id: gameId,
        round_number: db
          .selectFrom("rounds")
          .select(sql<number>`max(round_number) + 1`.as("next_round_number"))
          .where("game_id", "=", gameId)
          .groupBy("game_id"),
        created_at: new Date(),
      })
      .returning("id")
      .executeTakeFirst();

    return insertRound;
  };

/**
 * Card value type.
 */
export interface CardValue {
  cardWord: string;
  teamId: number;
}

/**
 * Function type for creating card records for a round.
 */
export type CreateRoundCardsRepository = (
  roundId: number,
  words: CardValue[],
) => Promise<
  | {
      id: number;
      word: string;
      team_id: number;
    }[]
  | undefined
>;

const createRoundCardsDb: (db: Kysely<DB>) => CreateRoundCardsRepository =
  (db: Kysely<DB>) => async (roundId: number, words: CardValue[]) => {
    const insertCards = await db
      .insertInto("cards")
      .values(
        words.map(({ cardWord, teamId }) => ({
          round_id: roundId,
          word: cardWord,
          team_id: teamId,
        })),
      )
      .returning(["id", "word", "team_id"])
      .execute();

    return insertCards;
  };

/**
 * Player value type.
 */
export interface PlayerValue {
  userId: number;
  teamId: number;
  statusId: number;
}

/**
 * Type for creating player records for a game.
 */
export type CreatePlayersRepository = (
  gameId: number,
  players: PlayerValue[],
) => Promise<
  | {
      id: number;
      user_id: number;
      status_id: number;
      team_id: number | null;
      status_last_changed: Date | null;
    }[]
  | undefined
>;

const createPlayersDb: (db: Kysely<DB>) => CreatePlayersRepository =
  (db: Kysely<DB>) => async (gameId: number, players: PlayerValue[]) => {
    const insertPlayers = await db
      .insertInto("players")
      .values(
        players.map(({ userId, teamId }) => ({
          game_id: gameId,
          user_id: userId,
          team_id: teamId,
          status_id: 1,
        })),
      )
      .returning([
        "id",
        "user_id",
        "status_id",
        "team_id",
        "status_last_changed",
      ])
      .execute()
      .catch((err) => {
        return undefined;
      });

    return insertPlayers;
  };
