import { 
  createGetPlayersController, 
  GetPlayersDependencies,
  GetPlayersController 
} from "./get-players.controller";
import { 
  createGetPlayersService, 
  GetPlayersServiceDependencies 
} from "./get-players.service";

/**
 * Complete dependencies for the get-players module
 */
export type GetPlayersModuleDependencies = GetPlayersServiceDependencies;

/**
 * Module exports
 */
export type GetPlayersModule = {
  controller: GetPlayersController;
};

/**
 * Creates and configures the complete get-players module
 */
export const createGetPlayersModule = (
  deps: GetPlayersModuleDependencies,
): GetPlayersModule => {
  const getPlayersService = createGetPlayersService(deps);
  const controller = createGetPlayersController({ getPlayersService });

  return {
    controller,
  };
};

// Default export using the pattern from other modules
export default createGetPlayersModule;