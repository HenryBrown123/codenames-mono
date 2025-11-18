import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import {
  createWebSocketAuthMiddleware,
  AuthenticatedSocket,
} from "./websocket-auth.middleware";
import { WebSocketEvent } from "./websocket-events.types";
import { emitServerGameEvent } from "@backend/ai/events/game-event-bus";

/**
 * WebSocket server configuration
 */
interface WebSocketServerConfig {
  httpServer: HttpServer;
  jwtSecret: string;
  corsOrigins: string[];
}

/**
 * Global WebSocket server instance
 */
let io: SocketIOServer | null = null;

/**
 * Initialize WebSocket server with Socket.io
 */
export const initializeWebSocketServer = (
  config: WebSocketServerConfig,
): SocketIOServer => {
  const { httpServer, jwtSecret, corsOrigins } = config;

  // Create Socket.io server
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: corsOrigins,
      credentials: true,
      methods: ["GET", "POST"],
    },
    // Connection settings
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Apply authentication middleware
  io.use(createWebSocketAuthMiddleware(jwtSecret));

  // Handle connections
  io.on(WebSocketEvent.CONNECTION, (socket: AuthenticatedSocket) => {
    console.log(
      `WebSocket client connected: ${socket.id} (User: ${socket.auth?.username})`,
    );

    // Handle joining game rooms
    socket.on(WebSocketEvent.JOIN_GAME, (gameId: string) => {
      if (!gameId) {
        console.error("Invalid gameId provided to JOIN_GAME");
        return;
      }
      const roomName = `game:${gameId}`;
      socket.join(roomName);
      console.log(
        `User ${socket.auth?.username} joined game room: ${roomName}`,
      );

      // Emit server-side event so AI can check if it needs to act
      emitServerGameEvent(WebSocketEvent.PLAYER_JOINED, { gameId });
    });

    // Handle leaving game rooms
    socket.on(WebSocketEvent.LEAVE_GAME, (gameId: string) => {
      if (!gameId) {
        console.error("Invalid gameId provided to LEAVE_GAME");
        return;
      }
      const roomName = `game:${gameId}`;
      socket.leave(roomName);
      console.log(
        `User ${socket.auth?.username} left game room: ${roomName}`,
      );
    });

    // Handle disconnection
    socket.on(WebSocketEvent.DISCONNECT, (reason: string) => {
      console.log(
        `WebSocket client disconnected: ${socket.id} (Reason: ${reason})`,
      );
    });
  });

  console.log("WebSocket server initialized");
  return io;
};

/**
 * Get the global WebSocket server instance
 */
export const getWebSocketServer = (): SocketIOServer => {
  if (!io) {
    throw new Error(
      "WebSocket server not initialized. Call initializeWebSocketServer first.",
    );
  }
  return io;
};

/**
 * Emit event to a specific game room
 */
export const emitToGame = (
  gameId: string,
  event: WebSocketEvent,
  payload: any,
): void => {
  if (!io) {
    console.warn("WebSocket server not initialized, skipping event emission");
    return;
  }

  const roomName = `game:${gameId}`;
  io.to(roomName).emit(event, payload);
  console.log(`Emitted ${event} to room ${roomName}`, payload);
};

/**
 * Emit event to all connected clients
 */
export const emitToAll = (event: WebSocketEvent, payload: any): void => {
  if (!io) {
    console.warn("WebSocket server not initialized, skipping event emission");
    return;
  }

  io.emit(event, payload);
  console.log(`Emitted ${event} to all clients`, payload);
};
