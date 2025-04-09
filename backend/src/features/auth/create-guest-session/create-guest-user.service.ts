import type { UserRepository } from "@backend/common/data-access/users.repository";
import { UnexpectedAuthError } from "../errors/auth.errors";
import { generateUsername } from "./username-generator";

/**
 * Service interface for creating guest users
 */
export interface CreateGuestUserService {
  execute: () => Promise<GuestUser>;
}

/**
 * Data structure for guest user information
 */
export type GuestUser = {
  id: number;
  username: string;
};

/**
 * Dependencies required by the create guest user service
 */
export interface Dependencies {
  userRepository: UserRepository;
}

/**
 * Creates a service instance for guest user creation
 *
 * @param dependencies - Required dependencies
 * @returns Service object with execute method
 *
 */
export const create = ({
  userRepository,
}: Dependencies): CreateGuestUserService => {
  /**
   * Creates a guest user with an auto-generated username
   *
   * @returns Promise resolving to the created guest user
   * @throws {UnexpectedAuthError} If a unique username can't be generated after max attempts
   */
  const execute = async (): Promise<GuestUser> => {
    const username = await findUniqueUsername();
    const user = await userRepository.createUser(username);

    return {
      id: user.id,
      username: user.username,
    };
  };

  /**
   * Attempts to generate a unique username for guest users
   *
   * Makes multiple attempts to avoid collisions with existing usernames
   * in the database. Throws an error if max attempts are reached.
   *
   * @returns Promise resolving to a unique username
   * @throws {UnexpectedAuthError} If max collision threshold is reached
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

      if (!existingUser) {
        return username;
      }

      console.log("Guest username collision detected - ", username);
    }

    throw new UnexpectedAuthError(
      `Failed to generate unique username... reached max collisions (10)`,
    );
  };

  return {
    execute,
  };
};
