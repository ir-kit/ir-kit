---
"@ir-kit/openapi-kotlin": patch
---

With `gradle` set, the Kotlin sources now go under `src/main/kotlin/`. Before, they sat at the output root, where Gradle doesn't look, so `gradle build` passed without compiling anything.
