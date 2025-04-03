/**
 * User entity as stored in the database
 */
export type User = {
  id: number;
  username: string;
  created_at: Date;
};

/**
 * User response object for API responses
 */
export type UserResponse = {
  id: number;
  username: string;
};
