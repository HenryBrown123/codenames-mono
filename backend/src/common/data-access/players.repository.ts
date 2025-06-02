import { Kysely, Selectable, sql } from "kysely";
import { DB, Players } from "../db/db.types";
import { UnexpectedRepositoryError } from "./repository.errors";
import { PLAYER_ROLE, PlayerRole } from "@codenames/shared/types";
import { randomUUID } from "crypto";

/**
 * ==================
 * COMMON TYPES
 * ==================
 */

/** Domain-specific identifier types */
export type PlayerId = number;
export type PublicPlayerId = string;
export type UserId = number;
export type GameId = number;
export type TeamId = number;
export type RoundId = number;

/** Common result type shared by repository functions */
export type PlayerResult = {
  _id: number;
  publicId: string;
  _userId: number;
  _gameId: number;
  _teamId: number;
  teamName: string;
  statusId: number;
  publicName: string;
};

/** Player context type containing additional user data and role information */
export type PlayerContext = {
  _userId: number;
  _playerId: number;
  _teamId: number;
  username: string;
  playerName: string;
  teamName: string;
  role: PlayerRole;
};

/** Columns to use for PlayerResult type */
const playerResultColumns = [
  "id",
  "public_id",
  "user_id",
  "game_id",
  "team_id",
  "status_id",
  "public_name",
  "updated_at",
  "status_last_changed",
] as const;

/** Repository function type for finding all players for a game or user */
export type PlayerFinderAll<T extends GameId | UserId> = (
  identifier: T,
) => Promise<PlayerResult[]>;

/** Repository function type for finding a player by ID */
export type PlayerFinder<T extends PlayerId | PublicPlayerId> = (
  identifier: T,
) => Promise<PlayerResult | null>;

/** Repository function type for finding player context */
export type PlayerContextFinder = (
  gameId: GameId,
  userId: UserId,
  roundId: RoundId,
) => Promise<PlayerContext | null>;

// SQL expression for team name lookup - kept simple and contained
const teamNameLookup =
  sql<string>`(SELECT team_name FROM teams WHERE teams.id = players.team_id)`.as(
    "team_name",
  );

/**
 * ==================
 * FIND PLAYER BY ID
 * ==================
 */

/**
 * Creates a function for finding a player by internal ID
 *
 * @param db - Database connection
 */
export const findPlayerById =
  (db: Kysely<DB>): PlayerFinder<PlayerId> =>
  /**
   * Retrieves player data using its internal ID
   *
   * @param playerId - The player's internal ID
   * @returns Player data if found, null otherwise
   */
  async (playerId) => {
    const player = await db
      .selectFrom("players")
      .innerJoin("teams", "players.team_id", "teams.id")
      .where("players.id", "=", playerId)
      .select(playerResultColumns)
      .select(["teams.team_name"])
      .executeTakeFirst();

    return player
      ? {
          _id: player.id,
          publicId: player.public_id,
          _userId: player.user_id,
          _gameId: player.game_id,
          _teamId: player.team_id,
          teamName: player.team_name,
          statusId: player.status_id,
          publicName: player.public_name,
        }
      : null;
  };

/**
 * Creates a function for finding a player by public ID
 *
 * @param db - Database connection
 */
export const findPlayerByPublicId =
  (db: Kysely<DB>): PlayerFinder<PublicPlayerId> =>
  /**
   * Retrieves player data using its public UUID
   *
   * @param publicPlayerId - The player's public UUID
   * @returns Player data if found, null otherwise
   */
  async (publicPlayerId) => {
    const player = await db
      .selectFrom("players")
      .innerJoin("teams", "players.team_id", "teams.id")
      .where("players.public_id", "=", publicPlayerId)
      .select(playerResultColumns)
      .select(["teams.team_name"])
      .executeTakeFirst();

    return player
      ? {
          _id: player.id,
          publicId: player.public_id,
          _userId: player.user_id,
          _gameId: player.game_id,
          _teamId: player.team_id,
          teamName: player.team_name,
          statusId: player.status_id,
          publicName: player.public_name,
        }
      : null;
  };

/**
 * ==================
 * FIND PLAYERS BY GAME ID
 * ==================
 */

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
      .select(teamNameLookup)
      .execute();

    return players.map((player) => ({
      _id: player.id,
      publicId: player.public_id,
      _userId: player.user_id,
      _gameId: player.game_id,
      _teamId: player.team_id,
      teamName: player.team_name,
      statusId: player.status_id,
      publicName: player.public_name,
    }));
  };

/**
 * Creates a function for listing players by user ID
 *
 * @param db - Database connection
 */
export const findPlayersByUserId =
  (db: Kysely<DB>): PlayerFinderAll<UserId> =>
  /**
   * Fetches all players associated with a user
   *
   * @param userId - The user ID to fetch players for
   * @returns List of players for the specified user
   */
  async (userId) => {
    const players = await db
      .selectFrom("players")
      .where("user_id", "=", userId)
      .select(playerResultColumns)
      .select(teamNameLookup)
      .execute();

    return players.map((player) => ({
      _id: player.id,
      publicId: player.public_id,
      _userId: player.user_id,
      _gameId: player.game_id,
      _teamId: player.team_id,
      teamName: player.team_name,
      statusId: player.status_id,
      publicName: player.public_name,
    }));
  };

/**
 * Creates a function for retrieving player context information
 *
 * @param db - Database connection
 */
