export function createOpenApiSpec(serverUrl = "http://localhost:3000/api") {
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
        name: "System",
        description: "System operations",
      },
    ],
    paths: {
      "/auth/guests": {
        post: {
          summary: "Create a guest user",
          description:
            "Creates a new guest user with a randomly generated username",
          tags: ["Auth"],
          responses: {
            "201": {
              description: "Guest user created successfully",
              content: {
                "application/json": {
                  example: {
                    success: true,
                    data: {
                      user: {
                        username: "Happy-Lion42",
                      },
                      session: {
                        username: "Happy-Lion42",
                        token: "jwt-token-string",
                      },
                    },
                  },
                },
              },
            },
            "500": {
              description: "Server error",
            },
          },
        },
      },
      "/health": {
        get: {
          summary: "Health check endpoint",
          description: "Simple endpoint to check if the API is up and running",
          tags: ["System"],
          responses: {
            "200": {
              description: "API is running",
              content: {
                "application/json": {
                  example: {
                    status: "UP",
                  },
                },
              },
            },
          },
        },
      },
      "/games": {
        post: {
          summary: "Create a new game",
          description:
            "Creates a new game instance with specified configuration",
          tags: ["Setup"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                example: {
                  gameType: "SINGLE_DEVICE",
                  gameFormat: "QUICK",
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Game created successfully",
              content: {
                "application/json": {
                  example: {
                    success: true,
                    data: {
                      game: {
                        publicId: "abc123",
                        gameType: "SINGLE_DEVICE",
                        gameFormat: "QUICK",
                        createdAt: "2024-01-01T00:00:00Z",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
            },
            "500": {
              description: "Server error",
            },
          },
        },
      },
      "/games/{gameId}/players": {
        post: {
          summary: "Add players to a game",
          description: "Adds one or more players to a game lobby",
          tags: ["Lobby"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "gameId",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
              description: "Public ID of the game",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                example: [
                  {
                    playerName: "Player 1",
                    teamId: 1,
                  },
                  {
                    playerName: "Player 2",
                    teamId: 2,
                  },
                ],
              },
            },
          },
          responses: {
            "201": {
              description: "Players added successfully",
              content: {
                "application/json": {
                  example: {
                    success: true,
                    data: {
                      players: [
                        {
                          playerId: 42,
                          gameId: 123,
                          teamId: 1,
                          playerName: "Player 1",
                          userId: 789,
                        },
                      ],
                      gameId: "abc123",
                    },
                  },
                },
              },
            },
            "400": {
              description: "Invalid request",
            },
            "401": {
              description: "Unauthorized",
            },
            "500": {
              description: "Server error",
            },
          },
        },
      },
      "/games/{gameId}/players/{playerId}": {
        delete: {
          summary: "Remove a player from a game",
          description: "Removes a specific player from a game lobby",
          tags: ["Lobby"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "gameId",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
              description: "Public ID of the game",
            },
            {
              name: "playerId",
              in: "path",
              required: true,
              schema: {
                type: "integer",
              },
              description: "ID of the player to remove",
            },
          ],
          responses: {
            "200": {
              description: "Player removed successfully",
              content: {
                "application/json": {
                  example: {
                    success: true,
                    data: {
                      players: [
                        {
                          playerId: 43,
                          gameId: 123,
                          teamId: 1,
                          playerName: "Player 2",
                          userId: 790,
                        },
                      ],
                      gameId: "abc123",
                    },
                  },
                },
              },
            },
            "400": {
              description: "Invalid request",
            },
            "401": {
              description: "Unauthorized",
            },
            "500": {
              description: "Server error",
            },
          },
        },
      },
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
