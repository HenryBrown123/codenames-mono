import jwt, { SignOptions } from "jsonwebtoken";
import { Session } from "../domain/session.types";
import { UserRepository } from "../domain/user.repository";
import { SessionRepository } from "../domain/session.repository";
import { UnexpectedAuthError } from "../errors/auth.errors";
import { generateUsername } from "./generate-username";
/**
 * Service interface for creating guest users
 */
export interface CreateGuestUserService {
  execute: () => Promise<Session>;
}

/**
 * Dependencies required by the create guest user service
 */
export interface Dependencies {
  userRepository: UserRepository;
  sessionRepository: SessionRepository;
  jwtSecret: string;
  jwtOptions: SignOptions;
}

/**
 * Create a service instance for guest user creation
 */
export const create = ({
  userRepository,
  sessionRepository,
  jwtSecret,
  jwtOptions,
}: Dependencies): CreateGuestUserService => {
  /**
   * Creates a guest user with an auto-generated username
   */

  const execute = async (): Promise<Session> => {
    const username = await findUniqueUsername();

    const user = await userRepository.createUser(username);

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

  /**
   * Derive a unique random username for guests..
   */

  const findUniqueUsername = async (): Promise<string> => {
    const MAX_COLLISIONS = 10;

    for (
      let collisionCount = 0;
      collisionCount < MAX_COLLISIONS;
      collisionCount++
    ) {
      const username = generateUsername();
      const existingUser = await userRepository.findByUsername(username);

      if (existingUser) {
        console.log("Guest username collision detected - ", username);
        continue;
      }

      return username;
    }

    throw new UnexpectedAuthError(
      `Failed to generate unique  username... reached max collisions (10)`,
    );
  };

  return {
    execute,
  };
};
