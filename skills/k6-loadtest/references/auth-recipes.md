# `useAuth` recipes

The framework ships five built-in auth flavors. All return a `Middleware` object that the runtime composes into every request's headers.

```ts
import { useAuth } from "@ahmedrowaihi/k6";
```

## Bearer

Token from a static value or env var. Read once per request, never logged.

```ts
// From env
const authFromEnv = useAuth.bearer({ env: "API_TOKEN" });

// Hardcoded token (don't ship this — example only)
const authLiteral = useAuth.bearer({ token: "secret-literal" });

// Custom header / scheme:
const authCustom = useAuth.bearer({
  env: "API_TOKEN",
  header: "X-Auth",   // default "Authorization"
  scheme: "Token",    // default "Bearer"
});
```

## Basic

Two env vars, base64-encoded at request time.

```ts
const auth = useAuth.basic({
  user: { env: "API_USER" },
  pass: { env: "API_PASS" },
});
```

Literal values also accepted (`user: "alice", pass: "secret"`) but env is the cowpath.

## ApiKey

Header-based key with a custom name.

```ts
const auth = useAuth.apiKey({
  name: "X-API-Key",     // header name
  env: "API_KEY",        // or value: "literal"
});
```

## Session

Cookie/session-based auth (Better-Auth, NextAuth, Lucia, custom servers). `signIn` runs once per VU on the first request — result is cached for the rest of that VU's lifetime.

```ts
const auth = useAuth.session({
  signIn: () => {
    // VU-local: runs once, return the Set-Cookie value to inject
    const res = http.post("https://example.com/auth/login", {
      email: __ENV.LOGIN_EMAIL,
      password: __ENV.LOGIN_PASSWORD,
    });
    return res.headers["Set-Cookie"];
  },
  headerName: "Cookie",   // default
});
```

## Custom

Escape hatch for everything else (HMAC signing, AWS SigV4, etc).

```ts
const auth = useAuth.custom({
  headers: () => ({
    "X-Signature": computeHmac(...),
    "X-Timestamp": Date.now().toString(),
  }),
});
```

## Composing multiple auths

`defineLoadTest({ use: [...] })` accepts an array — middleware applies in order, later headers override earlier ones.

```ts
const lt = defineLoadTest({
  use: [
    useAuth.bearer({ env: "API_TOKEN" }),
    useAuth.custom({ headers: () => ({ "X-Tenant": __ENV.TENANT }) }),
  ],
  // ...
});
```

## Per-scenario auth override

Scenarios can override the top-level `use` array:

```ts
defineLoadTest({
  use: [useAuth.bearer({ env: "READ_TOKEN" })],
  scenarios: {
    browse: { pace: smoke(...), flow: ... },                          // inherits READ_TOKEN
    write: {
      pace: load(...),
      flow: ...,
      use: [useAuth.bearer({ env: "WRITE_TOKEN" })],                  // overrides
    },
  },
});
```
