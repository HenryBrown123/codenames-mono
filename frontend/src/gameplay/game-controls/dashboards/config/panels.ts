import { PanelSlots } from "./types";
import {
  hasRole,
  isCodemaster,
  isCodemasterGivingClue,
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
  ClueInputPanel,
  CodebreakerActionsPanel,
  LobbyActionsPanel,
  GameoverPanel,
  StartTurnPanel,
} from "../panels";

/**
 * Panel configuration - reads like requirements.
 * "AR toggle shows when isCodemaster"
 * "Intel shows when round is in progress (always visible during gameplay)"
 * "Clue input shows as its own panel when codemaster needs to give a clue"
 */
export const GAME_PANELS: PanelSlots = {
  header: [{ id: "team-header", component: TeamHeaderPanel, shouldRender: hasRole }],

  middle: [
    { id: "intel", component: IntelPanel, shouldRender: isRoundActive },
    { id: "clue-input", component: ClueInputPanel, shouldRender: isCodemasterGivingClue },
    { id: "ar-toggle", component: ARTogglePanel, shouldRender: (ctx) => isCodemaster(ctx) && !isRoundComplete(ctx) },
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
    {
      id: "start-turn",
      component: StartTurnPanel,
      shouldRender: canStartNextTurn,
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
