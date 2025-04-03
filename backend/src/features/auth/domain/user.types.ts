/**
 * User entity as stored in the database
 */
export interface User {
  id: number;
  username: string;
  created_at: Date;
}

/**
 * User response object for API responses
 */
export interface UserResponse {
  id: number;
  username: string;
}
