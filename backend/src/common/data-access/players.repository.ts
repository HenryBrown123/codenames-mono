import { Kysely, Selectable } from "kysely";
import { DB, Players } from "../db/db.types";
import { UnexpectedRepositoryError } from "./repository.errors";

/**
 * ==================
 * REPOSITORY TYPES
 * ==================
 */

/** Domain-specific identifier types */
export type PlayerId = number;
export type UserId = number;
export type GameId = number;
export type TeamId = number;

/** Entity data types */
export type PlayerData = {
  id: number;
  user_id: number;
  game_id: number;
  team_id: number;
  public_name: string;
  status_id: number;
};

/** Input data types */
export type PlayerInput = {
  userId: number;
  gameId: number;
  publicName: string;
  teamId: number;
  statusId: number;
};

export type PlayerUpdateInput = {
  playerId: number;
  gameId: number;
  teamId?: number;
};

export type ModifyPlayerInput = {
  gameId: number;
  playerId: number;
  publicName?: string;
  teamId?: number;
  userId?: number;
};

/** Output/result types */
export type PlayerResult = {
  id: number;
  userId: number;
  gameId: number;
  teamId: number;
  statusId: number;
  publicName: string;
};

/** Repository function types */
export type PlayerFinder<T extends PlayerId> = (
  identifier: T,
) => Promise<PlayerResult | null>;

/** Repository function types */
export type PlayerFinderAll<T extends GameId> = (
  identifier: T,
) => Promise<PlayerResult[] | []>;

export type PlayersCreator = (
  players: PlayerInput[],
) => Promise<PlayerResult[]>;

export type PlayersUpdater = (
  updates: ModifyPlayerInput[],
) => Promise<PlayerResult[]>;

export type PlayerRemover = (playerId: PlayerId) => Promise<PlayerResult>;

/**
 * ==================
 * DATABASE UTILITIES
 * ==================
 */

/** Columns to use for PlayerResult type */
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
 * ==================
 * REPOSITORY FUNCTIONS
 * ==================
 */

/**
 * Creates a function for finding a player by ID
 *
 * @param db - Database connection
 */
export const findPlayerById =
  (db: Kysely<DB>): PlayerFinder<PlayerId> =>
  /**
   * Retrieves player data using its ID
   *
   * @param playerId - The player's ID
   * @returns Player data if found, null otherwise
   */
  async (playerId) => {
    const player = await db
      .selectFrom("players")
      .where("players.id", "=", playerId)
      .select(playerResultColumns)
      .executeTakeFirst();

    return player
      ? {
          id: player.id,
          userId: player.user_id,
          gameId: player.game_id,
          teamId: player.team_id,
          statusId: player.status_id,
          publicName: player.public_name,
        }
      : null;
  };

/**
 * Creates a function for listing players in a game
 *
 * @param db - Database connection
 */
export const findPlayersByGameId =
  (db: Kysely<DB>): PlayerFinderAll<GameId> =>
  /**
   * Fetches all players in a given game
   *
   * @param gameId - The ID of the game to fetch players for
   * @returns List of players in the specified game
   */
  async (gameId) => {
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
 * Creates a function for adding players to a game
 *
 * @param db - Database connection
 */
export const addPlayers =
  (db: Kysely<DB>): PlayersCreator =>
  /**
   * Inserts new players into the database
   *
   * @param playersData - Array of player data to insert
   * @returns Newly created player records
   * @throws {UnexpectedRepositoryError} If insertion fails
   */
  async (playersData) => {
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
 * Creates a function for removing a player from a game
 *
 * @param db - Database connection
 */
export const removePlayer =
  (db: Kysely<DB>): PlayerRemover =>
  /**
   * Deletes a specific player from the database
   *
   * @param playerId - The ID of the player to remove
   * @returns The removed player record
   * @throws If player not found
   */
  async (playerId) => {
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
 * Creates a function for modifying players in a game
 *
 * @param db - Database connection
 */
export const modifyPlayers =
  (db: Kysely<DB>): PlayersUpdater =>
  /**
   * Updates information for multiple players
   *
   * @param playersData - Array of player data to update
   * @returns Array of modified players
   * @throws If players not found or update fails
   */
  async (playersData) => {
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

        if (missingPlayers.length > 0) {
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

    const mappedOutput = repositoryResponse.map((player) => {
      return {
        id: player.id,
        userId: player.user_id,
        gameId: player.game_id,
        teamId: player.team_id,
        statusId: player.status_id,
        publicName: player.public_name,
      };
    });

    return mappedOutput;
  };
