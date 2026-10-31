import { describe, expect, it } from "vitest";
import {
  getOrDefault,
  invert,
  mapKeys,
  mapValues,
  merge,
  omit,
  omitNullish,
  pick,
} from "./map-utils";

const polluted = JSON.parse('{"__proto__": {"x": 1}, "ok": 1}') as Record<string, unknown>;

describe("getOrDefault", () => {
  it("reads present values, including falsy ones", () => {
    expect(getOrDefault({ a: 0 }, "a", 5)).toBe(0);
    expect(getOrDefault({ a: "" }, "a", "x")).toBe("");
    expect(getOrDefault({ a: false }, "a", true)).toBe(false);
  });
  it("falls back for missing or nullish values", () => {
    expect(getOrDefault<number | null>({ a: null }, "a", 5)).toBe(5);
    expect(getOrDefault<number | undefined>({ a: undefined }, "a", 5)).toBe(5);
    expect(getOrDefault<number>({}, "b", 5)).toBe(5);
  });
  it("ignores inherited and unsafe keys", () => {
    expect(getOrDefault<unknown, string>({}, "toString", "d")).toBe("d");
    expect(getOrDefault<unknown, string>({}, "constructor", "d")).toBe("d");
    expect(getOrDefault<unknown, string>(polluted, "__proto__", "d")).toBe("d");
  });
});

describe("pick", () => {
  it("keeps only the listed keys", () => {
    expect(pick({ a: 1, b: 2, c: 3 }, ["a", "c"])).toEqual({ a: 1, c: 3 });
  });
  it("skips listed keys that are missing", () => {
    const obj: { a: number; b?: number } = { a: 1 };
    expect(pick(obj, ["a", "b"])).toEqual({ a: 1 });
    expect("b" in pick(obj, ["b"])).toBe(false);
  });
  it("keeps explicit undefined values", () => {
    expect(pick({ a: undefined }, ["a"])).toEqual({ a: undefined });
  });
  it("skips inherited and unsafe keys", () => {
    expect(pick({} as Record<string, unknown>, ["toString"])).toEqual({});
    expect(pick(polluted, ["__proto__", "ok"])).toEqual({ ok: 1 });
  });
  it("returns a new object and an empty one for no keys", () => {
    const input = { a: 1 };
    expect(pick(input, ["a"])).not.toBe(input);
    expect(pick(input, [])).toEqual({});
  });
});

describe("omit", () => {
  it("drops the listed keys", () => {
    expect(omit({ a: 1, b: 2, c: 3 }, ["b"])).toEqual({ a: 1, c: 3 });
  });
  it("ignores listed keys that are missing", () => {
    expect(omit({ a: 1 } as { a: number; b?: number }, ["b"])).toEqual({ a: 1 });
  });
  it("does not mutate the input", () => {
    const input = { a: 1, b: 2 };
    omit(input, ["a"]);
    expect(input).toEqual({ a: 1, b: 2 });
  });
  it("drops unsafe keys from the copy", () => {
    const result = omit(polluted, []);
    expect(result).toEqual({ ok: 1 });
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
  });
});

describe("mapValues", () => {
  it("transforms every value and passes the key", () => {
    expect(mapValues({ a: 1, b: 2 }, (v) => v * 2)).toEqual({ a: 2, b: 4 });
    expect(mapValues({ a: 1 }, (v, k) => `${k}${v}`)).toEqual({ a: "a1" });
  });
  it("returns an empty object for an empty input", () => {
    expect(mapValues({}, (v) => v)).toEqual({});
  });
  it("skips unsafe keys", () => {
    expect(mapValues(polluted, (v) => v)).toEqual({ ok: 1 });
  });
});

