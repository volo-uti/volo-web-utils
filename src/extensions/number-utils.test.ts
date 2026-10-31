import { describe, expect, it } from "vitest";
import { clampTo, isBetween } from "./number-utils";

describe("isBetween", () => {
  it("is inclusive on both ends", () => {
    expect(isBetween(1, 1, 10)).toBe(true);
    expect(isBetween(10, 1, 10)).toBe(true);
    expect(isBetween(5, 1, 10)).toBe(true);
  });
  it("rejects values outside the range", () => {
    expect(isBetween(0.99, 1, 10)).toBe(false);
    expect(isBetween(10.01, 1, 10)).toBe(false);
  });
  it("handles negative ranges", () => {
    expect(isBetween(-5, -10, -1)).toBe(true);
    expect(isBetween(0, -10, -1)).toBe(false);
  });
  it("never matches NaN", () => {
    expect(isBetween(NaN, 0, 10)).toBe(false);
  });
});

describe("clampTo", () => {
  it("limits to both ends", () => {
    expect(clampTo(15, 0, 10)).toBe(10);
    expect(clampTo(-5, 0, 10)).toBe(0);
    expect(clampTo(5, 0, 10)).toBe(5);
  });
  it("works with negative bounds", () => {
    expect(clampTo(-20, -10, -1)).toBe(-10);
    expect(clampTo(0, -10, -1)).toBe(-1);
  });
  it("passes NaN through", () => {
    expect(clampTo(NaN, 0, 10)).toBeNaN();
  });
  it("returns max when min is greater than max", () => {
    expect(clampTo(5, 10, 0)).toBe(0);
    expect(clampTo(-5, 10, 0)).toBe(0);
    expect(clampTo(50, 10, 0)).toBe(0);
  });
});
