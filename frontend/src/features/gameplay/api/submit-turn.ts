import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";
import { GameState } from "@frontend/shared-types/game-types";

type SubmitTurnResponse = {
  success: boolean;
  game: { state: GameState };
};

const submitTurn = async (
  id: string,
  gameState: GameState,
): Promise<GameState> => {
  const response: AxiosResponse<SubmitTurnResponse> = await api.post(
    `/games/${id}/turn`,
    gameState,
  );
  return response.data.game.state;
};

export default submitTurn;
