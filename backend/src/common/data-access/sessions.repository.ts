import { Kysely } from "kysely";
import { DB } from "../../common/db/db.types";

/** Session data structure */
export type Session = {
  userId: number;
  username: string;
  token: string;
};

/** Store a new session */
export const storeSession =
  (db: Kysely<DB>) =>
  async (userId: number, token: string): Promise<void> => {
    // In a stateless JWT implementation, this might be a no-op
    // For future expansion (e.g., if you want to track sessions or implement revocation)
    console.log(`Would store session for user ${userId}`);
    return Promise.resolve();
  };

/** Invalidate an existing session */
export const invalidateSession =
  (db: Kysely<DB>) =>
  async (userId: number): Promise<void> => {
    // In a stateless JWT implementation, this might be a no-op
    // For future expansion (e.g., implementing logout or token revocation)
    console.log(`Would invalidate sessions for user ${userId}`);
    return Promise.resolve();
  };
