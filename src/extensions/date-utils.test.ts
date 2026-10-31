import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  addMonths,
  endOfDay,
  endOfMonth,
  getDaysInMonth,
  isSameDay,
  isThisMonth,
  isThisWeek,
  isThisYear,
  isToday,
  isTomorrow,
  isWeekday,
  isWeekend,
  isYesterday,
  startOfDay,
  startOfMonth,
} from "./date-utils";

// Wednesday 2024-05-15 12:00 local time.
const NOW = new Date(2024, 4, 15, 12, 0, 0);
const invalid = new Date("nope");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});
afterEach(() => {
  vi.useRealTimers();
});

describe("relative-day predicates", () => {
  it("isToday", () => {
    expect(isToday(new Date(2024, 4, 15, 0, 0))).toBe(true);
    expect(isToday(new Date(2024, 4, 15, 23, 59))).toBe(true);
    expect(isToday(new Date(2024, 4, 14, 23, 59))).toBe(false);
    expect(isToday(invalid)).toBe(false);
  });
  it("isYesterday / isTomorrow", () => {
    expect(isYesterday(new Date(2024, 4, 14, 8))).toBe(true);
    expect(isYesterday(NOW)).toBe(false);
    expect(isTomorrow(new Date(2024, 4, 16, 8))).toBe(true);
    expect(isTomorrow(NOW)).toBe(false);
    expect(isYesterday(invalid)).toBe(false);
    expect(isTomorrow(invalid)).toBe(false);
  });
  it("crosses month and year boundaries", () => {
    vi.setSystemTime(new Date(2024, 0, 1, 10));
    expect(isYesterday(new Date(2023, 11, 31, 10))).toBe(true);
    vi.setSystemTime(new Date(2023, 11, 31, 10));
    expect(isTomorrow(new Date(2024, 0, 1, 10))).toBe(true);
  });
});

describe("isSameDay", () => {
  it("ignores the time of day", () => {
    expect(isSameDay(new Date(2024, 0, 1, 0, 0), new Date(2024, 0, 1, 23, 59))).toBe(true);
  });
  it("distinguishes day, month and year", () => {
    expect(isSameDay(new Date(2024, 0, 1), new Date(2024, 0, 2))).toBe(false);
    expect(isSameDay(new Date(2024, 0, 1), new Date(2024, 1, 1))).toBe(false);
    expect(isSameDay(new Date(2024, 0, 1), new Date(2025, 0, 1))).toBe(false);
    expect(isSameDay(invalid, invalid)).toBe(false);
  });
});

describe("isThisWeek", () => {
  it("spans Sunday to Saturday of the current week", () => {
    expect(isThisWeek(new Date(2024, 4, 12, 0, 0))).toBe(true); // Sunday
    expect(isThisWeek(new Date(2024, 4, 18, 23, 59))).toBe(true); // Saturday
    expect(isThisWeek(new Date(2024, 4, 11, 23, 59))).toBe(false);
    expect(isThisWeek(new Date(2024, 4, 19, 0, 0))).toBe(false);
    expect(isThisWeek(invalid)).toBe(false);
  });
  it("works when the week crosses a month boundary", () => {
    vi.setSystemTime(new Date(2024, 4, 1, 12)); // Wednesday
    expect(isThisWeek(new Date(2024, 3, 28))).toBe(true);
    expect(isThisWeek(new Date(2024, 4, 4))).toBe(true);
    expect(isThisWeek(new Date(2024, 4, 5))).toBe(false);
  });
  it("does not mutate the clock", () => {
    isThisWeek(NOW);
    expect(new Date().getTime()).toBe(NOW.getTime());
  });
});

describe("isThisMonth / isThisYear", () => {
  it("isThisMonth", () => {
    expect(isThisMonth(new Date(2024, 4, 1))).toBe(true);
    expect(isThisMonth(new Date(2024, 4, 31))).toBe(true);
    expect(isThisMonth(new Date(2024, 3, 30))).toBe(false);
    expect(isThisMonth(new Date(2023, 4, 15))).toBe(false);
    expect(isThisMonth(invalid)).toBe(false);
  });
  it("isThisYear", () => {
    expect(isThisYear(new Date(2024, 0, 1))).toBe(true);
    expect(isThisYear(new Date(2023, 11, 31))).toBe(false);
    expect(isThisYear(invalid)).toBe(false);
  });
});

describe("isWeekend / isWeekday", () => {
  it("classifies each day of a week", () => {
    // 2024-05-12 is a Sunday.
    const days = [0, 1, 2, 3, 4, 5, 6].map((i) => new Date(2024, 4, 12 + i));
    expect(days.map(isWeekend)).toEqual([true, false, false, false, false, false, true]);
    expect(days.map(isWeekday)).toEqual([false, true, true, true, true, true, false]);
  });
  it("treats an invalid date as neither", () => {
    expect(isWeekend(invalid)).toBe(false);
    expect(isWeekday(invalid)).toBe(false);
  });
});

describe("startOfDay / endOfDay", () => {
  it("returns copies at the day boundaries", () => {
    const input = new Date(2024, 4, 15, 13, 45, 12, 345);
    const before = input.getTime();
    expect(startOfDay(input)).toEqual(new Date(2024, 4, 15, 0, 0, 0, 0));
    expect(endOfDay(input)).toEqual(new Date(2024, 4, 15, 23, 59, 59, 999));
    expect(input.getTime()).toBe(before);
  });
  it("keeps an invalid date invalid", () => {
    expect(startOfDay(invalid).getTime()).toBeNaN();
    expect(endOfDay(invalid).getTime()).toBeNaN();
  });
});

