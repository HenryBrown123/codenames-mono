import { Kysely } from "kysely";
import { DB } from "../db/db.types";

/**
 * ==================
 * REPOSITORY TYPES
 * ==================
 */

/** A unique identifier for a team */
export type TeamId = number;

/** A unique identifier for a game */
export type GameId = number;

/** Parameters for creating teams */
export type TeamsInput = {
  gameId: number;
  teamNames: string[];
};

/** Standardized team data returned from repository */
export type TeamResult = {
  _id: number;
  _gameId: number;
  teamName: string;
};

/** Function that finds teams by game ID */
export type TeamsFinder<T extends GameId> = (
  identifier: T,
) => Promise<TeamResult[]>;

/** Function that creates multiple teams */
export type TeamsCreator = (input: TeamsInput) => Promise<TeamResult[]>;

/**
 * ==================
 * REPOSITORY FUNCTIONS
 * ==================
 */

/**
 * Creates a function for creating teams for a game
 */
export const createTeams =
  (db: Kysely<DB>): TeamsCreator =>
  async ({ gameId, teamNames }) => {
    const values = teamNames.map((name) => ({
      game_id: gameId,
      team_name: name,
    }));

    const teams = await db
      .insertInto("teams")
      .values(values)
      .returning(["id", "game_id", "team_name"])
      .execute();

    return teams
      ? teams.map((team) => ({
          _id: team.id,
          _gameId: team.game_id,
          teamName: team.team_name,
        }))
      : [];
  };

/**
 * Creates a function for retrieving teams by game ID
 */
export const getTeamsByGameId =
  (db: Kysely<DB>): TeamsFinder<GameId> =>
  async (gameId) => {
    const teams = await db
      .selectFrom("teams")
      .where("game_id", "=", gameId)
      .select(["id", "game_id", "team_name"])
      .execute();

    return teams
      ? teams.map((team) => ({
          _id: team.id,
          _gameId: team.game_id,
          teamName: team.team_name,
        }))
      : [];
  };
