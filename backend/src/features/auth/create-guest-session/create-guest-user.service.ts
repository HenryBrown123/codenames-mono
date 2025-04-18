import { UnexpectedAuthError } from "../errors/auth.errors";
import {
  findByUsername,
  createUser,
} from "@backend/common/data-access/users.repository";
import { generateUsername } from "./username-generator";

type ServiceDependencies = {
  findUser: ReturnType<typeof findByUsername>;
  createUser: ReturnType<typeof createUser>;
};

export type GuestUser = {
  id: number;
  username: string;
};

export const createGuestUserService = ({
  findUser,
  createUser,
}: ServiceDependencies) => {
  const findUniqueUsername = async (): Promise<string> => {
    const MAX_COLLISIONS = 10;

    for (
      let collisionCount = 0;
      collisionCount < MAX_COLLISIONS;
      collisionCount++
    ) {
      const username = generateUsername();
      const existingUser = await findUser(username);

      if (!existingUser) return username;
      console.log("Guest username collision detected - ", username);
    }

    throw new UnexpectedAuthError(
      "Failed to generate unique username... reached max collisions (10)",
    );
  };

  return async (): Promise<GuestUser> => {
    const username = await findUniqueUsername();
    const user = await createUser(username);

    return {
      id: user.id,
      username: user.username,
    };
  };
};
