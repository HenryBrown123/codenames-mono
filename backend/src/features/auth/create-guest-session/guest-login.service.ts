import jwt, { SignOptions } from "jsonwebtoken";
import { UnexpectedAuthError } from "../errors/auth.errors";

import type { Session } from "../domain/session.types";
import type { UserRepository } from "../domain/user.repository";
import type { SessionRepository } from "../domain/session.repository";

export interface LoginService {
  execute: (username: string) => Promise<Session>;
}

export interface Dependencies {
  userRepository: UserRepository;
  sessionRepository: SessionRepository;
  jwtSecret: string;
  jwtOptions: SignOptions;
}

export const create = ({
  userRepository,
  sessionRepository,
  jwtSecret,
  jwtOptions,
}: Dependencies): LoginService => {
  const execute = async (username: string): Promise<Session> => {
    if (!username || username.trim().length < 3) {
      throw new UnexpectedAuthError(`Failed to login guest user: ${username}`);
    }

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
