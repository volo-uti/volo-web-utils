import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VDebouncer, VThrottler, debounce, delay, throttle } from "./v-delay";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2024, 0, 1));
});
afterEach(() => {
  vi.useRealTimers();
});

describe("VDebouncer", () => {
  it("runs once after the duration", () => {
    const cb = vi.fn();
    const d = new VDebouncer(100, cb);
    d.call();
    vi.advanceTimersByTime(99);
    expect(cb).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(cb).toHaveBeenCalledTimes(1);
  });
  it("restarts the wait on every call", () => {
    const cb = vi.fn();
    const d = new VDebouncer(100, cb);
    d.call();
    vi.advanceTimersByTime(60);
    d.call();
    vi.advanceTimersByTime(60);
    expect(cb).not.toHaveBeenCalled();
    vi.advanceTimersByTime(40);
    expect(cb).toHaveBeenCalledTimes(1);
  });
  it("cancel drops a pending run and is safe to repeat", () => {
    const cb = vi.fn();
    const d = new VDebouncer(100, cb);
    d.call();
    d.cancel();
    d.cancel();
    vi.advanceTimersByTime(500);
    expect(cb).not.toHaveBeenCalled();
  });
  it("can be used again after firing", () => {
    const cb = vi.fn();
    const d = new VDebouncer(50, cb);
    d.call();
    vi.advanceTimersByTime(50);
    d.call();
    vi.advanceTimersByTime(50);
    expect(cb).toHaveBeenCalledTimes(2);
  });
});

describe("VThrottler", () => {
  it("runs the first call at once, even at clock 0", () => {
    vi.setSystemTime(0);
    const cb = vi.fn();
    new VThrottler(100, cb).call();
    expect(cb).toHaveBeenCalledTimes(1);
  });
  it("drops calls inside the window and runs again after it", () => {
    const cb = vi.fn();
    const t = new VThrottler(100, cb);
    t.call();
    vi.advanceTimersByTime(99);
    t.call();
    expect(cb).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    t.call();
    expect(cb).toHaveBeenCalledTimes(2);
  });
  it("remainingTime counts down and is 0 before the first call", () => {
    const t = new VThrottler(100, vi.fn());
    expect(t.remainingTime).toBe(0);
    t.call();
    expect(t.remainingTime).toBe(100);
    vi.advanceTimersByTime(30);
    expect(t.remainingTime).toBe(70);
    vi.advanceTimersByTime(200);
    expect(t.remainingTime).toBe(0);
  });
  it("reset lets the next call run immediately", () => {
    const cb = vi.fn();
    const t = new VThrottler(100, cb);
    t.call();
    t.reset();
    expect(t.remainingTime).toBe(0);
    t.call();
    expect(cb).toHaveBeenCalledTimes(2);
  });
});

