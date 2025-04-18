import { Kysely, Selectable } from "kysely";
import { DB, Players } from "../db/db.types";
import { UnexpectedRepositoryError } from "./repository.errors";

/** Represents the input data for creating a player in the database */
export type PlayerInput = {
  userId: number;
  gameId: number;
  publicName: string;
  teamId: number;
  statusId: number;
};

/** Player modify input å*/
export type ModifyPlayerInput = {
  gameId: number;
  playerId: number;
  publicName?: string;
  teamId?: number;
  userId?: number;
};

/** Represents a player record retrieved from the database */
export type PlayerResult = {
  id: number;
  userId: number;
  gameId: number;
  teamId: number;
  statusId: number;
  publicName: string;
};

/** columns to use for PlayerResult type */
const playerResultColumns = [
  "id",
  "user_id",
  "game_id",
  "team_id",
  "status_id",
  "public_name",
  "updated_at",
  "status_last_changed",
] as const;

/**
 *
 * @param db - Database connection
 * @returns - function that returns a player from player id.
 */

export const getPlayerById = (db: Kysely<DB>) => async (playerId: number) => {
  const player = db
    .selectFrom("players")
    .where("players.id", "=", playerId)
    .select(playerResultColumns)
    .executeTakeFirst();

  return player;
};
/**
 * Creates a function to add players to the database
 * @param db - Database connection
 * @returns Function to insert players
 */
export const addPlayers =
  (db: Kysely<DB>) =>
  /**
   * Inserts new players into the database
   * @param playersData - Array of player data to insert
   * @returns Newly created player records
   * @throws {UnexpectedLobbyError} If insertion fails
   */
  async (playersData: PlayerInput[]): Promise<PlayerResult[]> => {
    if (playersData.length === 0) {
      return [];
    }

    const values = playersData.map((player) => ({
      user_id: player.userId,
      game_id: player.gameId,
      public_name: player.publicName,
      team_id: player.teamId,
      status_id: player.statusId,
      updated_at: new Date(),
    }));

    const newPlayers = await db
      .insertInto("players")
      .values(values)
      .returning(playerResultColumns)
      .execute();

    if (!newPlayers.length) {
      throw new UnexpectedRepositoryError(
        "Failed to create players. Empty response from inserts.",
      );
    }

    return newPlayers.map((player) => ({
      id: player.id,
      userId: player.user_id,
      gameId: player.game_id,
      teamId: player.team_id,
      statusId: player.status_id,
      publicName: player.public_name,
    }));
  };

/**
 * Creates a function to retrieve players for a specific game
 * @param db - Database connection
 * @returns Function to fetch players by game ID
 */
export const getPlayersByGameId =
  (db: Kysely<DB>) =>
  /**
   * Fetches all players in a given game
   * @param gameId - The ID of the game to fetch players for
   * @returns List of players in the specified game
   */
  async (gameId: number): Promise<PlayerResult[]> => {
    const players = await db
      .selectFrom("players")
      .where("game_id", "=", gameId)
      .select(playerResultColumns)
      .execute();

    return players.map((player) => ({
      id: player.id,
      userId: player.user_id,
      gameId: player.game_id,
      teamId: player.team_id,
      statusId: player.status_id,
      publicName: player.public_name,
    }));
  };

/**
 * Creates a function to remove a player from the database
 * @param db - Database connection
 * @returns Function to delete a specific player
 */
export const removePlayer =
  (db: Kysely<DB>) =>
  /**
   * Deletes a specific player from the database
   * @param playerId - The ID of the player to remove
   * @returns The removed player record or null if not found
   */
  async (playerId: number): Promise<PlayerResult> => {
    const removedPlayer = await db
      .deleteFrom("players")
      .where("players.id", "=", playerId)
      .returningAll()
      .executeTakeFirstOrThrow();

    return {
      id: removedPlayer.id,
      userId: removedPlayer.user_id,
      gameId: removedPlayer.game_id,
      teamId: removedPlayer.team_id,
      statusId: removedPlayer.status_id,
      publicName: removedPlayer.public_name,
    };
  };

/**
 * Modifies one or more players in a game
 * @param playersData Array of player data to update
 * @returns Array of modified players
 */
export const modifyPlayers =
  (db: Kysely<DB>) => async (playersData: ModifyPlayerInput[]) => {
    if (!playersData.length) {
      return [];
    }

    // Filter to just players with updatable fields as not guaranteed with types
    const playersWithUpdates = playersData.filter(
      (player) =>
        player.publicName !== undefined ||
        player.teamId !== undefined ||
        player.userId !== undefined,
    );

    const repositoryResponse: Selectable<Players>[] = await db
      .transaction()
      .execute(async (trx) => {
        const updates = playersWithUpdates.map((player) => {
          // produce object array of values with dynamic properies to prevent
          // unnecessary updates.
          const updateValues = Object.fromEntries(
            Object.entries({
              user_id: player.userId,
              public_name: player.publicName,
              team_id: player.teamId,
              updated_at: new Date(),
            }).filter(([_, value]) => value !== undefined),
          );

          return trx
            .updateTable("players")
            .set(updateValues)
            .where("players.id", "=", player.playerId)
            .where("players.game_id", "=", player.gameId)
            .executeTakeFirstOrThrow();
        });

        await Promise.all(updates);

        const allPlayerIdsToModify = playersData.map(
          (player) => player.playerId,
        );

        const modifiedPlayers = await trx
          .selectFrom("players")
          .where("id", "in", allPlayerIdsToModify)
          .select(playerResultColumns)
          .execute();

        const missingPlayers = allPlayerIdsToModify.filter(
          (playerId) =>
            !modifiedPlayers.map((player) => player.id).includes(playerId),
        );

        if (missingPlayers) {
          throw new UnexpectedRepositoryError(
            "Players could not be found to modify",
            {
              cause: {
                expected: playersWithUpdates,
                modified: modifiedPlayers.map((player) => player.id),
                missing: missingPlayers,
              },
            },
          );
        }

        return modifiedPlayers;
      });

    if (!repositoryResponse) {
      throw new UnexpectedRepositoryError(
        "Failed to modify players. Empty response",
      );
    }

    return repositoryResponse;
  };
