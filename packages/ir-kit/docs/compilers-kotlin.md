# ir-kit

Typed Kotlin AST and printer. Build Kotlin source through a TypeScript-compiler-style `factory`, then print it. Zero runtime dependencies.

The printer's snapshot suite is gated by the canonical Kotlin formatter (`scripts/lint-kotlin.sh`), so printed output is formatter-clean by construction.

Originally developed in [typescript-compilers](https://github.com/ahmedrowaihi/typescript-compilers) (Hey API); imported with full history.

## Usage

```ts
import { kotlin } from "@ir-kit/kit";

const file = kotlin.factory.createSourceFile(/* ... */);
const source = kotlin.createPrinter().printFile(file);
```
