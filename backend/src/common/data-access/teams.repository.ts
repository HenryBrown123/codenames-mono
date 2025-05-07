import { Kysely } from "kysely";
import { DB } from "../db/db.types";

/** Repository function types */
export type CreateTeamsFn = (input: TeamsInput) => Promise<TeamResult[]>;
export type GetTeamsByGameIdFn = (gameId: number) => Promise<TeamResult[]>;

/** Data types */
export type TeamsInput = {
  gameId: number;
  teamNames: string[];
};

export type TeamResult = {
  id: number;
  game_id: number;
  team_name: string;
};

/** Represents a team in the database */
export type Team = {
  id: number;
  game_id: number;
  team_name: string;
};

/** Input for creating teams */
export type TeamInput = {
  gameId: number;
  teamNames: string[];
};

/** Creates teams for a specific game */
export const createTeams =
  (db: Kysely<DB>) =>
  /**
   * Inserts new teams into the database
   * @param input - Teams creation input data
   * @returns Created team records
   */
  async ({ gameId, teamNames }: TeamInput): Promise<Team[]> => {
    const values = teamNames.map((name) => ({
      game_id: gameId,
      team_name: name,
    }));

    const teams = await db
      .insertInto("teams")
      .values(values)
      .returning(["id", "game_id", "team_name"])
      .execute();

    return teams;
  };

/** Retrieves teams for a specific game */
export const getTeamsByGameId =
  (db: Kysely<DB>) =>
  /**
   * Fetches teams for a given game
   * @param gameId - The ID of the game to fetch teams for
   * @returns List of teams in the specified game
   */
  async (gameId: number): Promise<Team[]> => {
    const teams = await db
      .selectFrom("teams")
      .where("game_id", "=", gameId)
      .select(["id", "game_id", "team_name"])
      .execute();

    return teams;
  };
