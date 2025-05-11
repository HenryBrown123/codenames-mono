export function createAuthPaths() {
  return {
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
                example: {
                  success: true,
                  data: {
                    user: {
                      username: "Happy-Lion42",
                    },
                    session: {
                      username: "Happy-Lion42",
                      token: "jwt-token-string",
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Server error",
          },
        },
      },
    },
  };
}
