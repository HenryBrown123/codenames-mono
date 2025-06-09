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
          },
          "409": {
            description: "Business rule violation - cannot create round",
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
    "/games/{gameId}/rounds/{roundNumber}/deal": {
      post: {
        summary: "Deal cards for a round",
        description:
          "Deals 25 random cards to a round and distributes them among teams",
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
            description: "Round identifier",
          },
        ],
        responses: {
          "201": {
            description: "Cards dealt successfully",
          },
          "404": {
            description: "Game not found",
          },
          "409": {
            description: "Business rule violation - cannot deal cards",
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
          },
          "404": {
            description: "Game or round not found",
          },
          "409": {
            description: "Business rule violation - cannot start round",
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
        description:
          "Allows a codemaster to give a clue to their team during their turn",
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
              schema: {
                type: "object",
                required: ["word", "targetCardCount"],
                properties: {
                  word: {
                    type: "string",
                    minLength: 1,
                    maxLength: 50,
                    description: "The clue word",
                  },
                  targetCardCount: {
                    type: "integer",
                    minimum: 1,
                    maximum: 25,
                    description: "Number of cards this clue relates to",
                  },
                },
              },
              example: {
                word: "nature",
                targetCardCount: 2,
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Clue given successfully",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: {
                    clue: {
                      word: "nature",
                      targetCardCount: 2,
                      createdAt: "2024-01-01T00:00:00Z",
                    },
                    turn: {
                      teamName: "Team Red",
                      guessesRemaining: 3,
                      status: "ACTIVE",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid clue word or parameters",
          },
          "404": {
            description: "Game not found",
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
        description:
          "Allows a codebreaker to guess a card during their team's turn. Handles all game state transitions including turn ends, round ends, and victory conditions.",
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
              schema: {
                type: "object",
                required: ["cardWord"],
                properties: {
                  cardWord: {
                    type: "string",
                    minLength: 1,
                    maxLength: 50,
                    description: "The word on the card to guess",
                  },
                },
              },
              example: {
                cardWord: "tree",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Guess made successfully",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: {
                    guess: {
                      cardWord: "tree",
                      outcome: "CORRECT_TEAM_CARD",
                      createdAt: "2024-01-01T00:00:00Z",
                    },
                    turn: {
                      teamName: "Team Red",
                      guessesRemaining: 2,
                      status: "ACTIVE",
                    },
                    transition: {
                      type: "TURN_END",
                      nextTeam: "Team Blue",
                      reason: "normal-transition",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid card word or card not available",
            content: {
              "application/json": {
                example: {
                  success: false,
                  error: 'Card "invalidword" not found on the board',
                  details: {
                    code: "invalid-card",
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
  };
}
