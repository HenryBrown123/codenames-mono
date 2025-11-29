import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

// ============================================================================
// Types
// ============================================================================

export type AppLoggerConfig = {
  logFilePath: string;
  level: "debug" | "info" | "warn" | "error" | "http";
  logDir: string;
};

/**
 * these are front loaded in file logs, and enforced via types at compile time when
 * creating a new logger. Forces all logs to belong to a group. May rethink if list gets
 * too long.
 */
const LOG_SCOPE_KEYS = [
  "app",
  "module",
  "feature",
  "service",
  "controller",
  "api",
  "middleware",
] as const;

export type LogScope = {
  [K in (typeof LOG_SCOPE_KEYS)[number]]?: string;
};

export type LogMeta = Record<string, unknown>;

// ============================================================================
// Formats
// ============================================================================

const orderedFormat = winston.format.printf(({ level, message, timestamp, meta, ...rest }) => {
  const ordered: Record<string, unknown> = { timestamp, level };

  const knownKeys = new Set<string>(LOG_SCOPE_KEYS);

  for (const key of LOG_SCOPE_KEYS) {
    if (rest[key] !== undefined) ordered[key] = rest[key];
  }

  ordered.message = message;
  if (meta !== undefined) ordered.meta = meta;

  for (const [key, value] of Object.entries(rest)) {
    if (!knownKeys.has(key) && value !== undefined) {
      ordered[key] = value;
    }
  }

  return JSON.stringify(ordered);
});

// ============================================================================
// Classes
// ============================================================================

/**
 * Fluent builder for creating scoped AppLogger instances.
 * Accumulates scope and metadata until create() is called.
 */
export class LoggerBuilder {
  private logData: LogScope & { meta?: LogMeta } = {};

  constructor(private readonly logger: winston.Logger) {}

  /**
   * Adds structured scope fields to the logger
   */
  for(scope: LogScope): this {
    Object.assign(this.logData, scope);
    return this;
  }

  /**
   * Adds freeform metadata nested under 'meta' key
   */
  withMeta(meta: LogMeta): this {
    this.logData.meta ??= {};
    Object.assign(this.logData.meta, meta);
    return this;
  }

  /**
   * Creates the AppLogger instance with accumulated scope and metadata
   */
  create(): AppLogger {
    return new AppLogger(this.logger.child(this.logData));
  }
}

/**
 * Application logger wrapping winston with structured scope support
 */
export class AppLogger {
  constructor(private readonly logger: winston.Logger) {}

  info(message: string, meta?: LogMeta) {
    this.logger.info(message, meta);
  }
  warn(message: string, meta?: LogMeta) {
    this.logger.warn(message, meta);
  }
  error(message: string, meta?: LogMeta) {
    this.logger.error(message, meta);
  }
  debug(message: string, meta?: LogMeta) {
    this.logger.debug(message, meta);
  }
  http(message: string, meta?: LogMeta) {
    this.logger.http(message, meta);
  }

  /**
   * Creates a LoggerBuilder to configure a scoped child logger
   */
  for(scope: LogScope): LoggerBuilder {
    return new LoggerBuilder(this.logger).for(scope);
  }
}

// ============================================================================
// Factory
// ============================================================================

/**
 * Creates the root application logger with file rotation
 */
export const createAppLogger = (config: AppLoggerConfig): AppLogger => {
  const rootLogger = winston.createLogger({
    level: config.level,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
    ),
    transports: [
      new DailyRotateFile({
        filename: "codenames-backend-%DATE%.log.jsonl",
        dirname: config.logDir,
        datePattern: "YYYY-MM-DD",
        maxSize: "20m",
        maxFiles: "14d",
        zippedArchive: true,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          orderedFormat,
        ),
      }),
    ],
  });

  return new AppLogger(rootLogger);
};
