import jwt, { SignOptions } from "jsonwebtoken";
import { UnexpectedAuthError } from "../errors/auth.errors";
import type {
  UserFinder,
  Username,
} from "@backend/common/data-access/repositories/users.repository";
import type { SessionCreator } from "@backend/common/data-access/repositories/sessions.repository";
import type { SessionResult } from "@backend/common/data-access/repositories/sessions.repository";

type ServiceDependencies = {
  findUser: UserFinder<Username>;
  storeSession: SessionCreator;
  jwtSecret: string;
  jwtOptions: SignOptions;
};

/**
 * Result of login operation specific to the service layer
 */
export type GuestLoginResult = {
  username: string;
  token: string;
};

export type GuestLoginService = (
  username: Username,
) => Promise<GuestLoginResult>;

export const guestLoginService =
  ({
    findUser,
    storeSession,
    jwtSecret,
    jwtOptions,
  }: ServiceDependencies): GuestLoginService =>
  async (username) => {
    const sanitizedUsername = username.trim();
    const user = await findUser(sanitizedUsername);

    if (!user) {
      throw new UnexpectedAuthError(
        `Failed to login guest user: ${sanitizedUsername}`,
      );
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      jwtSecret,
      jwtOptions,
    );

    const session = await storeSession({
      userId: user._id,
      token,
    });

    if (!session) {
      throw new UnexpectedAuthError(
        `Failed to create session for user: ${sanitizedUsername}`,
      );
    }

    return {
      username: user.username,
      token: session.token,
    };
  };
