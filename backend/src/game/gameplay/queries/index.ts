import type { GameplayStateProvider } from "@backend/game/gameplay/state/gameplay-state.provider";
import type { GameDataLoader } from "@backend/game/gameplay/state/game-data-loader";
import type { TurnStateProvider } from "@backend/game/gameplay/state/turn-state.provider";
import type { TurnsFinder, RoundId } from "@backend/common/data-access/repositories/turns.repository";
import type { PlayerFinderAll, RoundId as PlayerRoundId } from "@backend/common/data-access/repositories/players.repository";
import type { DbContext } from "@backend/common/data-access/transaction-handler";
import type { AppLogger } from "@backend/common/logging";

import * as gameEventsRepository from "@backend/common/data-access/repositories/game-events.repository";

import { getGameStateService } from "./get-game.service";
import { getGameStateController } from "./get-game.controller";
import { createGetPlayersService } from "./get-players.service";
import { createGetPlayersController } from "./get-players.controller";
import { getEventsService } from "./get-events.service";
import { getEventsController } from "./get-events.controller";
import { getTurnService } from "./get-turn.service";
import { controller as getTurnControllerFactory } from "./get-turn.controller";

export interface QueriesDependencies {
  getGameState: GameplayStateProvider;
  loadGameData: GameDataLoader;
  getTurnState: TurnStateProvider;
  getTurnsByRoundId: TurnsFinder<RoundId>;
  findPlayersByRoundId: PlayerFinderAll<PlayerRoundId>;
  db: DbContext;
}

export const createQueries = (logger: AppLogger) => (deps: QueriesDependencies) => {
  /** Get game */
  const getGameService = getGameStateService(
    logger.for({ service: "get-game" }).create(),
  )({
    getGameState: deps.getGameState,
    loadGameData: deps.loadGameData,
  });
  const getGameController = getGameStateController({ getGameState: getGameService });

  /** Get players */
  const playersService = createGetPlayersService({ getGameState: deps.getGameState });
  const getPlayersController = createGetPlayersController(
    logger.for({ service: "get-players" }).create(),
  )({ getPlayersService: playersService });

  /** Get events */
  const eventsService = getEventsService(logger)({
    getEventsByGameId: gameEventsRepository.getEventsByGameId(deps.db),
    getGameState: deps.getGameState,
  });
  const eventsController = getEventsController({ getEvents: eventsService });

  /** Get turn */
  const turnService = getTurnService({
    getTurnState: deps.getTurnState,
    getTurnsByRoundId: deps.getTurnsByRoundId,
    findPlayersByRoundId: deps.findPlayersByRoundId,
  });
  const getTurnController = getTurnControllerFactory(
    logger.for({ service: "get-turn" }).create(),
  )(turnService);

  return {
    controllers: {
      getGame: getGameController,
      getPlayers: getPlayersController,
      getEvents: eventsController,
      getTurn: getTurnController,
    },
  };
};
