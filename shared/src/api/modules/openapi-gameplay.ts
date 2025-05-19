export function createGameplayPaths() {
  return {
    "/games/{gameId}/rounds": {
      post: {
        summary: "Create a new round",
        description:
          "Creates a new round in a game if all business rules are met",
        tags: ["Gameplay"],
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
        responses: {
          "201": {
            description: "Round created successfully",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: {
                    round: {
                      id: 123,
                      roundNumber: 2,
                      gameId: 456,
                      createdAt: "2024-01-01T00:00:00Z",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Game not found",
            content: {
              "application/json": {
                example: {
                  success: false,
                  error: "Failed to create new round",
                  details: {
                    code: "game-not-found",
                  },
                },
              },
            },
          },
          "409": {
            description: "Business rule violation - cannot create round",
            content: {
              "application/json": {
                example: {
                  success: false,
                  error: "Failed to create new round",
                  details: {
                    code: "invalid-game-state",
                    validationErrors: [
                      {
                        path: "rounds",
                        message:
                          "Previous round must be completed before creating a new round",
                      },
                    ],
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
    "/games/{gameId}/rounds/{id}/deal": {
      post: {
        summary: "Deal cards for a round",
        description:
          "Deals 25 random cards to a round and distributes them among teams. Can be called multiple times to re-deal cards as long as the round is in the correct state.",
        tags: ["Gameplay"],
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
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
            description: "ID of the round",
          },
        ],
        responses: {
          "201": {
            description: "Cards dealt successfully",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: {
                    roundId: 123,
                    roundNumber: 1,
                    startingTeamId: 1,
                    cards: [
                      { word: "apple", selected: false },
                      { word: "tree", selected: false },
                      // ... additional cards
                    ],
                  },
                },
              },
            },
          },
          "404": {
            description: "Game or round not found",
            content: {
              "application/json": {
                example: {
                  success: false,
                  error: "Failed to deal cards",
                  details: {
                    code: "game-not-found",
                  },
                },
              },
            },
          },
          "409": {
            description: "Business rule violation - cannot deal cards",
            content: {
              "application/json": {
                example: {
                  success: false,
                  error: "Failed to deal cards",
                  details: {
                    code: "invalid-game-state",
                    validationErrors: [
                      {
                        path: "rounds",
                        message: "Round must be in SETUP state to deal cards",
                      },
                    ],
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
    "/games/{gameId}/rounds/{id}/start": {
      post: {
        summary: "Start a round",
        description:
          "Transitions a round from SETUP to IN_PROGRESS state once cards have been dealt",
        tags: ["Gameplay"],
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
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
            description: "ID of the round",
          },
        ],
        responses: {
          "200": {
            description: "Round started successfully",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: {
                    round: {
                      roundNumber: 1,
                      status: "IN_PROGRESS",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Game or round not found",
            content: {
              "application/json": {
                example: {
                  success: false,
                  error: "Failed to start round",
                  details: {
                    code: "round-not-found",
                  },
                },
              },
            },
          },
          "409": {
            description: "Business rule violation - cannot start round",
            content: {
              "application/json": {
                example: {
                  success: false,
                  error: "Failed to start round",
                  details: {
                    code: "invalid-game-state",
                    validationErrors: [
                      {
                        path: ["currentRound", "cards"],
                        message:
                          "Cards must be dealt before starting the round",
                      },
                    ],
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
  };
}
