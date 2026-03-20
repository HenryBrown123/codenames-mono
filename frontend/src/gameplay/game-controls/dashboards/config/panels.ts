import { PanelSlots } from "./types";
import {
  hasRole,
  isCodemaster,
  isCodebreakerGuessing,
  isRoundComplete,
  isInLobby,
  isAiActive,
  isRoundActive,
  canStartNextTurn,
} from "./rules";
import {
  TeamHeaderPanel,
  ARTogglePanel,
  IntelPanel,
  AIStatusPanel,
  CodebreakerActionsPanel,
  LobbyActionsPanel,
  GameoverPanel,
  NextTurnPanel,
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
    { id: "lobby-actions", component: LobbyActionsPanel, shouldRender: isInLobby },
    { id: "intel", component: IntelPanel, shouldRender: isRoundActive },
    { id: "next-turn", component: NextTurnPanel, shouldRender: canStartNextTurn },
    { id: "ar-toggle", component: ARTogglePanel, shouldRender: isCodemaster },
    { id: "ai-status", component: AIStatusPanel, shouldRender: isAiActive },
    { id: "gameover", component: GameoverPanel, shouldRender: isRoundComplete },
  ],

  bottom: [
    {
      id: "codebreaker-actions",
      component: CodebreakerActionsPanel,
      shouldRender: isCodebreakerGuessing,
    },
  ],
};

/**
 * Panel config for mobile portrait drawer.
 * No header slot — TeamHeaderPanel is rendered by the drawer chrome instead.
 */
export const MOBILE_DRAWER_PANELS: PanelSlots = {
  header: [],   // suppressed — drawer chrome owns the header
  middle: GAME_PANELS.middle,
  bottom: GAME_PANELS.bottom,
};
