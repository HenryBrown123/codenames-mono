import { Kysely } from "kysely";
import { DB } from "@backend/common/db/db.types";
import { TurnStateProvider } from "../state/turn-state.provider";
import { getTurnService } from "./get-turn.service";
import { controller } from "./get-turn.controller";

/**
 * Creates get-turn feature with dependencies
 */
const turnState =
  (dbContext: Kysely<DB>) => (turnStateProvider: TurnStateProvider) => {
    const turnService = getTurnService(turnStateProvider);
    const getTurnController = controller(turnService);

    return {
      service: turnService,
      controller: getTurnController,
    };
  };
