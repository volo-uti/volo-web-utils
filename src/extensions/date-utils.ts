/**
 * Date utility functions.
 * All helpers use local time, never mutate their input, and treat an invalid Date as no match.
 */

function sameDate(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * True when the date falls on today.
 *
 * @example
 * isToday(new Date()) // true
 */
export function isToday(date: Date): boolean {
  return sameDate(date, new Date());
}

/**
 * True when the date falls on yesterday.
 *
 * @example
 * const d = new Date()
 * d.setDate(d.getDate() - 1)
 * isYesterday(d) // true
 */
export function isYesterday(date: Date): boolean {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return sameDate(date, d);
}

/**
 * True when the date falls on tomorrow.
 *
 * @example
 * const d = new Date()
 * d.setDate(d.getDate() + 1)
 * isTomorrow(d) // true
 */
export function isTomorrow(date: Date): boolean {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return sameDate(date, d);
}

/**
 * True when both dates fall on the same calendar day.
 *
 * @example
 * isSameDay(new Date(2024, 0, 1, 9), new Date(2024, 0, 1, 18)) // true
 */
export function isSameDay(a: Date, b: Date): boolean {
  return sameDate(a, b);
}

/**
 * True when the date is within the current week (Sunday to Saturday).
 *
 * @example
 * isThisWeek(new Date()) // true
 */
export function isThisWeek(date: Date): boolean {
  const now = new Date();
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const endOfWeek = new Date(
    startOfWeek.getFullYear(),
    startOfWeek.getMonth(),
    startOfWeek.getDate() + 7,
  );
  return date >= startOfWeek && date < endOfWeek;
}

/**
 * True when the date is within the current month.
 *
 * @example
 * isThisMonth(new Date()) // true
 */
export function isThisMonth(date: Date): boolean {
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

/**
 * True when the date is within the current year.
 *
 * @example
 * isThisYear(new Date()) // true
 */
export function isThisYear(date: Date): boolean {
  return date.getFullYear() === new Date().getFullYear();
}

/**
 * True when the date is a Saturday or Sunday.
 *
 * @example
 * isWeekend(new Date(2024, 0, 6)) // true (Saturday)
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * True when the date is Monday to Friday.
 * An invalid Date is neither weekday nor weekend.
 *
 * @example
 * isWeekday(new Date(2024, 0, 8)) // true (Monday)
 */
export function isWeekday(date: Date): boolean {
  const day = date.getDay();
  return day >= 1 && day <= 5;
}

/**
 * Returns a copy of the date set to 00:00:00.000.
 *
 * @example
 * startOfDay(new Date(2024, 0, 1, 15)) // 2024-01-01T00:00:00.000 local
 */
export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Returns a copy of the date set to 23:59:59.999.
 *
 * @example
 * endOfDay(new Date(2024, 0, 1)) // 2024-01-01T23:59:59.999 local
 */
export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Returns the first day of the date's month at 00:00:00.000.
 *
 * @example
 * startOfMonth(new Date(2024, 1, 15)) // 2024-02-01T00:00:00.000 local
 */
export function startOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setFullYear(d.getFullYear(), d.getMonth(), 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Returns the last day of the date's month at 23:59:59.999.
 *
 * @example
 * endOfMonth(new Date(2024, 1, 15)) // 2024-02-29T23:59:59.999 local
 */
export function endOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setFullYear(d.getFullYear(), d.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Returns a copy moved by whole months; negative goes back.
 * A day missing in the target month clamps to its last day.
 *
 * @example
 * addMonths(new Date(2024, 0, 31), 1) // 2024-02-29
 */
export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  d.setDate(Math.min(day, getDaysInMonth(d)));
  return d;
}

/**
 * Number of days in the date's month.
 *
 * @example
 * getDaysInMonth(new Date(2024, 1, 1)) // 29
 */
export function getDaysInMonth(date: Date): number {
  // setFullYear keeps years 0-99 as given; new Date(y, m, d) would map them to 1900-1999.
  const d = new Date(2000, 0, 1, 12);
  d.setFullYear(date.getFullYear(), date.getMonth() + 1, 0);
  return d.getDate();
}
