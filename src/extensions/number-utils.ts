/**
 * Number utility functions.
 * Formatting is left to Intl.NumberFormat.
 */

/**
 * True when the value lies between min and max, inclusive; NaN is never between.
 *
 * @example
 * isBetween(5, 1, 10) // true
 */
export function isBetween(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Limits a number to the range from min to max.
 * Pass min <= max: with min > max the result is max. A NaN value stays NaN.
 *
 * @example
 * clampTo(15, 0, 10) // 10
 */
export function clampTo(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
