import { useAddPlayerMutation } from "./add-player";
import { useRemovePlayerMutation } from "./remove-player";
import { useRenamePlayerMutation } from "./rename-player";
import { useMovePlayerMutation } from "./move-player";
import { useStartGameMutation } from "./start-game";

export const useLobbyMutations = (gameId: string) => {
  const addPlayer = useAddPlayerMutation(gameId);
  const removePlayer = useRemovePlayerMutation(gameId);
  const renamePlayer = useRenamePlayerMutation(gameId);
  const movePlayerToTeam = useMovePlayerMutation(gameId);
  const startGame = useStartGameMutation(gameId);

  const ops = {
    addPlayer,
    removePlayer,
    renamePlayer,
    movePlayerToTeam,
    startGame,
  };

  const isPending =
    addPlayer.isPending ||
    removePlayer.isPending ||
    renamePlayer.isPending ||
    movePlayerToTeam.isPending ||
    startGame.isPending;

  const error =
    addPlayer.error?.message ||
    removePlayer.error?.message ||
    renamePlayer.error?.message ||
    movePlayerToTeam.error?.message ||
    startGame.error?.message;

  return { ops, isPending, error };
};
