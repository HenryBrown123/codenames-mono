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
  isObserving,
  isRoundInProgress,
  isRoundComplete,
  isInLobby,
  isCodemasterGivingClue,
} from "../gameplay/game-controls/dashboards/config/rules";
import {
  TeamHeaderPanel,
  ARTogglePanel,
  IntelPanel,
  ObserverPanel,
  CodemasterActionsPanel,
  CodebreakerActionsPanel,
  LobbyActionsPanel,
  GameoverPanel,
} from "../gameplay/game-controls/dashboards/panels";
import { SandboxAIStatusPanel } from "./sandbox-panels";

/**
 * Sandbox panel configuration - uses mock data panels where needed.
 */
export const SANDBOX_PANELS: PanelSlots = {
  header: [
    { id: "team-header", component: TeamHeaderPanel, shouldRender: hasRole },
  ],

  middle: [
    { id: "ar-toggle", component: ARTogglePanel, shouldRender: isCodemaster },
    { id: "intel", component: IntelPanel, shouldRender: isCodebreakerGuessing },
    { id: "observer", component: ObserverPanel, shouldRender: isObserving },
    { id: "ai-status", component: SandboxAIStatusPanel, shouldRender: isRoundInProgress },
    { id: "gameover", component: GameoverPanel, shouldRender: isRoundComplete },
  ],

  bottom: [
    { id: "lobby-actions", component: LobbyActionsPanel, shouldRender: isInLobby },
    { id: "codemaster-actions", component: CodemasterActionsPanel, shouldRender: isCodemasterGivingClue },
    { id: "codebreaker-actions", component: CodebreakerActionsPanel, shouldRender: isCodebreakerGuessing },
  ],
};
