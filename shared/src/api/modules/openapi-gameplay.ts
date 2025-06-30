export function createGameplayPaths() {
  return {
    "/games/{gameId}": {
      get: {
        summary: "Get game state for specific player",
        description:
          "Retrieves the current state of a game from the perspective of a specific player. Requires playerId in request body to determine player context and data filtering.",
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
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                playerId: "player_abc123",
              },
            },
          },
        },
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
                              publicId: "b2c3d4e5-f6g7-8901-bcde-f23456789012",
                              name: "Charlie",
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
                            word: "cat",
                            selected: false,
                            teamName: "Team Red",
                            cardType: "TEAM",
                          },
                          {
                            word: "dog",
                            selected: true,
                            teamName: "Team Blue",
                            cardType: "TEAM",
                          },
                        ],
                        turns: [
                          {
                            teamName: "Team Red",
                            status: "COMPLETED",
                            guessesRemaining: 0,
                            clue: {
                              word: "animals",
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
    "/games/{gameId}/players": {
      get: {
        summary: "Get players with status",
        description: "Retrieves all players in a game with their current status (ACTIVE/WAITING)",
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
            description: "Players retrieved successfully",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: {
                    players: [
                      {
                        publicId: "player_abc123",
                        name: "Alice",
                        teamName: "Team Red",
                        role: "CODEMASTER",
                        status: "ACTIVE",
                      },
                      {
                        publicId: "player_def456",
                        name: "Bob",
                        teamName: "Team Blue",
                        role: "CODEBREAKER",
                        status: "WAITING",
                      },
                    ],
                  },
                },
              },
            },
          },
          "404": {
            description: "Game not found",
          },
          "403": {
            description: "User is not a player in this game",
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
    "/games/{gameId}/rounds/{roundNumber}/clues": {
      post: {
        summary: "Give a clue",
        description: "Allows a codemaster to provide a clue for their team",
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
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                playerId: "player_abc123",
                word: "animals",
                targetCardCount: 2,
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Clue given successfully",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: {
                    clue: {
                      word: "animals",
                      number: 2,
                      createdAt: "2024-01-01T12:00:00Z",
                    },
                    turn: {
                      publicId: "turn-abc123-def456",
                      teamName: "Red Team",
                      status: "ACTIVE",
                      guessesRemaining: 3,
                      createdAt: "2024-01-01T12:00:00Z",
                      completedAt: null,
                      clue: {
                        word: "animals",
                        number: 2,
                        createdAt: "2024-01-01T12:00:00Z",
                      },
                      hasGuesses: false,
                      lastGuess: null,
                      prevGuesses: [],
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Game or round not found",
          },
          "409": {
            description: "Business rule violation - cannot give clue",
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
    "/games/{gameId}/rounds/{roundNumber}/guesses": {
      post: {
        summary: "Make a guess",
        description: "Allows a codebreaker to guess a card",
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
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                playerId: "player_def456",
                cardWord: "dog",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Guess made successfully",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: {
                    guess: {
                      cardWord: "dog",
                      outcome: "CORRECT_TEAM_CARD",
                      createdAt: "2024-01-01T12:03:00Z",
                    },
                    turn: {
                      publicId: "turn-abc123-def456",
                      teamName: "Red Team",
                      status: "ACTIVE",
                      guessesRemaining: 2,
                      createdAt: "2024-01-01T12:00:00Z",
                      completedAt: null,
                      clue: {
                        word: "animals",
                        number: 2,
                        createdAt: "2024-01-01T12:00:00Z",
                      },
                      hasGuesses: true,
                      lastGuess: {
                        cardWord: "dog",
                        playerName: "John",
                        outcome: "CORRECT_TEAM_CARD",
                        createdAt: "2024-01-01T12:03:00Z",
                      },
                      prevGuesses: [],
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Game, round, or card not found",
            content: {
              "application/json": {
                example: {
                  success: false,
                  error: "Round 2 is not the current round (current: 1)",
                  details: {
                    code: "round-not-current",
                  },
                },
              },
            },
          },
          "409": {
            description: "Business rule violation - cannot make guess",
            content: {
              "application/json": {
                example: {
                  success: false,
                  error: "Failed to make guess",
                  details: {
                    code: "invalid-game-state",
                    validationErrors: [
                      {
                        path: "playerContext.role",
                        message: "Only codebreakers can make guesses",
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
    "/turns/{turnId}": {
      get: {
        summary: "Get turn details",
        description:
          "Retrieves detailed information about a specific turn including clues, guesses, and computed fields for UI state management",
        tags: ["Gameplay"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "turnId",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
            description: "UUID of the turn",
          },
        ],
        responses: {
          "200": {
            description: "Turn details retrieved successfully",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: {
                    turn: {
                      publicId: "turn-abc123-def456",
                      teamName: "Red Team",
                      status: "ACTIVE",
                      guessesRemaining: 2,
                      createdAt: "2024-01-01T12:00:00Z",
                      completedAt: null,
                      clue: {
                        word: "animals",
                        number: 3,
                        createdAt: "2024-01-01T12:00:00Z",
                      },
                      hasGuesses: true,
                      lastGuess: {
                        cardWord: "dog",
                        playerName: "John",
                        outcome: "CORRECT_TEAM_CARD",
                        createdAt: "2024-01-01T12:03:00Z",
                      },
                      prevGuesses: [
                        {
                          cardWord: "cat",
                          playerName: "John",
                          outcome: "CORRECT_TEAM_CARD",
                          createdAt: "2024-01-01T12:01:00Z",
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Turn not found",
            content: {
              "application/json": {
                example: {
                  success: false,
                  error: "Turn not found",
                },
              },
            },
          },
          "403": {
            description:
              "Access denied - turn does not belong to authorized game",
            content: {
              "application/json": {
                example: {
                  success: false,
                  error: "Access denied to this turn",
                },
              },
            },
          },
          "400": {
            description: "Invalid request parameters",
            content: {
              "application/json": {
                example: {
                  success: false,
                  error: "Invalid request parameters",
                  details: [
                    {
                      code: "invalid_string",
                      expected: "uuid",
                      message: "Turn ID must be a valid UUID",
                      path: ["params", "turnId"],
                    },
                  ],
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
