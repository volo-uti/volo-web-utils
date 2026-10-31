# v-delay

## VDebouncer

Runs a callback once the duration has passed since the last call().
cancel() drops a pending run.

## VThrottler

Runs a callback at most once per duration.
Later calls inside the window are dropped.

## debounce

Wraps a function so it runs only after the delay without another call.
Exposes cancel() to drop a pending run.

## throttle

Wraps a function so it runs on the first call, then at most once per window.

## delay

Returns a promise that resolves after the given milliseconds.
Waits are capped at 2147483647 ms (about 24.8 days).

## Examples

### VDebouncer

```tsx
const saver = new VDebouncer(300, save)
saver.call()
```

### VThrottler

```tsx
const t = new VThrottler(1000, refresh)
t.call()
```

### debounce

```tsx
const onInput = debounce((q: string) => search(q), 300)
```

### throttle

```tsx
const onScroll = throttle(update, 100)
```

### delay

```tsx
await delay(500)
```
