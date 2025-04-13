// src/common/data-access/teams.repository.ts
import { Kysely } from "kysely";
import { DB } from "../db/db.types";

export interface TeamRepository {
  createTeams: (gameId: number, teamNames: string[]) => Promise<Team[]>;
  getTeamsByGameId: (gameId: number) => Promise<Team[]>;
}

export type Team = {
  id: number;
  game_id: number;
  team_name: string;
};

export interface Dependencies {
  db: Kysely<DB>;
}

export const create = ({ db }: Dependencies): TeamRepository => {
  const createTeams = async (gameId: number, teamNames: string[]) => {
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

  const getTeamsByGameId = async (gameId: number) => {
    const teams = await db
      .selectFrom("teams")
      .where("game_id", "=", gameId)
      .select(["id", "game_id", "team_name"])
      .execute();

    return teams;
  };

  return {
    createTeams,
    getTeamsByGameId,
  };
};
