export { LobbyHeaderView, type LobbyHeaderViewProps } from "./lobby-header";
export { StartButtonView, type StartButtonViewProps } from "./start-button";
export { TeamsGridView, TeamsGridMobileView, type TeamsGridViewProps } from "./teams-grid";
export { AddPlayerInputView, type AddPlayerInputViewProps } from "./add-player-input";

// Legacy player tile (kept for backwards compatibility)
export { PlayerTileView, type PlayerTileViewProps } from "./player-tile";

// New composition-based player tiles
export { PlayerTileBase, type PlayerTileBaseProps } from "./player-tile-base";
export { ReadOnlyPlayerTile, type ReadOnlyPlayerTileProps } from "./read-only-player-tile";
export {
  EditablePlayerTile,
  type EditablePlayerTileData,
  type EditablePlayerTileHandlers,
  type EditablePlayerTileProps,
} from "./editable-player-tile";
export {
  DraggableWrapper,
  type DraggableWrapperData,
  type DraggableWrapperHandlers,
  type DraggableWrapperProps,
} from "./draggable-wrapper";

// Team tile with Data & Handlers split
export {
  TeamTileView,
  type TeamTileData,
  type TeamTileHandlers,
  type TeamTileSlots,
  type TeamTileViewProps,
} from "./team-tile";

// Join area with Data & Handlers split
export {
  JoinAreaView,
  type JoinAreaData,
  type JoinAreaHandlers,
  type JoinAreaViewProps,
} from "./join-area";

// My team box with Data & Handlers split
export {
  MyTeamBoxView,
  type MyTeamBoxData,
  type MyTeamBoxHandlers,
  type MyTeamBoxViewProps,
} from "./my-team-box";
