---
"@ir-kit/openapi-go": patch
---

Generated Go now passes `go vet` on Stripe, Slack, Box, OpenAI and Mux: parameters can no longer shadow method-body locals or imported packages (`path`, `url`, `body`), multi-2xx methods return the response interface instead of a pointer to it, decode errors assign the named `err` result instead of shadowing it, form bodies use `url.Values{}`, and optional slice/map parameters are no longer dereferenced.
