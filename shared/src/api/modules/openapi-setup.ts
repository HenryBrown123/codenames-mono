export function createSetupPaths() {
    return {
      "/games": {
        post: {
          summary: "Create a new game",
          description: "Creates a new game instance with specified configuration",
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
    };
  }