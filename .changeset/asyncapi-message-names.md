---
"@ir-kit/asyncapi-typescript": minor
---

- `event-map.gen.ts` imports the interface name the `typescript` plugin actually generated, so camelCase message ids such as `turnOn` no longer produce imports of nonexistent `turnOnMessage` types.
- Messages without a payload map to `unknown` in `EventMap` instead of importing a type that was never generated.
- The `typescript` plugin exposes `messageTypeName(messageId)` through `getApi("typescript")`, and the event-map `messageSuffix` option is deprecated and ignored.
- The `typescript` plugin generates interfaces for multi-format payloads such as Avro instead of `any`, and escapes string enum values like `"\r\n"`.
