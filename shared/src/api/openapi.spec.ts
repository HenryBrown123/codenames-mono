import { createAuthPaths } from "./modules/openapi-auth";
import { createSetupPaths } from "./modules/openapi-setup";
import { createLobbyPaths } from "./modules/openapi-lobby";
import { createGameplayPaths } from "./modules/openapi-gameplay";
import { createSystemPaths } from "./modules/openapi-system";
import { createAIPaths } from "./modules/openapi-ai";

/**
 * Creates the complete OpenAPI specification by combining all modular components
 */

export function createOpenApiSpec(serverUrl = "http://localhost:3000/api") {
  const authPaths = createAuthPaths();
  const setupPaths = createSetupPaths();
  const lobbyPaths = createLobbyPaths();
  const gameplayPaths = createGameplayPaths();
  const systemPaths = createSystemPaths();
  const aiPaths = createAIPaths();

  return {
    openapi: "3.0.0",
    info: {
      title: "Codenames Game API",
      description: "API for interacting with the Codenames game server",
      version: "1.0.0",
    },
    servers: [
      {
        url: serverUrl,
        description: "API server",
      },
    ],
    tags: [
      {
        name: "Auth",
        description: "User authentication operations",
      },
      {
        name: "Setup",
        description: "Game setup operations",
      },
      {
        name: "Lobby",
        description: "Game lobby management operations",
      },
      {
        name: "Gameplay",
        description: "Game play operations",
      },
      {
        name: "AI",
        description: "AI player operations and status",
      },
      {
        name: "System",
        description: "System operations",
      },
    ],
    paths: {
      ...authPaths,
      ...setupPaths,
      ...lobbyPaths,
      ...gameplayPaths,
      ...aiPaths,
      ...systemPaths,
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  };
}
