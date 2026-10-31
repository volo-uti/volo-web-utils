# number-utils

## isBetween

True when the value lies between min and max, inclusive; NaN is never between.

## clampTo

Limits a number to the range from min to max.
Pass min <= max: with min > max the result is max. A NaN value stays NaN.

## Examples

### isBetween

```tsx
isBetween(5, 1, 10) // true
```

### clampTo

```tsx
clampTo(15, 0, 10) // 10
```
