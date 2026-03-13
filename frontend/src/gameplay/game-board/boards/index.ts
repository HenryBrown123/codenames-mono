export { SpymasterBoard } from "./spymaster-board";
export { SpectatorBoard } from "./spectator-board";
export { CodebreakerBoard } from "./codebreaker-board";
export { GameBoardLayout, EmptyCard } from "./board-layout";
export { DealingBoard, dealCardVariants } from "./dealing-board";

// todo: clean up exports.. the main export of this component folder should be: DealingBoard (with dealing functionality),
// GameplayBoard (no "dealing" functionality) .... maybe GameOverBoard might be needed if more complex orchestration....

// todo: implement GameplayBoard

// purpose: orchestrates all cards and their interactions

// context: consumer of context via providers, will need access to context + server game state via query hook

// api: think about ways of using framer motion in  the parent to control individual cards via variants... DealingBoard
//      currently uses children prop which could work I guess.... its kinda "injecting" some wrapper into the main board.

// todo: implement DealingBoard (properly) this should be a deal capable version of the board.... with all the control logic
//       and state management necessary for managing the dealing animation.
