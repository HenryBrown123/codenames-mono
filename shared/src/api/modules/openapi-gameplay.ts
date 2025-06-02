export function createGameplayPaths() {
  return {
    "/games/{gameId}": {
      get: {
        summary: "Get game state",
        description:
          "Retrieves the current state of a game for the authenticated user",
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
          "200": {
            description: "Game state retrieved successfully",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: {
                    game: {
                      publicId: "abc123",
                      status: "IN_PROGRESS",
                      gameType: "SINGLE_DEVICE",
                      gameFormat: "QUICK",
                      createdAt: "2024-01-01T00:00:00Z",
                      teams: [
                        {
                          name: "Team Red",
                          score: 2,
                          players: [
                            {
                              publicId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
                              name: "Alice",
                              isActive: true,
                            },
                            {
                              publicId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                              name: "Bob",
                              isActive: true,
                            },
                          ],
                        },
                        {
                          name: "Team Blue",
                          score: 1,
                          players: [
                            {
                              publicId: "12345678-1234-1234-1234-123456789012",
                              name: "Charlie",
                              isActive: true,
                            },
                            {
                              publicId: "87654321-4321-4321-4321-210987654321",
                              name: "Diana",
                              isActive: true,
                            },
                          ],
                        },
                      ],
                      currentRound: {
                        roundNumber: 1,
                        status: "IN_PROGRESS",
                        cards: [
                          {
                            word: "apple",
                            selected: false,
                          },
                          {
                            word: "tree",
                            selected: true,
                            teamName: "Team Red",
                            cardType: "TEAM",
                          },
                        ],
                        turns: [
                          {
                            teamName: "Team Red",
                            status: "COMPLETED",
                            guessesRemaining: 0,
                            clue: {
                              word: "nature",
                              number: 2,
                            },
                            guesses: [
                              {
                                playerName: "Alice",
                                outcome: "CORRECT_TEAM_CARD",
                              },
                            ],
                          },
                        ],
                      },
                      playerContext: {
                        playerName: "Alice",
                        teamName: "Team Red",
                        role: "CODEBREAKER",
                      },
                    },
                  },
                },
              },
            },
          },
          "403": {
            description: "User not authorized to view this game",
          },
          "404": {
            description: "Game not found",
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
                      roundNumber: 2,
                      status: "SETUP",
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
            description: "Round identifier (currently unused but required)",
          },
        ],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  deck: {
                    type: "string",
                    default: "BASE",
                    description: "Deck to draw words from",
                  },
                  languageCode: {
                    type: "string",
                    default: "en",
                    description: "Language code for words",
                  },
                },
              },
              example: {
                deck: "BASE",
                languageCode: "en",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Cards dealt successfully",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: {
                    roundNumber: 1,
                    status: "SETUP",
                    cardCount: 25,
                    cards: [
                      { word: "apple", selected: false },
                      { word: "tree", selected: false },
                      { word: "house", selected: false },
                      { word: "ocean", selected: false },
                      { word: "mountain", selected: false },
                    ],
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
    "/games/{gameId}/rounds/{roundNumber}/start": {
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
            name: "roundNumber",
            in: "path",
            required: true,
            schema: {
              type: "integer",
              minimum: 1,
            },
            description: "Round number in game",
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
                        path: "currentRound.cards",
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
