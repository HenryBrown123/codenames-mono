/**
 * Sandbox Panel Configuration
 *
 * Same as the main GAME_PANELS config but swaps out
 * components that need API access for sandbox versions.
 */

import { PanelSlots } from "../gameplay/game-controls/dashboards/config/types";
import {
  hasRole,
  isCodemaster,
  isCodebreakerGuessing,
  isRoundInProgress,
  isRoundComplete,
  isInLobby,
} from "../gameplay/game-controls/dashboards/config/rules";
import {
  TeamHeaderPanel,
  ARTogglePanel,
  CodebreakerActionsPanel,
  LobbyActionsPanel,
  GameoverPanel,
} from "../gameplay/game-controls/dashboards/panels";
import { SandboxAIStatusPanel, SandboxIntelPanel } from "./sandbox-panels";

/**
 * Sandbox panel configuration - uses mock data panels where needed.
 * Intel panel shows for all views when round is in progress.
 * Note: Codemaster input is now integrated into the Intel panel.
 */
export const SANDBOX_PANELS: PanelSlots = {
  header: [{ id: "team-header", component: TeamHeaderPanel, shouldRender: hasRole }],

  middle: [
    { id: "intel", component: SandboxIntelPanel, shouldRender: isRoundInProgress },
    { id: "ar-toggle", component: ARTogglePanel, shouldRender: isCodemaster },
    { id: "ai-status", component: SandboxAIStatusPanel, shouldRender: isRoundInProgress },
    { id: "gameover", component: GameoverPanel, shouldRender: isRoundComplete },
  ],

  bottom: [
    { id: "lobby-actions", component: LobbyActionsPanel, shouldRender: isInLobby },
    { id: "codebreaker-actions", component: CodebreakerActionsPanel, shouldRender: isCodebreakerGuessing },
  ],
};
