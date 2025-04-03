import jwt, { SignOptions } from "jsonwebtoken";
import { User, UsersRepository } from "./repositories/users.repository";
import {
  AuthRepository,
  UserSession,
} from "./repositories/sessions.repository";
import { generateUsername } from "./generate-username";

/**
 * Domain-specific error for authentication issues
 */
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

/**
 * Service interface for authentication operations
 */
export interface AuthService {
  createGuestUser: () => Promise<User>;
  createSession: (username: string) => Promise<UserSession>;
}

/**
 * Dependencies required by the auth service
 */
export interface Dependencies {
  usersRepository: UsersRepository;
  authRepository: AuthRepository;
  jwtSecret: string;
  jwtOptions: SignOptions;
}

/**
 * Create an auth service instance
 */
export const create = ({
  usersRepository,
  authRepository,
  jwtSecret,
  jwtOptions,
}: Dependencies): AuthService => {
  const createGuestUser = async (): Promise<User> => {
    const MAX_COLLISIONS = 10;

    for (
      let collisionCount = 0;
      collisionCount < MAX_COLLISIONS;
      collisionCount++
    ) {
      const username = generateUsername();

      const existingUser = await usersRepository.findByUsername(username);
      if (existingUser) {
        // Username collision detected, try again
        continue;
      }

      // Create user with the generated username
      return await usersRepository.createUser(username);
    }

    // With 3.6M possible usernames and 10 collision attempts, probability is
    // essentially zero even with 100,000 existing users
    throw new AuthError(
      `Failed to generate a unique username after ${MAX_COLLISIONS} collisions`,
    );
  };

  const createSession = async (username: string): Promise<UserSession> => {
    if (!username || username.trim().length < 3) {
      throw new AuthError("Username must be at least 3 characters long");
    }

    const sanitizedUsername = username.trim();

    const user = await usersRepository.findByUsername(sanitizedUsername);
    if (!user) {
      throw new AuthError("User not found");
    }

    // Sign a JWT token with the user ID and username
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
      },
      jwtSecret,
      jwtOptions,
    );

    // Store the session (can be a no-op for stateless auth)
    await authRepository.storeSession(user.id, token);

    return {
      userId: user.id,
      username: user.username,
      token,
    };
  };

  return {
    createGuestUser,
    createSession,
  };
};
