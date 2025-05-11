export function createSystemPaths() {
  return {
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
  };
}
