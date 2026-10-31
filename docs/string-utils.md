# string-utils

## capitalize

Upper-cases the first character of a string.
It upper-cases the first code point; it does not title-case ('ß' becomes 'SS').

## isBlank

True when the string is null, undefined, empty or only whitespace.

## isNotBlank

True when the string has a non-whitespace character.

## isNumeric

True when the string is non-empty and has only the digits 0-9.

## isAlpha

True when the string is non-empty and has only ASCII letters.

## isAlphanumeric

True when the string is non-empty and has only ASCII letters and digits.

## isValidEmail

Pragmatic email shape check, not full RFC 5322 validation.
Every domain label may hold letters, digits and inner hyphens; the last label is letters only.
Empty dot parts ("a..b@x.com", ".a@x.com") and addresses over 254 characters are rejected.

## isValidUrl

True when the string parses as an absolute http or https URL with a host.
The string must already be in canonical form: it starts with "http://" or "https://" and has
no surrounding whitespace, so what is validated is what gets stored.

## isStrongPassword

True when the string has 8+ characters with lower, upper and digit.
Any characters are allowed, newlines included.

## isValidKoreanPhone

True for a Korean mobile number such as 010-1234-5678 (hyphens optional).
Use hyphens at both places or at none: "010-12345678" is rejected.

## isValidIpAddress

True when the string is a valid dotted-quad IPv4 address; IPv6 is not supported.
Leading zeros ("010.0.0.1") are rejected because parsers disagree on whether they mean octal.

## Examples

### capitalize

```tsx
capitalize('volo') // 'Volo'
```

### isBlank

```tsx
isBlank('  ') // true
```

### isNotBlank

```tsx
isNotBlank('a') // true
```

### isNumeric

```tsx
isNumeric('123') // true
```

### isAlpha

```tsx
isAlpha('abc') // true
```

### isAlphanumeric

```tsx
isAlphanumeric('abc123') // true
```

### isValidEmail

```tsx
isValidEmail('a@b.com') // true
```

### isValidUrl

```tsx
isValidUrl('https://volo.dev') // true
```

### isStrongPassword

```tsx
isStrongPassword('Abcdefg1') // true
```

### isValidKoreanPhone

```tsx
isValidKoreanPhone('010-1234-5678') // true
```

### isValidIpAddress

```tsx
isValidIpAddress('192.168.0.1') // true
```
