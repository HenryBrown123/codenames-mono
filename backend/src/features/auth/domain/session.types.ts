/**
 * Represents an authenticated user session
 */
export interface Session {
  userId: number;
  username: string;
  token: string;
}