describe("startOfMonth / endOfMonth", () => {
  it("handles a 31-day month", () => {
    const input = new Date(2024, 4, 15, 9);
    expect(startOfMonth(input)).toEqual(new Date(2024, 4, 1, 0, 0, 0, 0));
    expect(endOfMonth(input)).toEqual(new Date(2024, 4, 31, 23, 59, 59, 999));
  });
  it("handles leap and non-leap February", () => {
    expect(endOfMonth(new Date(2024, 1, 10)).getDate()).toBe(29);
    expect(endOfMonth(new Date(2023, 1, 10)).getDate()).toBe(28);
    expect(endOfMonth(new Date(1900, 1, 10)).getDate()).toBe(28);
    expect(endOfMonth(new Date(2000, 1, 10)).getDate()).toBe(29);
  });
  it("handles December", () => {
    expect(endOfMonth(new Date(2024, 11, 5))).toEqual(new Date(2024, 11, 31, 23, 59, 59, 999));
  });
  it("does not mutate the input", () => {
    const input = new Date(2024, 4, 15);
    startOfMonth(input);
    endOfMonth(input);
    expect(input).toEqual(new Date(2024, 4, 15));
  });
});

describe("addMonths", () => {
  it("moves forward and back", () => {
    expect(addMonths(new Date(2024, 4, 15), 1)).toEqual(new Date(2024, 5, 15));
    expect(addMonths(new Date(2024, 4, 15), -5)).toEqual(new Date(2023, 11, 15));
    expect(addMonths(new Date(2024, 4, 15), 0)).toEqual(new Date(2024, 4, 15));
  });
  it("crosses year boundaries", () => {
    expect(addMonths(new Date(2024, 10, 30), 3)).toEqual(new Date(2025, 1, 28));
    expect(addMonths(new Date(2024, 0, 15), 24)).toEqual(new Date(2026, 0, 15));
  });
  it("clamps to the end of a shorter month instead of overflowing", () => {
    expect(addMonths(new Date(2024, 0, 31), 1)).toEqual(new Date(2024, 1, 29));
    expect(addMonths(new Date(2023, 0, 31), 1)).toEqual(new Date(2023, 1, 28));
    expect(addMonths(new Date(2024, 2, 31), -1)).toEqual(new Date(2024, 1, 29));
    expect(addMonths(new Date(2024, 7, 31), 1)).toEqual(new Date(2024, 8, 30));
  });
  it("keeps the time of day", () => {
    expect(addMonths(new Date(2024, 0, 31, 13, 5, 6, 7), 1)).toEqual(
      new Date(2024, 1, 29, 13, 5, 6, 7),
    );
  });
  it("does not mutate the input", () => {
    const input = new Date(2024, 0, 31);
    addMonths(input, 1);
    expect(input).toEqual(new Date(2024, 0, 31));
  });
  it("keeps an invalid date invalid", () => {
    expect(addMonths(invalid, 1).getTime()).toBeNaN();
  });
});

describe("getDaysInMonth", () => {
  it("returns the length of each month", () => {
    const lengths = Array.from({ length: 12 }, (_, m) => getDaysInMonth(new Date(2023, m, 1)));
    expect(lengths).toEqual([31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]);
  });
  it("handles leap years", () => {
    expect(getDaysInMonth(new Date(2024, 1, 1))).toBe(29);
    expect(getDaysInMonth(new Date(1900, 1, 1))).toBe(28);
  });
  it("returns NaN for an invalid date", () => {
    expect(getDaysInMonth(invalid)).toBeNaN();
  });
});

describe("years 0-99", () => {
  const inYear = (year: number, month: number, day: number): Date => {
    const d = new Date(2000, 0, 1, 12);
    d.setFullYear(year, month, day);
    return d;
  };
  it("startOfMonth keeps the year", () => {
    const r = startOfMonth(inYear(50, 4, 17));
    expect([r.getFullYear(), r.getMonth(), r.getDate(), r.getHours()]).toEqual([50, 4, 1, 0]);
  });
  it("endOfMonth keeps the year", () => {
    const r = endOfMonth(inYear(50, 1, 3));
    expect([r.getFullYear(), r.getMonth(), r.getDate(), r.getHours()]).toEqual([50, 1, 28, 23]);
  });
  it("getDaysInMonth treats year 0 as a leap year", () => {
    expect(getDaysInMonth(inYear(0, 1, 10))).toBe(29);
    expect(getDaysInMonth(inYear(1, 1, 10))).toBe(28);
  });
  it("addMonths keeps the year", () => {
    const r = addMonths(inYear(50, 0, 31), 1);
    expect([r.getFullYear(), r.getMonth(), r.getDate()]).toEqual([50, 1, 28]);
  });
  it("do not mutate the input", () => {
    const input = inYear(50, 4, 17);
    const time = input.getTime();
    startOfMonth(input);
    endOfMonth(input);
    getDaysInMonth(input);
    expect(input.getTime()).toBe(time);
  });
  it("keep an invalid date invalid", () => {
    expect(startOfMonth(invalid).getTime()).toBeNaN();
    expect(endOfMonth(invalid).getTime()).toBeNaN();
  });
});
