import type { Kysely, Transaction } from "kysely";
import type { DB } from "../db/db.types";

export type DbContext = Kysely<DB>;
export type TransactionContext = Transaction<DB>;

export type TransactionalHandler<TOperations, TResult> = (
  operation: (ops: TOperations) => Promise<TResult>,
) => Promise<TResult>;

export const createTransactionalHandler = <TOperations>(
  db: DbContext,
  createOperations: (trx: TransactionContext) => TOperations,
): TransactionalHandler<TOperations, any> => {
  return async <TResult>(
    operation: (ops: TOperations) => Promise<TResult>,
  ): Promise<TResult> => {
    return await db.transaction().execute(async (trx) => {
      const operations = createOperations(trx);
      return await operation(operations);
    });
  };
};
