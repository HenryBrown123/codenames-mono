import jwt, { SignOptions } from "jsonwebtoken";
import { UnexpectedAuthError } from "../errors/auth.errors";
import { findByUsername } from "@backend/common/data-access/users.repository";
import { storeSession } from "@backend/common/data-access/sessions.repository";
import type { Session } from "@backend/common/data-access/sessions.repository";

type ServiceDependencies = {
  findUser: ReturnType<typeof findByUsername>;
  storeSession: ReturnType<typeof storeSession>;
  jwtSecret: string;
  jwtOptions: SignOptions;
};

export const guestLoginService =
  ({ findUser, storeSession, jwtSecret, jwtOptions }: ServiceDependencies) =>
  async (username: string): Promise<Session> => {
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

    await storeSession(user.id, token);

    return {
      userId: user.id,
      username: user.username,
      token,
    };
  };
