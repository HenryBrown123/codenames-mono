import React, { useEffect } from "react";
import { useLobbyQuery } from "@frontend/lobby/api";
import { SingleDeviceLobby } from "./single-device-lobby";
import { MultiDeviceLobby } from "./multi-device-lobby";

interface LobbySceneProps {
  gameId: string;
  onStart: () => void;
  onLoading: (loading: boolean) => void;
}

export const LobbyScene: React.FC<LobbySceneProps> = ({
  gameId,
  onStart,
  onLoading,
}) => {
  const { data: lobbyData, isLoading } = useLobbyQuery(gameId);

  useEffect(() => {
    onLoading(isLoading || !lobbyData);
  }, [isLoading, lobbyData, onLoading]);

  if (isLoading || !lobbyData) {
    return null; // PreGameFlow shows loading dot
  }

  if (lobbyData.gameType === "MULTI_DEVICE") {
    return <MultiDeviceLobby gameId={gameId} onStart={onStart} />;
  }

  return <SingleDeviceLobby gameId={gameId} lobbyData={lobbyData} onStart={onStart} />;
};
