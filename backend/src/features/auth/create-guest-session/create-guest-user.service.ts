import type { UserRepository } from "@backend/common/data-access/users.repository";
import { UnexpectedAuthError } from "../errors/auth.errors";
import { generateUsername } from "./username-generator";

/**
 * Service interface for creating guest users
 */
export interface CreateGuestUserService {
  execute: () => Promise<GuestUser>;
}

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
 * Create a service instance for guest user creation
 */
export const create = ({
  userRepository,
}: Dependencies): CreateGuestUserService => {
  /**
   * Creates a guest user with an auto-generated username
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
