import { UnexpectedLobbyError } from "../errors/lobby.errors";
import { GameRepository } from "@backend/common/data-access/games.repository";
import { PlayerRepository } from "@backend/common/data-access/players.repository";

export type PlayerResult = {};

export type PlayerUpdateData = {
  playerId: number;
  playerName?: string;
  teamId?: string;
}[];

export interface ModifyPlayersService {
  updatePlayers: (playersToModify: PlayerUpdateData) => Promise<PlayerResult[]>;
}

export interface Dependencies {
  playerRepository: PlayerRepository;
  gameRepository: GameRepository;
}

// Service factory
export const create = (): ModifyPlayersService => {
  // Service method
  const updatePlayers = async (
    playersToModify: PlayerUpdateData,
  ): Promise<PlayerResult[]> => {
    return [];
  };

  return {
    updatePlayers,
  };
};
