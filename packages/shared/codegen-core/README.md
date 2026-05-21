# `@ir-kit/codegen-core`

Spec-agnostic codegen primitives shared by every native-SDK generator family — identifier transforms (`pascal`, `camel`, `safeIdent`, `safeCaseName`, `softCamel`, `synthName`, `avoidLeadingDigit`, `escapeIfReserved`), filesystem safety (`assertSafeOutputDir`), and project-name derivation (`defaultProjectName`). Pure functions, no spec dependencies.

## Install

```sh
npm install @ir-kit/codegen-core
```

Zero runtime dependencies.

## Identifier helpers

```ts
import {
  avoidLeadingDigit,
  camel,
  escapeIfReserved,
  pascal,
  safeCaseName,
  safeIdent,
  softCamel,
  synthName,
} from "@ir-kit/codegen-core";

pascal("first_name");     // "FirstName"
camel("first_name");      // "firstName"
softCamel("FirstName");   // "FirstName"  (preserves first-letter casing)
camel("FirstName");       // "firstName"  (lowercases first letter)
safeIdent("2024_release"); // "_2024Release"  (digit guard + pascal)
safeCaseName("4xx");      // "_4xx"
synthName("User", ["Address", "Street"]);   // "User_Address_Street"

avoidLeadingDigit("2value");                // "_2value"
escapeIfReserved("class", new Set(["class"]), (s) => `\`${s}\``);  // "`class`"
```

## Filesystem helpers

```ts
import { assertSafeOutputDir, defaultProjectName } from "@ir-kit/codegen-core";

assertSafeOutputDir("./out/sdk");           // throws if outside CWD or in . / ..
defaultProjectName("./out/petstore-sdk");   // "petstore-sdk"
```

## Status

`0.1.0` — first release under the `@ir-kit/*` scope. Replaces the legacy `@ahmedrowaihi/codegen-core` (deprecated).

## Repo

Source at [ir-kit/ir-kit](https://github.com/ir-kit/ir-kit/tree/main/packages/shared/codegen-core).
