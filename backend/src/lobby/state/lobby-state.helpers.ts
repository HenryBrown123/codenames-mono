import { LobbyAggregate } from "./lobby-state.types";

export const lobbyHelpers = {
  getTotalPlayerCount(lobby: LobbyAggregate): number {
    return lobby.teams.reduce((total, team) => total + team.players.length, 0);
  },

  getTeamPlayerCounts(lobby: LobbyAggregate): number[] {
    return lobby.teams.map((team) => team.players.length);
  },

  getUserPlayer(
    lobby: LobbyAggregate,
  ): LobbyAggregate["teams"][0]["players"][0] | null {
    for (const team of lobby.teams) {
      const userPlayer = team.players.find(
        (player) => player._userId === lobby.userContext._userId,
      );
      if (userPlayer) return userPlayer;
    }
    return null;
  },

  getPlayerByPublicId(
    lobby: LobbyAggregate,
    publicId: string,
  ): LobbyAggregate["teams"][0]["players"][0] | null {
    for (const team of lobby.teams) {
      const player = team.players.find(
        (player) => player.publicId === publicId,
      );
      if (player) return player;
    }
    return null;
  },

  isPlayerOwner(lobby: LobbyAggregate, playerId: string): boolean {
    const player = this.getPlayerByPublicId(lobby, playerId);
    return player?._userId === lobby.userContext._userId;
  },

  getTeamNameToIdMap(lobby: LobbyAggregate): Map<string, number> {
    const teamMap = new Map<string, number>();
    lobby.teams.forEach((team) => {
      teamMap.set(team.teamName, team._id);
    });
    return teamMap;
  },

  getAvailableTeamNames(lobby: LobbyAggregate): string[] {
    return lobby.teams.map((team) => team.teamName);
  },
};
