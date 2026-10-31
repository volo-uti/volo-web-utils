# v-log

## VLog

Development-only logger (debug, info, warn, error) that is silent in production.
It reads NODE_ENV on every call and treats a runtime without `process` as development.
error() logs an Error with its stack and cause, and never throws on odd values.

## Examples

### VLog

```tsx
VLog.info('loaded', 'Auth') // [Auth] loaded
```
