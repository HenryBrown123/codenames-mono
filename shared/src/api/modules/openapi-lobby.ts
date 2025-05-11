export function createLobbyPaths() {
  return {
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
      patch: {
        summary: "Modify players in a game (batch)",
        description: "Updates information for multiple players in a game",
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
                  playerId: 42,
                  teamId: 2,
                  playerName: "Updated Name 1",
                },
                {
                  playerId: 43,
                  teamId: 1,
                },
              ],
            },
          },
        },
        responses: {
          "200": {
            description: "Players updated successfully",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: {
                    players: [
                      {
                        playerId: 42,
                        gameId: 123,
                        teamId: 2,
                        playerName: "Updated Name 1",
                      },
                      {
                        playerId: 43,
                        gameId: 123,
                        teamId: 1,
                        playerName: "Player 2",
                      },
                    ],
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
      patch: {
        summary: "Modify a single player in a game",
        description: "Updates information for a specific player in a game",
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
            description: "ID of the player to modify",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                teamId: 2,
                playerName: "Updated Player Name",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Player updated successfully",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: {
                    player: {
                      playerId: 42,
                      gameId: 123,
                      teamId: 2,
                      playerName: "Updated Player Name",
                    },
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
          "404": {
            description: "Player not found",
          },
          "500": {
            description: "Server error",
          },
        },
      },
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
    "/games/{gameId}/start": {
      post: {
        summary: "Start a game",
        description:
          "Transitions a game from LOBBY to IN_PROGRESS state if all requirements are met",
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
        responses: {
          "200": {
            description: "Game started successfully",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: {
                    game: {
                      publicId: "abc123",
                      status: "IN_PROGRESS",
                    },
                  },
                },
              },
            },
          },
          "409": {
            description:
              "Game cannot be started due to business rule violations",
            content: {
              "application/json": {
                example: {
                  success: false,
                  error: "Cannot start game with less than 4 players",
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
