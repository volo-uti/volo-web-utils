# map-utils

## getOrDefault

Reads an own key, or the default when missing, nullish or unsafe.

## pick

Returns a new object with only the given keys that exist on the object.

## omit

Returns a new object without the given keys.
Own enumerable symbol keys that are not listed are kept, as `pick` keeps them.

## mapValues

Returns a new object with each value transformed by the function.

## mapKeys

Returns a new object with each key transformed by the function.
Later keys win on a clash.

## omitNullish

Returns a new object without the entries whose value is null or undefined.

## merge

Returns a new object with the source entries laid over the target (shallow).

## invert

Returns a new object with keys and values swapped.
Later keys win on equal values.

## Examples

### getOrDefault

```tsx
getOrDefault({ a: 1 }, 'b', 0) // 0
```

### pick

```tsx
pick({ a: 1, b: 2 }, ['a']) // { a: 1 }
```

### omit

```tsx
omit({ a: 1, b: 2 }, ['a']) // { b: 2 }
```

### mapValues

```tsx
mapValues({ a: 1 }, (v) => v * 2) // { a: 2 }
```

### mapKeys

```tsx
mapKeys({ a: 1 }, (k) => k.toUpperCase()) // { A: 1 }
```

### omitNullish

```tsx
omitNullish({ a: 1, b: null }) // { a: 1 }
```

### merge

```tsx
merge({ a: 1 }, { a: 2, b: 3 }) // { a: 2, b: 3 }
```

### invert

```tsx
invert({ a: 'x' }) // { x: 'a' }
```