export const getPlayerContext =
  (db: Kysely<DB>): PlayerContextFinder =>
  /**
   * Retrieves context information for a specific player in a specific round
   *
   * @param gameId - The game ID
   * @param userId - The user ID
   * @param roundId - The round ID
   * @returns Player context information or null if not found
   */
  async (gameId, userId, roundId) => {
    const playerContext = await db
      .selectFrom("players")
      .innerJoin("users", "players.user_id", "users.id")
      .innerJoin("teams", "players.team_id", "teams.id")
      .leftJoin("player_round_roles", (join) =>
        join
          .onRef("player_round_roles.player_id", "=", "players.id")
          .on("player_round_roles.round_id", "=", roundId),
      )
      .leftJoin("player_roles", "player_round_roles.role_id", "player_roles.id")
      .where("players.game_id", "=", gameId)
      .where("players.user_id", "=", userId)
      .select([
        "players.id as playerId",
        "players.user_id as userId",
        "players.team_id as teamId",
        "players.public_name as playerName",
        "users.username",
        "teams.team_name as teamName",
        "player_roles.role_name as roleName",
      ])
      .select(teamNameLookup)
      .executeTakeFirst();

    if (!playerContext) {
      return null;
    }

    // Parse role name or default to spectator
    const role = playerContext.roleName
      ? parseRoleName(playerContext.roleName)
      : PLAYER_ROLE.SPECTATOR;

    return {
      _userId: playerContext.userId,
      _playerId: playerContext.playerId,
      _teamId: playerContext.teamId,
      username: playerContext.username,
      playerName: playerContext.playerName,
      teamName: playerContext.teamName,
      role,
    };
  };

/**
 * Helper function to parse role name into PlayerRole enum
 */
function parseRoleName(roleName: string): PlayerRole {
  switch (roleName.toUpperCase()) {
    case "CODEMASTER":
      return PLAYER_ROLE.CODEMASTER;
    case "CODEBREAKER":
      return PLAYER_ROLE.CODEBREAKER;
    case "SPECTATOR":
      return PLAYER_ROLE.SPECTATOR;
    default:
      return PLAYER_ROLE.NONE;
  }
}

/**
 * ==================
 * ADD PLAYERS
 * ==================
 */

/** Input type for adding players */
export type PlayerInput = {
  userId: number;
  gameId: number;
  publicName: string;
  teamId: number;
  statusId: number;
};

/** Repository function type for creating players */
export type PlayersCreator = (
  players: PlayerInput[],
) => Promise<PlayerResult[]>;

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
      public_id: randomUUID(),
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
      .returning(teamNameLookup)
      .execute();

    if (!newPlayers.length) {
      throw new UnexpectedRepositoryError(
        "Failed to create players. Empty response from inserts.",
      );
    }

    return newPlayers.map((player) => ({
      _id: player.id,
      publicId: player.public_id,
      _userId: player.user_id,
      _gameId: player.game_id,
      _teamId: player.team_id,
      teamName: player.team_name,
      statusId: player.status_id,
      publicName: player.public_name,
    }));
  };

/**
 * ==================
 * REMOVE PLAYER
 * ==================
 */

/** Repository function type for removing a player */
export type PlayerRemover = (playerId: PlayerId) => Promise<PlayerResult>;

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
   * @param playerId - The internal ID of the player to remove
   * @returns The removed player record
   * @throws If player not found
   */
  async (playerId) => {
    const removedPlayer = await db
      .deleteFrom("players")
      .where("players.id", "=", playerId)
      .returning(playerResultColumns)
      .returning(teamNameLookup)
      .executeTakeFirstOrThrow();

    return {
      _id: removedPlayer.id,
      publicId: removedPlayer.public_id,
      _userId: removedPlayer.user_id,
      _gameId: removedPlayer.game_id,
      _teamId: removedPlayer.team_id,
      teamName: removedPlayer.team_name,
      statusId: removedPlayer.status_id,
      publicName: removedPlayer.public_name,
    };
  };

/**
 * ==================
 * MODIFY PLAYERS
 * ==================
 */

/** Input type for modifying player data */
export type ModifyPlayerInput = {
  gameId: number;
  publicPlayerId: string;
  publicName?: string;
  teamId?: number;
  userId?: number;
};

/** Repository function type for updating players */
export type PlayersUpdater = (
  updates: ModifyPlayerInput[],
) => Promise<PlayerResult[]>;

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

    // Filter to just players with updatable fields
    const playersWithUpdates = playersData.filter(
      (player) =>
        player.publicName !== undefined ||
        player.teamId !== undefined ||
        player.userId !== undefined,
    );

    const repositoryResponse = await db.transaction().execute(async (trx) => {
      const updates = playersWithUpdates.map((player) => {
        // produce object array of values with dynamic properties to prevent
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
          .where("players.public_id", "=", player.publicPlayerId)
          .where("players.game_id", "=", player.gameId)
          .executeTakeFirstOrThrow();
      });

      await Promise.all(updates);

      const allPublicPlayerIds = playersData.map(
        (player) => player.publicPlayerId,
      );

      const modifiedPlayers = await trx
        .selectFrom("players")
        .where("public_id", "in", allPublicPlayerIds)
        .select(playerResultColumns)
        .select(teamNameLookup)
        .execute();

      const missingPlayers = allPublicPlayerIds.filter(
        (publicPlayerId) =>
          !modifiedPlayers
            .map((player) => player.public_id)
            .includes(publicPlayerId),
      );

      if (missingPlayers.length > 0) {
        throw new UnexpectedRepositoryError(
          "Players could not be found to modify",
          {
            cause: {
              expected: playersWithUpdates,
              modified: modifiedPlayers.map((player) => player.public_id),
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
        _id: player.id,
        publicId: player.public_id,
        _userId: player.user_id,
        _gameId: player.game_id,
        _teamId: player.team_id,
        teamName: player.team_name,
        statusId: player.status_id,
        publicName: player.public_name,
      };
    });

    return mappedOutput;
  };