describe("mapKeys", () => {
  it("transforms every key", () => {
    expect(mapKeys({ a: 1, b: 2 }, (k) => k.toUpperCase())).toEqual({ A: 1, B: 2 });
  });
  it("lets later entries win on a key clash", () => {
    expect(mapKeys({ a: 1, b: 2 }, () => "k")).toEqual({ k: 2 });
  });
  it("refuses to create an unsafe key", () => {
    expect(mapKeys({ a: 1, b: 2 }, (k) => (k === "a" ? "__proto__" : k))).toEqual({ b: 2 });
  });
});

describe("omitNullish", () => {
  it("drops null and undefined but keeps falsy values", () => {
    expect(omitNullish({ a: 0, b: "", c: false, d: null, e: undefined, f: NaN })).toEqual({
      a: 0,
      b: "",
      c: false,
      f: NaN,
    });
  });
  it("skips unsafe keys", () => {
    expect(omitNullish(polluted)).toEqual({ ok: 1 });
  });
});

describe("merge", () => {
  it("lays source over target", () => {
    expect(merge({ a: 1, b: 2 }, { b: 3, c: 4 })).toEqual({ a: 1, b: 3, c: 4 });
  });
  it("is shallow and does not mutate", () => {
    const target = { a: { n: 1 } };
    const result = merge(target, { b: { n: 2 } });
    expect(result.a).toBe(target.a);
    expect(target).toEqual({ a: { n: 1 } });
  });
  it("does not pollute the prototype", () => {
    const result = merge({ a: 1 }, polluted as Record<string, number>);
    expect(result).toEqual({ a: 1, ok: 1 });
    expect(({} as Record<string, unknown>).x).toBeUndefined();
  });
});

describe("invert", () => {
  it("swaps keys and values, stringifying numbers", () => {
    expect(invert({ a: "x", b: "y" })).toEqual({ x: "a", y: "b" });
    expect(invert({ a: 1, b: 2 })).toEqual({ "1": "a", "2": "b" });
  });
  it("lets later keys win on equal values", () => {
    expect(invert({ a: "x", b: "x" })).toEqual({ x: "b" });
  });
  it("refuses unsafe resulting keys", () => {
    expect(invert({ a: "__proto__", b: "ok" })).toEqual({ ok: "b" });
  });
});

describe("keys named constructor and prototype", () => {
  const data = JSON.parse('{"constructor": 5, "prototype": 6, "a": 1}') as Record<string, number>;
  it("are kept as ordinary data by every helper", () => {
    expect(omit(data, [])).toEqual({ constructor: 5, prototype: 6, a: 1 });
    expect(mapValues(data, (v) => v)).toEqual({ constructor: 5, prototype: 6, a: 1 });
    expect(mapKeys(data, (k) => k)).toEqual({ constructor: 5, prototype: 6, a: 1 });
    expect(omitNullish(data)).toEqual({ constructor: 5, prototype: 6, a: 1 });
    expect(merge(data, { b: 2 })).toEqual({ constructor: 5, prototype: 6, a: 1, b: 2 });
    expect(pick(data, ["constructor"])).toEqual({ constructor: 5 });
    expect(getOrDefault(data, "constructor", 0)).toBe(5);
    expect(invert({ a: "constructor" })).toEqual({ constructor: "a" });
  });
  it("do not reach the prototype of the result", () => {
    const result = merge(data, {});
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(Object.hasOwn(result, "constructor")).toBe(true);
  });
});

describe("symbol keys", () => {
  const tag = Symbol("tag");
  it("omit keeps an unlisted symbol key, as pick does", () => {
    const input = { a: 1, b: 2, [tag]: 3 };
    expect(omit(input, ["a"])[tag]).toBe(3);
    expect(pick(input, [tag])[tag]).toBe(3);
  });
  it("omit drops a listed symbol key", () => {
    const input = { a: 1, [tag]: 3 };
    expect(Object.getOwnPropertySymbols(omit(input, [tag]))).toEqual([]);
  });
  it("omit skips non-enumerable keys", () => {
    const input = Object.defineProperty({ a: 1 }, "hidden", { value: 2, enumerable: false });
    expect(Object.hasOwn(omit(input, []), "hidden")).toBe(false);
  });
});
