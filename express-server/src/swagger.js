import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Codenames game API",
      version: "1.0.0",
      description: "API for interacting with the codenames game server",
    },
    servers: [
      {
        url: "http://localhost:3000/api",
      },
    ],
  },
  apis: ["./src/game/**/*-router.{js,ts}"], // Simplified path
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
