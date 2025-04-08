/**
 * Creates an OpenAPI specification with dynamic server URL
 * @param serverUrl The base URL for the API server
 */

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
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  };
}
