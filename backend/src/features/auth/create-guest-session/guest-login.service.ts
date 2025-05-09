import jwt, { SignOptions } from "jsonwebtoken";
import { UnexpectedAuthError } from "../errors/auth.errors";
import type {
  UserFinder,
  Username,
} from "@backend/common/data-access/users.repository";
import type { SessionCreator } from "@backend/common/data-access/sessions.repository";
import type { SessionResult } from "@backend/common/data-access/sessions.repository";

type ServiceDependencies = {
  findUser: UserFinder<Username>;
  storeSession: SessionCreator;
  jwtSecret: string;
  jwtOptions: SignOptions;
};

export type GuestLoginService = (username: Username) => Promise<SessionResult>;

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
      { userId: user.id, username: user.username },
      jwtSecret,
      jwtOptions,
    );

    const session = await storeSession({
      userId: user.id,
      token,
    });

    return session;
  };
