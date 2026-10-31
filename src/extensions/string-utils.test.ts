import { describe, expect, it } from "vitest";
import {
  capitalize,
  isAlpha,
  isAlphanumeric,
  isBlank,
  isNotBlank,
  isNumeric,
  isStrongPassword,
  isValidEmail,
  isValidIpAddress,
  isValidKoreanPhone,
  isValidUrl,
} from "./string-utils";

describe("capitalize", () => {
  it("upper-cases only the first character", () => {
    expect(capitalize("volo design")).toBe("Volo design");
    expect(capitalize("Volo")).toBe("Volo");
  });
  it("returns an empty string unchanged", () => {
    expect(capitalize("")).toBe("");
  });
  it("leaves a non-letter first character alone", () => {
    expect(capitalize("1abc")).toBe("1abc");
  });
  it("upper-cases a first character outside the BMP", () => {
    expect(capitalize("\u{10428}ab")).toBe("\u{10400}ab");
  });
  it("keeps a lone surrogate first character", () => {
    expect(capitalize("\ud801ab")).toBe("\ud801ab");
  });
});

describe("isBlank / isNotBlank", () => {
  it.each([null, undefined, "", " ", "\t\n  "])("treats %j as blank", (v) => {
    expect(isBlank(v)).toBe(true);
    expect(isNotBlank(v)).toBe(false);
  });
  it.each(["a", " a ", "0"])("treats %j as not blank", (v) => {
    expect(isBlank(v)).toBe(false);
    expect(isNotBlank(v)).toBe(true);
  });
});

describe("isNumeric / isAlpha / isAlphanumeric", () => {
  it("isNumeric accepts digits only", () => {
    expect(isNumeric("0123")).toBe(true);
    expect(isNumeric("")).toBe(false);
    expect(isNumeric("12a")).toBe(false);
    expect(isNumeric("-1")).toBe(false);
    expect(isNumeric("1.5")).toBe(false);
    expect(isNumeric("12\n")).toBe(false);
  });
  it("isAlpha accepts ASCII letters only", () => {
    expect(isAlpha("abcXYZ")).toBe(true);
    expect(isAlpha("")).toBe(false);
    expect(isAlpha("abc1")).toBe(false);
    expect(isAlpha("日本語")).toBe(false);
  });
  it("isAlphanumeric accepts ASCII letters and digits only", () => {
    expect(isAlphanumeric("abc123")).toBe(true);
    expect(isAlphanumeric("")).toBe(false);
    expect(isAlphanumeric("abc 123")).toBe(false);
    expect(isAlphanumeric("abc_1")).toBe(false);
  });
});

describe("isValidEmail", () => {
  it.each([
    "a@b.co",
    "first.last+tag@sub.example.com",
    "x_y%z@a-b.io",
    "user@mail.my-company.com",
    "user@mail.example2.com",
    "user@a.b.com",
    "user@x.123.com",
  ])("accepts %s", (v) => {
    expect(isValidEmail(v)).toBe(true);
  });
  it.each([
    "",
    "plain",
    "@b.com",
    "a@",
    "a@b",
    "a@b.c",
    "a b@c.com",
    "a@-b.com",
    "a@b..com",
    "a..b@x.com",
    ".a@x.com",
    "a.@x.com",
    "a@x.com.",
    "a@b-.com",
  ])("rejects %j", (v) => {
    expect(isValidEmail(v)).toBe(false);
  });
  it("rejects addresses longer than 254 characters", () => {
    expect(isValidEmail(`${"a".repeat(250)}@b.com`)).toBe(false);
    expect(isValidEmail(`${"a".repeat(64)}@b.com`)).toBe(true);
  });
});

describe("isValidUrl", () => {
  it.each(["http://a.com", "https://a.com/path?q=1#h", "https://localhost:3000"])(
    "accepts %s",
    (v) => {
      expect(isValidUrl(v)).toBe(true);
    },
  );
  it.each([
    "",
    "a.com",
    "ftp://a.com",
    "javascript:alert(1)",
    "https://",
    "http:",
    "not a url",
    "http:/example.com",
    "https:example.com",
    "  https://x.com  ",
    "https://x.com\n",
  ])("rejects %j", (v) => {
    expect(isValidUrl(v)).toBe(false);
  });
});

describe("isStrongPassword", () => {
  it("accepts 8+ chars with lower, upper and digit", () => {
    expect(isStrongPassword("Abcdefg1")).toBe(true);
    expect(isStrongPassword("A1b!@#$%^&*")).toBe(true);
  });
  it.each(["", "Abcde1", "abcdefg1", "ABCDEFG1", "Abcdefgh"])("rejects %j", (v) => {
    expect(isStrongPassword(v)).toBe(false);
  });
  it("accepts a password that contains a line break", () => {
    expect(isStrongPassword("Abcd\nefg1")).toBe(true);
    expect(isStrongPassword("abcd\nEFG1")).toBe(true);
  });
  it("still needs every class when a line break is present", () => {
    expect(isStrongPassword("abcd\nefg1")).toBe(false);
  });
});

describe("isValidKoreanPhone", () => {
  it.each(["010-1234-5678", "01012345678", "011-123-4567", "016-1234-5678"])("accepts %s", (v) => {
    expect(isValidKoreanPhone(v)).toBe(true);
  });
  it.each([
    "",
    "02-1234-5678",
    "010-12-5678",
    "010-1234-567",
    "012-1234-5678",
    "+82 10-1234-5678",
    "010-12345678",
    "0101234-5678",
  ])("rejects %j", (v) => {
    expect(isValidKoreanPhone(v)).toBe(false);
  });
});

describe("isValidIpAddress", () => {
  it.each([
    "0.0.0.0",
    "192.168.0.1",
    "255.255.255.255",
    "10.20.30.40",
    "1.2.3.199",
    "249.250.99.9",
  ])("accepts %s", (v) => {
    expect(isValidIpAddress(v)).toBe(true);
  });
  it.each([
    "",
    "256.1.1.1",
    "1.1.1",
    "1.1.1.1.1",
    "a.b.c.d",
    "::1",
    "1.1.1.-1",
    "010.001.001.001",
    "01.2.3.4",
    "1.2.3.00",
    "1.2.3.007",
    "1.2.3.256",
  ])("rejects %j", (v) => {
    expect(isValidIpAddress(v)).toBe(false);
  });
});
