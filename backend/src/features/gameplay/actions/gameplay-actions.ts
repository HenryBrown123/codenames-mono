import { Kysely } from "kysely";
import { DB } from "@backend/common/db/db.types";
import { PlayerRole, PLAYER_ROLE } from "@codenames/shared/types";

import { createNextRound } from "../new-round/new-round.actions";
import { dealCardsToRound } from "../deal-cards/deal-cards.actions";
import { startCurrentRound } from "../start-round/start-round.actions";

import type {
  RoundCreator,
  RoundStatusUpdater,
} from "@backend/common/data-access/rounds.repository";
import type {
  RandomWordsSelector,
  CardsCreator,
} from "@backend/common/data-access/cards.repository";

export type GameplayRepositories = {
  createRound: (db: Kysely<DB>) => RoundCreator;
  getRandomWords: (db: Kysely<DB>) => RandomWordsSelector;
  createCards: (db: Kysely<DB>) => CardsCreator;
  updateRoundStatus: (db: Kysely<DB>) => RoundStatusUpdater;
};

export type GameplayExecutor<TActions> = <TResult>(
  operation: (actions: TActions) => Promise<TResult>,
) => Promise<TResult>;

/**
 * Type for the actions builder function
 */
export type ActionsBuilder = (role: PlayerRole, trx: Kysely<DB>) => any;

/**
 * Creates role-based action executor with transaction support
 */
export const gameplayActions = (
  db: Kysely<DB>,
  actionsBuilder: ActionsBuilder,
) => {
  return (playerRole: PlayerRole) => {
    const execute = async <TResult>(
      operation: (actions: any) => Promise<TResult>,
    ): Promise<TResult> => {
      return await db.transaction().execute(async (trx) => {
        const actions = actionsBuilder(playerRole, trx);
        return await operation(actions);
      });
    };

    return { execute };
  };
};

/**
 * Default actions builder - can be used in production
 */
export const createPlayerActions =
  (repos: GameplayRepositories): ActionsBuilder =>
  (role: PlayerRole, trx: Kysely<DB>) => {
    const buildCommonActions = {
      createNextRound: createNextRound(repos.createRound(trx)),
      dealCards: dealCardsToRound(
        repos.getRandomWords(trx),
        repos.createCards(trx),
      ),
      startRound: startCurrentRound(repos.updateRoundStatus(trx)),
    };

    const roleActionBuilders = {
      [PLAYER_ROLE.CODEMASTER]: {
        ...buildCommonActions,
        // giveClue: giveClue(repos.createClue(trx)),
      },

      [PLAYER_ROLE.CODEBREAKER]: {
        ...buildCommonActions,
        // makeGuess: makeGuess(repos.createGuess(trx)),
        // endTurn: endTurn(repos.updateTurn(trx)),
      },

      [PLAYER_ROLE.SPECTATOR]: {
        // Read-only actions only
      },

      [PLAYER_ROLE.NONE]: {
        // Fallback - minimal actions
      },
    };

    return (
      roleActionBuilders[role] || roleActionBuilders[PLAYER_ROLE.SPECTATOR]
    );
  };
