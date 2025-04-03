import { SignOptions } from "jsonwebtoken";

/**
 * JWT configuration options
 */
export interface JwtConfig {
  secret: string;
  options: SignOptions;
}

/**
 * Create JWT configuration with default values
 */
export const createJwtConfig = (
  secret: string = process.env.JWT_SECRET || "your-secret-key",
  options: Partial<SignOptions> = {},
): JwtConfig => {
  return {
    secret,
    options: {
      expiresIn: "7d",
      algorithm: "HS256",
      issuer: "codenames-app",
      ...options,
    },
  };
};
