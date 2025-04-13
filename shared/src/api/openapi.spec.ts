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
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        type: "object",
                        properties: {
                          user: {
                            type: "object",
                            properties: {
                              username: {
                                type: "string",
                                example: "Happy-Lion42",
                              },
                            },
                          },
                          session: {
                            $ref: "#/components/schemas/Session",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            "500": {
              description: "Server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
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
                  schema: {
                    type: "object",
                    properties: {
                      status: {
                        type: "string",
                        example: "UP",
                      },
                    },
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
                schema: {
                  $ref: "#/components/schemas/CreateGameRequest",
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Game created successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/CreateGameResponse",
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            "500": {
              description: "Server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/games/{id}/players": {
        post: {
          summary: "Add players to a game",
          description: "Adds one or more players to a game lobby",
          tags: ["Lobby"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
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
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/PlayerData",
                  },
                  minItems: 1,
                },
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
                  schema: {
                    $ref: "#/components/schemas/AddPlayersResponse",
                  },
                },
              },
            },
            "400": {
              description: "Invalid request",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            "500": {
              description: "Server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
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
      schemas: {
        Session: {
          type: "object",
          properties: {
            username: {
              type: "string",
              example: "Happy-Lion42",
            },
            token: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            error: {
              type: "string",
              example: "Internal server error",
            },
          },
        },
        CreateGameRequest: {
          type: "object",
          required: ["gameType", "gameFormat"],
          properties: {
            gameType: {
              type: "string",
              enum: ["SINGLE_DEVICE", "MULTI_DEVICE"],
            },
            gameFormat: {
              type: "string",
              enum: ["QUICK", "BEST_OF_THREE", "ROUND_ROBIN"],
            },
          },
        },
        CreateGameResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            data: {
              type: "object",
              properties: {
                game: {
                  type: "object",
                  properties: {
                    publicId: {
                      type: "string",
                      example: "abc123",
                    },
                    gameFormat: {
                      type: "string",
                      enum: ["QUICK", "BEST_OF_THREE", "ROUND_ROBIN"],
                    },
                    gameType: {
                      type: "string",
                      enum: ["SINGLE_DEVICE", "MULTI_DEVICE"],
                    },
                    createdAt: {
                      type: "string",
                      format: "date-time",
                    },
                  },
                },
              },
            },
          },
        },
        PlayerData: {
          type: "object",
          properties: {
            playerName: {
              type: "string",
              example: "Player 1",
            },
            teamId: {
              type: "integer",
              example: 1,
            },
          },
        },
        AddPlayersResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            data: {
              type: "object",
              properties: {
                players: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      playerId: {
                        type: "integer",
                        example: 42,
                      },
                      gameId: {
                        type: "integer",
                        example: 123,
                      },
                      teamId: {
                        type: "integer",
                        example: 1,
                      },
                      playerName: {
                        type: "string",
                        example: "Player 1",
                      },
                    },
                  },
                },
              },
            },
          },
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
