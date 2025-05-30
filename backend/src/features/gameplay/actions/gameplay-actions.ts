// backend/src/features/gameplay/actions/gameplay-actions.ts
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

export type CommonActions = {
  createNextRound: ReturnType<typeof createNextRound>;
  dealCards: ReturnType<typeof dealCardsToRound>;
  startRound: ReturnType<typeof startCurrentRound>;
};

export type CodemasterActions = CommonActions & {
  // giveClue: ReturnType<typeof giveClue>;
};

export type CodebreakerActions = CommonActions & {
  // makeGuess: ReturnType<typeof makeGuess>;
  // endTurn: ReturnType<typeof endTurn>;
};

export type SpectatorActions = {
  // Read-only actions only
};

export type GameplayExecutor<TActions> = <TResult>(
  operation: (actions: TActions) => Promise<TResult>,
) => Promise<TResult>;

/**
 * Creates player-specific actions with injected repository dependencies
 */
const createPlayerActions =
  (repos: GameplayRepositories) => (role: PlayerRole, trx: Kysely<DB>) => {
    /**
     * Common actions available to active players (not spectators)
     */
    const buildCommonActions = {
      createNextRound: createNextRound(repos.createRound(trx)),
      dealCards: dealCardsToRound(
        repos.getRandomWords(trx),
        repos.createCards(trx),
      ),
      startRound: startCurrentRound(repos.updateRoundStatus(trx)),
    };

    /**
     * Role-specific action builders
     */
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

export const gameplayActions = (
  db: Kysely<DB>,
  repos: GameplayRepositories,
) => {
  const actionsBuilder = createPlayerActions(repos);

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
