import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "./websocket-context";
import { WebSocketEvent, EventPayload } from "./websocket-events.types";

/**
 * Hook to handle WebSocket events and invalidate React Query cache
 *
 * @param gameId - The game ID to listen for events on (null to not listen)
 */
export const useWebSocketInvalidation = (gameId: string | null) => {
  const { socket, isConnected } = useWebSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !isConnected || !gameId) {
      return;
    }

    console.log(`Setting up WebSocket event listeners for game: ${gameId}`);

    // Helper to invalidate game data queries
    const invalidateGameData = () => {
      console.log(`Invalidating gameData queries for game: ${gameId}`);
      queryClient.invalidateQueries({ queryKey: ["gameData", gameId] });
    };

    // Helper to invalidate game events
    const invalidateGameEvents = () => {
      console.log(`Invalidating game-events queries for game: ${gameId}`);
      queryClient.invalidateQueries({ queryKey: ["game-events", gameId] });
    };

    // Helper to invalidate lobby data
    const invalidateLobby = () => {
      console.log(`Invalidating lobby queries for game: ${gameId}`);
      queryClient.invalidateQueries({ queryKey: ["lobby", gameId] });
    };

    // Helper to invalidate players
    const invalidatePlayers = () => {
      console.log(`Invalidating players queries for game: ${gameId}`);
      queryClient.invalidateQueries({ queryKey: ["players", gameId] });
    };

    // Lobby events
    const handlePlayerJoined = (payload: EventPayload) => {
      console.log("Player joined event received:", payload);
      invalidatePlayers();
      invalidateLobby();
    };

    const handlePlayerLeft = (payload: EventPayload) => {
      console.log("Player left event received:", payload);
      invalidatePlayers();
      invalidateLobby();
    };

    const handlePlayerUpdated = (payload: EventPayload) => {
      console.log("Player updated event received:", payload);
      invalidatePlayers();
      invalidateLobby();
    };

    const handleGameStarted = (payload: EventPayload) => {
      console.log("Game started event received:", payload);
      invalidateGameData();
      invalidateLobby();
      invalidateGameEvents();
    };

    // Round events
    const handleRoundCreated = (payload: EventPayload) => {
      console.log("Round created event received:", payload);
      invalidateGameData();
      invalidateGameEvents();
    };

    const handleRoundStarted = (payload: EventPayload) => {
      console.log("Round started event received:", payload);
      invalidateGameData();
      invalidateGameEvents();
    };

    const handleCardsDealt = (payload: EventPayload) => {
      console.log("Cards dealt event received:", payload);
      invalidateGameData();
      invalidateGameEvents();
    };

    const handleRoundEnded = (payload: EventPayload) => {
      console.log("Round ended event received:", payload);
      invalidateGameData();
      invalidateGameEvents();
    };

    // Turn events
    const handleClueGiven = (payload: EventPayload) => {
      console.log("Clue given event received:", payload);
      invalidateGameData();
      invalidateGameEvents();
    };

    const handleGuessMade = (payload: EventPayload) => {
      console.log("Guess made event received:", payload);
      invalidateGameData();
      invalidateGameEvents();
    };

    const handleTurnEnded = (payload: EventPayload) => {
      console.log("Turn ended event received:", payload);
      invalidateGameData();
      invalidateGameEvents();
    };

    // Game events
    const handleGameEnded = (payload: EventPayload) => {
      console.log("Game ended event received:", payload);
      invalidateGameData();
      invalidateGameEvents();
    };

    const handleGameUpdated = (payload: EventPayload) => {
      console.log("Game updated event received:", payload);
      invalidateGameData();
    };

    // Register all event listeners
    socket.on(WebSocketEvent.PLAYER_JOINED, handlePlayerJoined);
    socket.on(WebSocketEvent.PLAYER_LEFT, handlePlayerLeft);
    socket.on(WebSocketEvent.PLAYER_UPDATED, handlePlayerUpdated);
    socket.on(WebSocketEvent.GAME_STARTED, handleGameStarted);
    socket.on(WebSocketEvent.ROUND_CREATED, handleRoundCreated);
    socket.on(WebSocketEvent.ROUND_STARTED, handleRoundStarted);
    socket.on(WebSocketEvent.CARDS_DEALT, handleCardsDealt);
    socket.on(WebSocketEvent.ROUND_ENDED, handleRoundEnded);
    socket.on(WebSocketEvent.CLUE_GIVEN, handleClueGiven);
    socket.on(WebSocketEvent.GUESS_MADE, handleGuessMade);
    socket.on(WebSocketEvent.TURN_ENDED, handleTurnEnded);
    socket.on(WebSocketEvent.GAME_ENDED, handleGameEnded);
    socket.on(WebSocketEvent.GAME_UPDATED, handleGameUpdated);

    // Cleanup: remove all event listeners
    return () => {
      console.log(`Removing WebSocket event listeners for game: ${gameId}`);
      socket.off(WebSocketEvent.PLAYER_JOINED, handlePlayerJoined);
      socket.off(WebSocketEvent.PLAYER_LEFT, handlePlayerLeft);
      socket.off(WebSocketEvent.PLAYER_UPDATED, handlePlayerUpdated);
      socket.off(WebSocketEvent.GAME_STARTED, handleGameStarted);
      socket.off(WebSocketEvent.ROUND_CREATED, handleRoundCreated);
      socket.off(WebSocketEvent.ROUND_STARTED, handleRoundStarted);
      socket.off(WebSocketEvent.CARDS_DEALT, handleCardsDealt);
      socket.off(WebSocketEvent.ROUND_ENDED, handleRoundEnded);
      socket.off(WebSocketEvent.CLUE_GIVEN, handleClueGiven);
      socket.off(WebSocketEvent.GUESS_MADE, handleGuessMade);
      socket.off(WebSocketEvent.TURN_ENDED, handleTurnEnded);
      socket.off(WebSocketEvent.GAME_ENDED, handleGameEnded);
      socket.off(WebSocketEvent.GAME_UPDATED, handleGameUpdated);
    };
  }, [socket, isConnected, gameId, queryClient]);
};
