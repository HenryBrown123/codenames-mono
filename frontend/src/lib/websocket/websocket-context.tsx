import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { WebSocketEvent } from "./websocket-events.types";

/**
 * WebSocket connection status
 */
export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "reconnecting";

/**
 * WebSocket context value
 */
interface WebSocketContextValue {
  socket: Socket | null;
  status: ConnectionStatus;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined);

/**
 * WebSocket provider props
 */
interface WebSocketProviderProps {
  children: React.ReactNode;
  url?: string;
  autoConnect?: boolean;
}

/**
 * WebSocket provider component
 * Manages the Socket.io connection with authentication and reconnection handling
 */
export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  url = "http://192.168.1.156:3000",
  autoConnect = true,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log("WebSocket already connected");
      return;
    }

    if (socketRef.current && !socketRef.current.connected) {
      console.log("Reconnecting existing socket...");
      socketRef.current.connect();
      return;
    }

    console.log("Creating new WebSocket connection to:", url);
    setStatus("connecting");

    const newSocket = io(url, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    // Connection event handlers
    newSocket.on(WebSocketEvent.CONNECTION, () => {
      console.log("WebSocket connected successfully");
      setStatus("connected");
    });

    newSocket.on("connect", () => {
      console.log("WebSocket connect event fired");
      setStatus("connected");
    });

    newSocket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      setStatus("disconnected");
    });

    newSocket.on(WebSocketEvent.DISCONNECT, (reason) => {
      console.log("WebSocket disconnected:", reason);
      setStatus("disconnected");
    });

    newSocket.on("reconnect_attempt", (attemptNumber) => {
      console.log(`WebSocket reconnection attempt ${attemptNumber}`);
      setStatus("reconnecting");
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log(`WebSocket reconnected after ${attemptNumber} attempts`);
      setStatus("connected");
    });

    newSocket.on("reconnect_error", (error) => {
      console.error("WebSocket reconnection error:", error);
    });

    newSocket.on("reconnect_failed", () => {
      console.error("WebSocket reconnection failed");
      setStatus("disconnected");
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
  }, [url]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log("Disconnecting WebSocket");
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setStatus("disconnected");
    }
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [autoConnect, connect]);

  const value: WebSocketContextValue = {
    socket,
    status,
    isConnected: status === "connected",
    connect,
    disconnect,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};

/**
 * Hook to access WebSocket context
 */
export const useWebSocket = (): WebSocketContextValue => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
