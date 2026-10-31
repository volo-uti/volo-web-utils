/**
 * String utility functions.
 */

// Pre-compiled regexes for performance and ReDoS safety
const RE_EMAIL =
  /^[a-zA-Z0-9_%+-]+(?:\.[a-zA-Z0-9_%+-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
const RE_STRONG_PASSWORD = /^(?=[\s\S]*[a-z])(?=[\s\S]*[A-Z])(?=[\s\S]*\d)[\s\S]{8,}$/;
const RE_KOREAN_PHONE = /^01[016789](?:-\d{3,4}-\d{4}|\d{7,8})$/;
const RE_HTTP_PREFIX = /^https?:\/\//i;
const RE_IPV4 = /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;

/**
 * Upper-cases the first character of a string.
 * It upper-cases the first code point; it does not title-case ('ß' becomes 'SS').
 *
 * @example
 * capitalize('volo') // 'Volo'
 */
export function capitalize(str: string): string {
  if (!str) return str;
  const first = String.fromCodePoint(str.codePointAt(0) as number);
  return first.toUpperCase() + str.slice(first.length);
}

/**
 * True when the string is null, undefined, empty or only whitespace.
 *
 * @example
 * isBlank('  ') // true
 */
export function isBlank(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

/**
 * True when the string has a non-whitespace character.
 *
 * @example
 * isNotBlank('a') // true
 */
export function isNotBlank(str: string | null | undefined): boolean {
  return !isBlank(str);
}

/**
 * True when the string is non-empty and has only the digits 0-9.
 *
 * @example
 * isNumeric('123') // true
 */
export function isNumeric(str: string): boolean {
  if (!str) return false;
  return /^\d+$/.test(str);
}

/**
 * True when the string is non-empty and has only ASCII letters.
 *
 * @example
 * isAlpha('abc') // true
 */
export function isAlpha(str: string): boolean {
  if (!str) return false;
  return /^[a-zA-Z]+$/.test(str);
}

/**
 * True when the string is non-empty and has only ASCII letters and digits.
 *
 * @example
 * isAlphanumeric('abc123') // true
 */
export function isAlphanumeric(str: string): boolean {
  if (!str) return false;
  return /^[a-zA-Z0-9]+$/.test(str);
}

/**
 * Pragmatic email shape check, not full RFC 5322 validation.
 * Every domain label may hold letters, digits and inner hyphens; the last label is letters only.
 * Empty dot parts ("a..b@x.com", ".a@x.com") and addresses over 254 characters are rejected.
 *
 * @example
 * isValidEmail('a@b.com') // true
 */
export function isValidEmail(str: string): boolean {
  if (!str || str.length > 254) return false;
  return RE_EMAIL.test(str);
}

/**
 * True when the string parses as an absolute http or https URL with a host.
 * The string must already be in canonical form: it starts with "http://" or "https://" and has
 * no surrounding whitespace, so what is validated is what gets stored.
 *
 * @example
 * isValidUrl('https://volo.dev') // true
 */
export function isValidUrl(str: string): boolean {
  if (!str || str.trim() !== str || !RE_HTTP_PREFIX.test(str)) return false;
  try {
    const url = new URL(str);
    return (url.protocol === "http:" || url.protocol === "https:") && url.hostname !== "";
  } catch {
    return false;
  }
}

/**
 * True when the string has 8+ characters with lower, upper and digit.
 * Any characters are allowed, newlines included.
 *
 * @example
 * isStrongPassword('Abcdefg1') // true
 */
export function isStrongPassword(str: string): boolean {
  if (!str) return false;
  return RE_STRONG_PASSWORD.test(str);
}

/**
 * True for a Korean mobile number such as 010-1234-5678 (hyphens optional).
 * Use hyphens at both places or at none: "010-12345678" is rejected.
 *
 * @example
 * isValidKoreanPhone('010-1234-5678') // true
 */
export function isValidKoreanPhone(str: string): boolean {
  if (!str) return false;
  return RE_KOREAN_PHONE.test(str);
}

/**
 * True when the string is a valid dotted-quad IPv4 address; IPv6 is not supported.
 * Leading zeros ("010.0.0.1") are rejected because parsers disagree on whether they mean octal.
 *
 * @example
 * isValidIpAddress('192.168.0.1') // true
 */
export function isValidIpAddress(str: string): boolean {
  if (!str) return false;
  return RE_IPV4.test(str);
}
