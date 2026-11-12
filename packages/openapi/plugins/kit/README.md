# @ir-kit/openapi-ts-plugin-kit

Helpers shared by the ir-kit plugins for [`@hey-api/openapi-ts`](https://github.com/hey-api/openapi-ts).

## `definePlugin(defaultConfig)`

A drop-in replacement for Hey API's `definePluginConfig`. Nested user options are resolved against the plugin's default config table, so `{ naming: { suffix: "Path" } }` keeps the default `casing` instead of dropping it, and dependencies implied by the resolved options are collected.
