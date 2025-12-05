import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import util from "util";

// ============================================================================
// Types
// ============================================================================

export type LogLevel = "debug" | "info" | "warn" | "error" | "http";

export type AppLoggerConfig = {
  logFilePath: string;
  level: LogLevel;
  consoleLevel: LogLevel | "silent";
  logDir: string;
};

const LOG_SCOPE_KEYS = [
  "app",
  "module",
  "feature",
  "service",
  "controller",
  "api",
  "middleware",
  "server",
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

export const consoleFormat = winston.format.printf(
  ({ level, message, timestamp, meta, ...rest }) => {
    const scope = LOG_SCOPE_KEYS.filter((key) => rest[key] !== undefined)
      .map((key) => rest[key])
      .join(":");

    const prefix = scope ? `[${scope}] ` : "";

    const metaStr = meta
      ? `\n  ↳ ${util.inspect(meta, { colors: true, depth: null }).replace(/\n/g, "\n    ")}`
      : "";

    return `${timestamp} ${level} ${prefix}${message}${metaStr}`;
  },
);

// ============================================================================
// Classes
// ============================================================================

/**
 * Builder for creating scoped AppLogger instances.
 * Accumulates scope other props until create() is called.
 */
export class LoggerBuilder {
  private logData: LogScope & { meta?: LogMeta } = {};
  private consoleOverride?: LogLevel;

  constructor(private readonly logger: winston.Logger) {}

  for(scope: LogScope): this {
    Object.assign(this.logData, scope);
    return this;
  }

  withMeta(meta: LogMeta): this {
    this.logData.meta ??= {};
    Object.assign(this.logData.meta, meta);
    return this;
  }

  toConsole(level: LogLevel = "info"): this {
    this.consoleOverride = level;
    return this;
  }

  create(): AppLogger {
    const childLogger = this.logger.child(this.logData);
    return new AppLogger(childLogger);
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
 * Creates the root application logger with file rotation and optional console output
 */
export const createAppLogger = (config: AppLoggerConfig): AppLogger => {
  const transports: winston.transport[] = [
    new DailyRotateFile({
      filename: "codenames-backend-%DATE%.log.jsonl",
      dirname: config.logDir,
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "2d",
      zippedArchive: true,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        orderedFormat,
      ),
    }),
  ];

  if (config.consoleLevel !== "silent") {
    console.log(`[logger] Creating console transport with level: ${config.consoleLevel}`);

    transports.push(
      new winston.transports.Console({
        level: config.consoleLevel,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          consoleFormat,
        ),
      }),
    );
  }

  const rootLogger = winston.createLogger({
    level: config.level,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
    ),
    transports,
  });

  return new AppLogger(rootLogger);
};
