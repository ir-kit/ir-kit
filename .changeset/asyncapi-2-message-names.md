---
"@ir-kit/kit": patch
---

AsyncAPI 2.x messages that have a `name` but no `messageId` no longer crash the `events()` plugin or come out as `UndefinedMessage` in native models.
