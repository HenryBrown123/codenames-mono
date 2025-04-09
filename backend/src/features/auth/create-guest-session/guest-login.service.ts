import jwt, { SignOptions } from "jsonwebtoken";
import { UnexpectedAuthError } from "../errors/auth.errors";

import type { UserRepository } from "@backend/common/data-access/users.repository";
import type {
  SessionRepository,
  Session,
} from "@backend/common/data-access/sessions.repository";

/**
 * Service interface for user login functionality
 */
export interface LoginService {
  execute: (username: string) => Promise<Session>;
}

/**
 * Dependencies required by the login service
 */
export interface Dependencies {
  userRepository: UserRepository;
  sessionRepository: SessionRepository;
  jwtSecret: string;
  jwtOptions: SignOptions;
}

/**
 * Creates a login service instance for authenticating users
 *
 * @param dependencies - Required repositories and JWT configuration
 * @returns Service object with execute method
 */
export const create = ({
  userRepository,
  sessionRepository,
  jwtSecret,
  jwtOptions,
}: Dependencies): LoginService => {
  /**
   * Authenticates a user by username and generates a JWT token.
   *
   * Exception throw if user does not exist as it should not be possible
   * to fail login for a guest user..
   *
   * @param username - The username to authenticate
   * @returns Promise resolving to a session with JWT token
   * @throws {UnexpectedAuthError} If user not found.
   */
  const execute = async (username: string): Promise<Session> => {
    const sanitizedUsername = username.trim();

    const user = await userRepository.findByUsername(sanitizedUsername);

    if (!user) {
      throw new UnexpectedAuthError(
        `Failed to login guest user: ${sanitizedUsername}`,
      );
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
      },
      jwtSecret,
      jwtOptions,
    );

    await sessionRepository.storeSession(user.id, token);

    return {
      userId: user.id,
      username: user.username,
      token,
    };
  };

  return {
    execute,
  };
};
