import { PanelSlots } from "./types";
import {
  hasRole,
  isCodemaster,
  isCodebreakerGuessing,
  isObserving,
  isRoundInProgress,
  isRoundComplete,
  isInLobby,
  isCodemasterGivingClue,
} from "./rules";
import {
  TeamHeaderPanel,
  ARTogglePanel,
  IntelPanel,
  ObserverPanel,
  AIStatusPanel,
  CodemasterActionsPanel,
  CodebreakerActionsPanel,
  LobbyActionsPanel,
  GameoverPanel,
} from "../panels";

/**
 * Panel configuration - reads like requirements.
 * "AR toggle shows when isCodemaster"
 * "Intel shows when isCodebreakerGuessing"
 */
export const GAME_PANELS: PanelSlots = {
  header: [
    { id: "team-header", component: TeamHeaderPanel, shouldRender: hasRole },
  ],

  middle: [
    { id: "ar-toggle", component: ARTogglePanel, shouldRender: isCodemaster },
    { id: "intel", component: IntelPanel, shouldRender: isCodebreakerGuessing },
    { id: "observer", component: ObserverPanel, shouldRender: isObserving },
    { id: "ai-status", component: AIStatusPanel, shouldRender: isRoundInProgress },
    { id: "gameover", component: GameoverPanel, shouldRender: isRoundComplete },
  ],

  bottom: [
    { id: "lobby-actions", component: LobbyActionsPanel, shouldRender: isInLobby },
    { id: "codemaster-actions", component: CodemasterActionsPanel, shouldRender: isCodemasterGivingClue },
    { id: "codebreaker-actions", component: CodebreakerActionsPanel, shouldRender: isCodebreakerGuessing },
  ],
};
