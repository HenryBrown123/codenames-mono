import { PanelSlots } from "./types";
import {
  hasRole,
  isCodemaster,
  isCodebreakerGuessing,
  isRoundComplete,
  isInLobby,
  isAiActive,
  isRoundInProgress,
} from "./rules";
import {
  TeamHeaderPanel,
  ARTogglePanel,
  IntelPanel,
  AIStatusPanel,
  CodebreakerActionsPanel,
  LobbyActionsPanel,
  GameoverPanel,
} from "../panels";

/**
 * Panel configuration - reads like requirements.
 * "AR toggle shows when isCodemaster"
 * "Intel shows when round is in progress (always visible during gameplay)"
 * Note: Codemaster input is now integrated into the Intel panel
 */
export const GAME_PANELS: PanelSlots = {
  header: [{ id: "team-header", component: TeamHeaderPanel, shouldRender: hasRole }],

  middle: [
    { id: "intel", component: IntelPanel, shouldRender: isRoundInProgress },
    { id: "ar-toggle", component: ARTogglePanel, shouldRender: isCodemaster },
    { id: "ai-status", component: AIStatusPanel, shouldRender: isAiActive },
    { id: "gameover", component: GameoverPanel, shouldRender: isRoundComplete },
  ],

  bottom: [
    { id: "lobby-actions", component: LobbyActionsPanel, shouldRender: isInLobby },
    {
      id: "codebreaker-actions",
      component: CodebreakerActionsPanel,
      shouldRender: isCodebreakerGuessing,
    },
  ],
};
