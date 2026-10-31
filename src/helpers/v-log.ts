/**
 * Development logging utility.
 * Only outputs in development mode.
 */

/* eslint-disable no-console -- VLog is the console wrapper */

/**
 * True unless NODE_ENV is "production". A runtime without `process` counts as development.
 * `process.env.NODE_ENV` is written out in full so bundlers can replace it at build time.
 */
function isDev(): boolean {
  try {
    return process.env.NODE_ENV !== "production";
  } catch {
    return true;
  }
}

/** Text for an error value; never throws, whatever the value is. */
function describeError(error: unknown): string {
  if (error instanceof Error) {
    const text = error.stack ?? error.message;
    return error.cause === undefined ? text : `${text}\nCaused by: ${describeError(error.cause)}`;
  }
  if (typeof error === "string") return error;
  try {
    const json = JSON.stringify(error);
    if (typeof json === "string") return json;
  } catch {
    // Not serializable (cycles, BigInt, throwing toJSON): fall through to String().
  }
  try {
    return String(error);
  } catch {
    return Object.prototype.toString.call(error);
  }
}

/**
 * Development-only logger (debug, info, warn, error) that is silent in production.
 * It reads NODE_ENV on every call and treats a runtime without `process` as development.
 * error() logs an Error with its stack and cause, and never throws on odd values.
 *
 * @example
 * VLog.info('loaded', 'Auth') // [Auth] loaded
 */
export const VLog = {
  debug(message: string, title?: string): void {
    if (!isDev()) return;
    console.debug(title ? `[${title}] ${message}` : message);
  },

  info(message: string, title?: string): void {
    if (!isDev()) return;
    console.info(title ? `[${title}] ${message}` : message);
  },

  warn(message: string, title?: string): void {
    if (!isDev()) return;
    console.warn(title ? `[${title}] ${message}` : message);
  },

  error(error: unknown, title?: string): void {
    if (!isDev()) return;
    const message = describeError(error);
    console.error(title ? `[${title}] ${message}` : message);
  },
};
