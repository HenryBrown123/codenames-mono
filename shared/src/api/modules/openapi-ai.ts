export function createAIPaths() {
  return {
    "/games/{gameId}/ai/move": {
      post: {
        summary: "Trigger AI to make a move",
        description:
          "Manually triggers the AI to check the game state and make a move if appropriate. Useful for testing AI behavior or forcing AI action when automatic triggers don't fire.",
        tags: ["AI"],
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
            description: "AI move triggered successfully",
            content: {
              "application/json": {
                example: {
                  success: true,
                  message: "AI move check initiated",
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
                  error: "Game not found",
                },
              },
            },
          },
        },
      },
    },
    "/games/{gameId}/ai/status": {
      get: {
        summary: "Get AI pipeline status",
        description:
          "Retrieves the current status of AI pipelines running for the game, including spymaster and guesser pipeline runs with their stages and results.",
        tags: ["AI"],
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
            description: "AI pipeline status retrieved successfully",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: {
                    pipelines: [
                      {
                        id: "run_abc123",
                        gameId: "game_xyz",
                        playerId: 42,
                        pipelineType: "SPYMASTER",
                        status: "COMPLETE",
                        errorMessage: null,
                        spymasterResponse: {
                          clue: {
                            word: "FRUIT",
                            targetCardCount: 3,
                          },
                          reasoning: "Connecting APPLE, BANANA, and ORANGE",
                        },
                        prefilterResponse: null,
                        rankerResponse: null,
                        createdAt: "2024-01-01T12:00:00Z",
                        completedAt: "2024-01-01T12:00:05Z",
                      },
                      {
                        id: "run_def456",
                        gameId: "game_xyz",
                        playerId: 43,
                        pipelineType: "GUESSER",
                        status: "RUNNING",
                        errorMessage: null,
                        spymasterResponse: null,
                        prefilterResponse: {
                          candidateWords: ["APPLE", "BANANA", "ORANGE", "GRAPE"],
                          reasoning: "Filtered 25 words down to 4 candidates",
                        },
                        rankerResponse: {
                          rankedWords: [
                            {
                              word: "APPLE",
                              score: 0.95,
                              reasoning: "Strong semantic connection to FRUIT",
                            },
                            {
                              word: "BANANA",
                              score: 0.89,
                              reasoning: "Good match with FRUIT clue",
                            },
                          ],
                        },
                        createdAt: "2024-01-01T12:00:10Z",
                        completedAt: null,
                      },
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
                  error: "Game not found",
                },
              },
            },
          },
        },
      },
    },
  };
}
