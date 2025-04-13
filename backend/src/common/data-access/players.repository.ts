import { Kysely, DeleteResult } from "kysely";
import { DB } from "../db/db.types";
import { UnexpectedLobbyError } from "@backend/features/lobby/errors/lobby.errors";

/**
 * Player entity as stored in the database
 */
export type Player = {
  id: number;
  user_id: number;
  game_id: number;
  public_name: string;
  team_id: number;
  status_id: number;
  updated_at: Date | null;
};

/**
 * Player creation or update input
 */
export interface PlayerInput {
  userId: number;
  gameId: number;
  publicName: string;
  teamId: number;
  statusId: number;
}

/**
 * Repository interface for player operations
 */
export interface PlayerRepository {
  addPlayers: (playersData: PlayerInput[]) => Promise<Player[]>;
  removePlayer: (playerId: number) => Promise<DeleteResult>;
  getPlayersByGameId: (gameId: number) => Promise<Player[]>;
  getPlayerById: (playerId: number) => Promise<Player | null>;
  getPlayersByTeam: (gameId: number, teamId: number) => Promise<Player[]>;
}

/**
 * Dependencies required by the player repository
 */
export interface Dependencies {
  db: Kysely<DB>;
}

/**
 * Create a repository instance for player operations
 */
export const create = ({ db }: Dependencies): PlayerRepository => {
  /**
   * Removes player from game
   * @param playerId PlayerId to remove
   * @returns Deleted player
   */
  const removePlayer = async (playerId: number) => {
    const removedPlayer = await db
      .deleteFrom("players")
      .where("players.id", "=", playerId)
      .executeTakeFirstOrThrow();

    return removedPlayer;
  };
  /**
   * Adds one or more players to a game
   * @param playersData Array of player data
   * @returns Array of created players
   */
  const addPlayers = async (playersData: PlayerInput[]) => {
    if (!playersData.length) {
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
      .returning([
        "id",
        "user_id",
        "game_id",
        "team_id",
        "status_id",
        "public_name",
        "updated_at",
      ])
      .execute();

    // at this point the only acceptable outcome is for players to be created.. therefore throw
    // error if this is not the case. executeTakeFirstOrThrow() not used as this function should
    // return an array of data...
    // Actual DB errors will bubble up to error handlers.
    if (!newPlayers.length) {
      throw new UnexpectedLobbyError(
        "Failed to create players. Empty response from inserts.",
      );
    }

    return newPlayers;
  };

  /**
   * Gets all players for a specific game
   * @param gameId The game ID
   * @returns Array of players
   */
  const getPlayersByGameId = async (gameId: number) => {
    const players = await db
      .selectFrom("players")
      .where("game_id", "=", gameId)
      .select([
        "id",
        "user_id",
        "game_id",
        "team_id",
        "status_id",
        "public_name", // Changed from playerName
        "status_last_changed",
        "updated_at",
      ])
      .execute();

    return players || [];
  };

  /**
   * Gets players by team in a specific game
   * @param gameId The game ID
   * @param teamId The team ID
   * @returns Array of players
   */
  const getPlayersByTeam = async (gameId: number, teamId: number) => {
    const players = await db
      .selectFrom("players")
      .where("game_id", "=", gameId)
      .where("team_id", "=", teamId)
      .select([
        "id",
        "user_id",
        "game_id",
        "team_id",
        "status_id",
        "public_name",
        "status_last_changed",
        "updated_at",
      ])
      .execute();

    return players || [];
  };

  /**
   * Gets a player by ID
   * @param playerId The player ID
   * @returns The player or null if not found
   */
  const getPlayerById = async (playerId: number) => {
    const player = await db
      .selectFrom("players")
      .where("id", "=", playerId)
      .select([
        "id",
        "user_id",
        "game_id",
        "team_id",
        "status_id",
        "public_name",
        "status_last_changed",
        "updated_at",
      ])
      .executeTakeFirst();

    return player || null;
  };

  return {
    addPlayers,
    removePlayer,
    getPlayersByGameId,
    getPlayerById,
    getPlayersByTeam,
  };
};
