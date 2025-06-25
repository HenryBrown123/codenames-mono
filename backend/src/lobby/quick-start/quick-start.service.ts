// lobby/quick-start/quick-start.service.ts
import type { LobbyOperations } from "../lobby-actions";
import type { LobbyStateProvider } from "../state/lobby-state.provider";
import { GAME_STATE, ROUND_STATE } from "@codenames/shared/types";
import { TransactionalHandler } from "@backend/common/data-access/transaction-handler";

// Import validation rules
import { validate as validateQuickStart } from "./quick-start.rules";
import { validate as validateNewRound } from "../new-round/new-round.rules";
import { validate as validateDealCards } from "../deal-cards/deal-cards.rules";
import { validate as validateAssignRoles } from "../assign-roles/assign-roles.rules";
import { validate as validateStartRound } from "../start-round/start-round.rules";
import { UnexpectedLobbyError } from "../errors/lobby.errors";

export type QuickStartSuccess = {
 success: true;
 gameId: number;
 publicId: string;
 roundId: number;
 turnId: number | null;
 status: string;
};

export type QuickStartError = {
 success: false;
 error: string;
};

export type QuickStartResult = QuickStartSuccess | QuickStartError;

export type ServiceDependencies = {
 lobbyHandler: TransactionalHandler<LobbyOperations>;
 getLobbyState: LobbyStateProvider;
};

export const quickStartService = (dependencies: ServiceDependencies) => {
 const quickStart = async (
   publicGameId: string,
   userId: number
 ): Promise<QuickStartResult> => {
   const initialLobby = await dependencies.getLobbyState(publicGameId, userId);
   if (!initialLobby) {
     return {
       success: false,
       error: `Game with public ID ${publicGameId} not found`,
     };
   }

   const quickStartValidation = validateQuickStart(initialLobby);
   if (!quickStartValidation.valid) {
     return {
       success: false,
       error: quickStartValidation.errors[0].message,
     };
   }

     return await dependencies.lobbyHandler(async (lobbyOps) => {
       const updatedGame = await lobbyOps.updateGameStatus(
         initialLobby._id,
         GAME_STATE.IN_PROGRESS,
       );

       if (updatedGame.status !== GAME_STATE.IN_PROGRESS) {
         throw new UnexpectedLobbyError(
           `Failed to start game. Expected status '${GAME_STATE.IN_PROGRESS}', got '${updatedGame.status}'`,
         );
       }

       let currentState = await lobbyOps.getLobbyState(publicGameId, userId);
       if (!currentState) {
         throw new UnexpectedLobbyError("Failed to get lobby state after game start");
       }

       const roundValidation = validateNewRound(currentState);
       if (!roundValidation.valid) {
         throw new UnexpectedLobbyError(`Cannot create round: ${roundValidation.errors[0].message}`);
       }
       
       await lobbyOps.createRound(roundValidation.data);

       currentState = await lobbyOps.getLobbyState(publicGameId, userId);
       if (!currentState) {
         throw new UnexpectedLobbyError("Failed to get lobby state after round creation");
       }

       const dealValidation = validateDealCards(currentState);
       if (!dealValidation.valid) {
         throw new UnexpectedLobbyError(`Cannot deal cards: ${dealValidation.errors[0].message}`);
       }
       
       await lobbyOps.dealCards(dealValidation.data);

       // Step 4: Get fresh state and assign roles
       currentState = await lobbyOps.getLobbyState(publicGameId, userId);
       if (!currentState) {
         throw new UnexpectedLobbyError("Failed to get lobby state after dealing cards");
       }

       const roleValidation = validateAssignRoles(currentState);
       if (!roleValidation.valid) {
         throw new UnexpectedLobbyError(`Cannot assign roles: ${roleValidation.errors[0].message}`);
       }
       
       await lobbyOps.assignPlayerRoles(roleValidation.data);

       currentState = await lobbyOps.getLobbyState(publicGameId, userId);
       if (!currentState) {
         throw new UnexpectedLobbyError("Failed to get lobby state after role assignment");
       }

       const startValidation = validateStartRound(currentState);
       if (!startValidation.valid) {
         throw new UnexpectedLobbyError(`Cannot start round: ${startValidation.errors[0].message}`);
       }
       
       await lobbyOps.startRound(startValidation.data);

       currentState = await lobbyOps.getLobbyState(publicGameId, userId);

       if (currentState.currentRound?.status !== ROUND_STATE.IN_PROGRESS) {
         throw new UnexpectedLobbyError(
           `Failed to start round. Expected status '${ROUND_STATE.IN_PROGRESS}', got '${currentState.currentRound?.status}'`,
         )}

       return {
         success: true,
         gameId: currentState._id,
         publicId: currentState.public_id,
         roundId: currentState.currentRound._id,
         turnId: null,
         status: currentState.status,
       };
     });
 };

 return quickStart;
};