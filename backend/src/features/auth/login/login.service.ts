import jwt, { SignOptions } from "jsonwebtoken";
import { Session } from "../domain/session.types";
import { UserRepository } from "../domain/user.repository";
import { SessionRepository } from "../domain/session.repository";

export type LoginResult =
  | { success: true; session: Session }
  | { success: false; reason: "invalid_username" | "invalid_credentials" };

export interface LoginService {
  execute: (username: string) => Promise<LoginResult>;
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
  const execute = async (username: string): Promise<LoginResult> => {
    if (!username || username.trim().length < 3) {
      return {
        success: false,
        reason: "invalid_username",
      };
    }

    const sanitizedUsername = username.trim();

    const user = await userRepository.findByUsername(sanitizedUsername);
    if (!user) {
      return {
        success: false,
        reason: "invalid_username",
      };
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
      success: true,
      session: {
        userId: user.id,
        username: user.username,
        token,
      },
    };
  };

  return {
    execute,
  };
};
