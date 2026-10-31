/**
 * Map/Object utility functions.
 * Every helper returns a new object, never mutates its input, and skips the "__proto__" key.
 * Keys named "constructor" or "prototype" are ordinary data and are kept.
 */

function isSafeKey(key: string): boolean {
  return key !== "__proto__";
}

/**
 * Reads an own key, or the default when missing, nullish or unsafe.
 *
 * @example
 * getOrDefault({ a: 1 }, 'b', 0) // 0
 */
export function getOrDefault<V, D = V>(
  obj: Record<string, V>,
  key: string,
  defaultValue: D,
): V | D {
  if (!isSafeKey(key) || !Object.hasOwn(obj, key)) return defaultValue;
  return obj[key] ?? defaultValue;
}

/**
 * Returns a new object with only the given keys that exist on the object.
 *
 * @example
 * pick({ a: 1, b: 2 }, ['a']) // { a: 1 }
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Pick<T, K> {
  const result: Partial<T> = {};
  for (const key of keys) {
    if (typeof key === "string" && !isSafeKey(key)) continue;
    if (Object.hasOwn(obj, key)) result[key] = obj[key];
  }
  return result as Pick<T, K>;
}

/**
 * Returns a new object without the given keys.
 * Own enumerable symbol keys that are not listed are kept, as `pick` keeps them.
 *
 * @example
 * omit({ a: 1, b: 2 }, ['a']) // { b: 2 }
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Omit<T, K> {
  const skip = new Set<PropertyKey>(keys);
  const result: Record<PropertyKey, unknown> = {};
  for (const key of Reflect.ownKeys(obj)) {
    if (skip.has(key) || (typeof key === "string" && !isSafeKey(key))) continue;
    if (Object.prototype.propertyIsEnumerable.call(obj, key)) {
      result[key] = (obj as Record<PropertyKey, unknown>)[key];
    }
  }
  return result as Omit<T, K>;
}

/**
 * Returns a new object with each value transformed by the function.
 *
 * @example
 * mapValues({ a: 1 }, (v) => v * 2) // { a: 2 }
 */
export function mapValues<T, U>(
  obj: Record<string, T>,
  fn: (value: T, key: string) => U,
): Record<string, U> {
  const result: Record<string, U> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (isSafeKey(key)) result[key] = fn(value, key);
  }
  return result;
}

/**
 * Returns a new object with each key transformed by the function.
 * Later keys win on a clash.
 *
 * @example
 * mapKeys({ a: 1 }, (k) => k.toUpperCase()) // { A: 1 }
 */
export function mapKeys<T>(obj: Record<string, T>, fn: (key: string) => string): Record<string, T> {
  const result: Record<string, T> = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = fn(key);
    if (isSafeKey(newKey)) result[newKey] = value;
  }
  return result;
}

/**
 * Returns a new object without the entries whose value is null or undefined.
 *
 * @example
 * omitNullish({ a: 1, b: null }) // { a: 1 }
 */
export function omitNullish<T>(obj: Record<string, T | null | undefined>): Record<string, T> {
  const result: Record<string, T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value != null && isSafeKey(key)) result[key] = value;
  }
  return result;
}

/**
 * Returns a new object with the source entries laid over the target (shallow).
 *
 * @example
 * merge({ a: 1 }, { a: 2, b: 3 }) // { a: 2, b: 3 }
 */
export function merge<T>(target: Record<string, T>, source: Record<string, T>): Record<string, T> {
  const result: Record<string, T> = {};
  for (const [key, value] of [...Object.entries(target), ...Object.entries(source)]) {
    if (isSafeKey(key)) result[key] = value;
  }
  return result;
}

/**
 * Returns a new object with keys and values swapped.
 * Later keys win on equal values.
 *
 * @example
 * invert({ a: 'x' }) // { x: 'a' }
 */
export function invert(obj: Record<string, string | number>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const swapped = String(value);
    if (isSafeKey(swapped)) result[swapped] = key;
  }
  return result;
}