describe("debounce", () => {
  it("runs once with the last arguments", () => {
    const fn = vi.fn();
    const d = debounce(fn, 100);
    d("a", 1);
    d("b", 2);
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("b", 2);
  });
  it("does not run before the delay", () => {
    const fn = vi.fn();
    debounce(fn, 100)("x");
    vi.advanceTimersByTime(99);
    expect(fn).not.toHaveBeenCalled();
  });
  it("cancel drops the pending run", () => {
    const fn = vi.fn();
    const d = debounce(fn, 100);
    d();
    d.cancel();
    vi.advanceTimersByTime(500);
    expect(fn).not.toHaveBeenCalled();
  });
  it("keeps working after cancel", () => {
    const fn = vi.fn();
    const d = debounce(fn, 100);
    d.cancel();
    d();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe("throttle", () => {
  it("runs the leading call and drops the rest of the window", () => {
    const fn = vi.fn();
    const t = throttle(fn, 100);
    t(1);
    t(2);
    vi.advanceTimersByTime(99);
    t(3);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(1);
  });
  it("runs again after the window with the new arguments", () => {
    const fn = vi.fn();
    const t = throttle(fn, 100);
    t(1);
    vi.advanceTimersByTime(100);
    t(2);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith(2);
  });
  it("runs the first call at clock 0", () => {
    vi.setSystemTime(0);
    const fn = vi.fn();
    throttle(fn, 100)();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe("delay", () => {
  it("resolves after the given milliseconds", async () => {
    let done = false;
    void delay(200).then(() => {
      done = true;
    });
    await vi.advanceTimersByTimeAsync(199);
    expect(done).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(done).toBe(true);
  });
  it("resolves with undefined", async () => {
    const p = delay(0);
    await vi.advanceTimersByTimeAsync(0);
    await expect(p).resolves.toBeUndefined();
  });
});

describe("durations beyond the timer limit", () => {
  const MAX = 2 ** 31 - 1;
  it("delay waits instead of resolving after 1 ms", async () => {
    let done = false;
    void delay(2 ** 31).then(() => {
      done = true;
    });
    await vi.advanceTimersByTimeAsync(1_000);
    expect(done).toBe(false);
    await vi.advanceTimersByTimeAsync(MAX);
    expect(done).toBe(true);
  });
  it("delay(Infinity) waits for the longest possible timer", async () => {
    let done = false;
    void delay(Infinity).then(() => {
      done = true;
    });
    await vi.advanceTimersByTimeAsync(1_000);
    expect(done).toBe(false);
    await vi.advanceTimersByTimeAsync(MAX);
    expect(done).toBe(true);
  });
  it("debounce does not fire right away", () => {
    const fn = vi.fn();
    debounce(fn, 2 ** 31)();
    vi.advanceTimersByTime(1_000);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(MAX);
    expect(fn).toHaveBeenCalledTimes(1);
  });
  it("VDebouncer does not fire right away", () => {
    const cb = vi.fn();
    new VDebouncer(2 ** 31, cb).call();
    vi.advanceTimersByTime(1_000);
    expect(cb).not.toHaveBeenCalled();
  });
  it("a NaN or negative duration counts as 0", async () => {
    const fn = vi.fn();
    debounce(fn, NaN)();
    debounce(fn, -5)();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(2);
    const p = delay(-1);
    await vi.advanceTimersByTimeAsync(1);
    await expect(p).resolves.toBeUndefined();
  });
});

describe("throttle clock handling", () => {
  it("throttle with a NaN duration runs every call", () => {
    const fn = vi.fn();
    const t = throttle(fn, NaN);
    t();
    t();
    expect(fn).toHaveBeenCalledTimes(2);
  });
  it("VThrottler with a NaN or negative duration runs every call", () => {
    const cb = vi.fn();
    const a = new VThrottler(NaN, cb);
    const b = new VThrottler(-10, cb);
    a.call();
    a.call();
    b.call();
    b.call();
    expect(cb).toHaveBeenCalledTimes(4);
    expect(a.remainingTime).toBe(0);
  });
  it("throttle with an infinite duration runs once", () => {
    const fn = vi.fn();
    const t = throttle(fn, Infinity);
    t();
    vi.advanceTimersByTime(10_000);
    t();
    expect(fn).toHaveBeenCalledTimes(1);
  });
  it("throttle is not blocked when the system clock moves back", () => {
    const fn = vi.fn();
    const t = throttle(fn, 1_000);
    t();
    vi.setSystemTime(Date.now() - 5_000);
    vi.advanceTimersByTime(1_000);
    t();
    expect(fn).toHaveBeenCalledTimes(2);
  });
  it("VThrottler is not blocked when the system clock moves back", () => {
    const cb = vi.fn();
    const t = new VThrottler(1_000, cb);
    t.call();
    vi.setSystemTime(Date.now() - 5_000);
    expect(t.remainingTime).toBe(1_000);
    vi.advanceTimersByTime(1_000);
    expect(t.remainingTime).toBe(0);
    t.call();
    expect(cb).toHaveBeenCalledTimes(2);
  });
  it("throttle does not reopen early when the system clock moves forward", () => {
    const fn = vi.fn();
    const t = throttle(fn, 1_000);
    t();
    vi.setSystemTime(Date.now() + 60_000);
    t();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
