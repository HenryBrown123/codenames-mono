/**
 * Represents an authenticated user session
 */
export interface Session {
  userId: number;
  username: string;
  token: string;
}

/**
 * Session response object for API responses
 */
export interface SessionResponse {
  user: {
    id: number;
    username: string;
  };
  token: string;
}