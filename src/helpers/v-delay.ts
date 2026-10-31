/**
 * Debounce, throttle, and delay utilities.
 * A duration is clamped to 0 to 2147483647 ms (about 24.8 days), the most setTimeout can wait;
 * a NaN or negative duration counts as 0.
 */

const MAX_TIMEOUT_MS = 2 ** 31 - 1;

/** Timer delay that setTimeout honors: longer values would fire after 1 ms. */
function timerDelay(ms: number): number {
  return ms > 0 ? Math.min(ms, MAX_TIMEOUT_MS) : 0;
}

/** Throttle window: NaN and negative count as 0; Infinity stays (a single run). */
function windowOf(ms: number): number {
  return ms > 0 ? ms : 0;
}

/** Monotonic milliseconds, so a system clock change cannot reopen or block a window. */
function tick(): number {
  return performance.now();
}

/**
 * Runs a callback once the duration has passed since the last call().
 * cancel() drops a pending run.
 *
 * @example
 * const saver = new VDebouncer(300, save)
 * saver.call()
 */
export class VDebouncer {
  private timer: ReturnType<typeof setTimeout> | undefined;
  constructor(
    private readonly duration: number,
    private readonly callback: () => void,
  ) {}

  call(): void {
    this.cancel();
    this.timer = setTimeout(() => this.callback(), timerDelay(this.duration));
  }

  cancel(): void {
    clearTimeout(this.timer);
    this.timer = undefined;
  }
}

/**
 * Runs a callback at most once per duration.
 * Later calls inside the window are dropped.
 *
 * @example
 * const t = new VThrottler(1000, refresh)
 * t.call()
 */
export class VThrottler {
  private lastCall: number | undefined;
  constructor(
    private readonly duration: number,
    private readonly callback: () => void,
  ) {}

  call(): void {
    const now = tick();
    if (this.lastCall === undefined || now - this.lastCall >= windowOf(this.duration)) {
      this.lastCall = now;
      this.callback();
    }
  }

  reset(): void {
    this.lastCall = undefined;
  }

  /** Milliseconds until the next call() will run; 0 when it would run now. */
  get remainingTime(): number {
    if (this.lastCall === undefined) return 0;
    return Math.max(0, windowOf(this.duration) - (tick() - this.lastCall));
  }
}

/**
 * Wraps a function so it runs only after the delay without another call.
 * Exposes cancel() to drop a pending run.
 *
 * @example
 * const onInput = debounce((q: string) => search(q), 300)
 */
export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  delay: number,
): ((...args: A) => void) & { cancel(): void } {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const debounced = (...args: A) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), timerDelay(delay));
  };
  debounced.cancel = () => {
    clearTimeout(timer);
    timer = undefined;
  };
  return debounced;
}

/**
 * Wraps a function so it runs on the first call, then at most once per window.
 *
 * @example
 * const onScroll = throttle(update, 100)
 */
export function throttle<A extends unknown[]>(
  fn: (...args: A) => void,
  delay: number,
): (...args: A) => void {
  let lastCall: number | undefined;
  return (...args: A) => {
    const now = tick();
    if (lastCall === undefined || now - lastCall >= windowOf(delay)) {
      lastCall = now;
      fn(...args);
    }
  };
}

/**
 * Returns a promise that resolves after the given milliseconds.
 * Waits are capped at 2147483647 ms (about 24.8 days).
 *
 * @example
 * await delay(500)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, timerDelay(ms)));
}
