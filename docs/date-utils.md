# date-utils

## isToday

True when the date falls on today.

## isYesterday

True when the date falls on yesterday.

## isTomorrow

True when the date falls on tomorrow.

## isSameDay

True when both dates fall on the same calendar day.

## isThisWeek

True when the date is within the current week (Sunday to Saturday).

## isThisMonth

True when the date is within the current month.

## isThisYear

True when the date is within the current year.

## isWeekend

True when the date is a Saturday or Sunday.

## isWeekday

True when the date is Monday to Friday.
An invalid Date is neither weekday nor weekend.

## startOfDay

Returns a copy of the date set to 00:00:00.000.

## endOfDay

Returns a copy of the date set to 23:59:59.999.

## startOfMonth

Returns the first day of the date's month at 00:00:00.000.

## endOfMonth

Returns the last day of the date's month at 23:59:59.999.

## addMonths

Returns a copy moved by whole months; negative goes back.
A day missing in the target month clamps to its last day.

## getDaysInMonth

Number of days in the date's month.

## Examples

### isToday

```tsx
isToday(new Date()) // true
```

### isYesterday

```tsx
const d = new Date()
d.setDate(d.getDate() - 1)
isYesterday(d) // true
```

### isTomorrow

```tsx
const d = new Date()
d.setDate(d.getDate() + 1)
isTomorrow(d) // true
```

### isSameDay

```tsx
isSameDay(new Date(2024, 0, 1, 9), new Date(2024, 0, 1, 18)) // true
```

### isThisWeek

```tsx
isThisWeek(new Date()) // true
```

### isThisMonth

```tsx
isThisMonth(new Date()) // true
```

### isThisYear

```tsx
isThisYear(new Date()) // true
```

### isWeekend

```tsx
isWeekend(new Date(2024, 0, 6)) // true (Saturday)
```

### isWeekday

```tsx
isWeekday(new Date(2024, 0, 8)) // true (Monday)
```

### startOfDay

```tsx
startOfDay(new Date(2024, 0, 1, 15)) // 2024-01-01T00:00:00.000 local
```

### endOfDay

```tsx
endOfDay(new Date(2024, 0, 1)) // 2024-01-01T23:59:59.999 local
```

### startOfMonth

```tsx
startOfMonth(new Date(2024, 1, 15)) // 2024-02-01T00:00:00.000 local
```

### endOfMonth

```tsx
endOfMonth(new Date(2024, 1, 15)) // 2024-02-29T23:59:59.999 local
```

### addMonths

```tsx
addMonths(new Date(2024, 0, 31), 1) // 2024-02-29
```

### getDaysInMonth

```tsx
getDaysInMonth(new Date(2024, 1, 1)) // 29
```
