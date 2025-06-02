import { UnexpectedLobbyError } from "../errors/lobby.errors";
import {
  PublicId,
  GameFinder,
} from "@backend/common/data-access/games.repository";
import { PlayersCreator } from "@backend/common/data-access/players.repository";
import { TeamNameMapper } from "@backend/common/data-access/teams.repository";

/** Represents the result of a player addition operation */
export type PlayerResult = {
  publicId: string;
  playerName: string;
  username?: string;
  teamName: string;
  statusId: number;
};

/** Data structure for adding player information */
export type PlayerAddData = {
  playerName: string;
  teamName: string;
}[];

/** Service response including game context */
export type AddPlayersServiceResult = {
  players: PlayerResult[];
  gamePublicId: string;
};

/** Required dependencies for creating the AddPlayersService */
export type ServiceDependencies = {
  addPlayers: PlayersCreator;
  getGameByPublicId: GameFinder<PublicId>;
  getTeamNameToIdMap: TeamNameMapper;
};

/** Creates an implementation of the add players service */
export const addPlayersService = (dependencies: ServiceDependencies) => {
  /**
   * Adds players to a game
   * @param publicGameId - Public identifier of the game
   * @param userId - ID of the user adding players
   * @param playersToAdd - Players to be added
   * @returns Added player details and game context
   */
  const addPlayers = async (
    publicGameId: string,
    userId: number,
    playersToAdd: PlayerAddData,
  ): Promise<AddPlayersServiceResult> => {
    if (!playersToAdd.length) {
      return { players: [], gamePublicId: publicGameId };
    }

    const game = await dependencies.getGameByPublicId(publicGameId);
    if (!game) {
      throw new UnexpectedLobbyError(
        `Game with public ID ${publicGameId} not found`,
      );
    }

    if (game.status !== "LOBBY") {
      throw new UnexpectedLobbyError(
        `Cannot add players to game in '${game.status}' state`,
      );
    }

    if (game.game_type === "MULTI_DEVICE" && playersToAdd.length > 1) {
      throw new UnexpectedLobbyError(
        "Multi-device games only allow adding one player at a time",
      );
    }

    // Get unique team names and map them to team IDs
    const uniqueTeamNames = [...new Set(playersToAdd.map((p) => p.teamName))];
    const teamNameToIdMap = await dependencies.getTeamNameToIdMap(
      game._id,
      uniqueTeamNames,
    );

    // Validate all team names exist
    const missingTeams = uniqueTeamNames.filter(
      (name) => !teamNameToIdMap.has(name),
    );

    if (missingTeams.length > 0) {
      throw new UnexpectedLobbyError(
        `Unknown team names: ${missingTeams.join(", ")}. Available teams: ${Array.from(teamNameToIdMap.keys()).join(", ")}`,
      );
    }

    // Map players with their team IDs
    const repositoryRequest = playersToAdd.map((player) => ({
      userId,
      gameId: game._id,
      teamId: teamNameToIdMap.get(player.teamName)!,
      publicName: player.playerName,
      statusId: 1,
    }));

    const newPlayers = await dependencies.addPlayers(repositoryRequest);

    return {
      players: newPlayers.map((player) => ({
        publicId: player.publicId,
        playerName: player.publicName,
        username: undefined, // Could be enriched with user data if needed
        teamName: player.teamName,
        statusId: player.statusId,
      })),
      gamePublicId: game.public_id,
    };
  };

  return addPlayers;
};
