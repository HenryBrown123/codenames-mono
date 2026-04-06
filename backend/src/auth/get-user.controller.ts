import type { Response, NextFunction } from "express";
import type { Request } from "express-jwt";
import { Kysely } from "kysely";
import type { DB } from "@backend/shared/db/db.types";

/**
 * Dependencies for the get user controller
 */
export type Dependencies = {
  db: Kysely<DB>;
};

/**
 * Get user by username controller
 * Returns user information for the specified username
 */
export const getUserController =
  ({ db }: Dependencies) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username } = req.params;

      // Auth middleware already validated JWT and attached req.auth
      if (!req.auth) {
        res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
        return;
      }

      // Only allow users to get their own info
      if (req.auth.username !== username) {
        res.status(403).json({
          success: false,
          error: "Forbidden - You can only access your own user information",
        });
        return;
      }

      const user = await db
        .selectFrom("users")
        .select(["id", "username", "created_at"])
        .where("username", "=", username)
        .executeTakeFirst();

      if (!user) {
        res.status(404).json({
          success: false,
          error: "User not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          userId: user.id,
          username: user.username,
          createdAt: user.created_at,
        },
      });
    } catch (error) {
      next(error);
    }
  };
