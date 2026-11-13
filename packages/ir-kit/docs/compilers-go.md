# ir-kit

Typed Go AST and printer. Build Go source through a TypeScript-compiler-style `factory`, then print it. Zero runtime dependencies.

The printer's snapshot suite is gated by the canonical Go formatter (`scripts/lint-go.sh`), so printed output is formatter-clean by construction.

Originally developed in [typescript-compilers](https://github.com/ahmedrowaihi/typescript-compilers) (Hey API); imported with full history.

## Usage

```ts
import { go } from "@ir-kit/kit";

const file = go.factory.createSourceFile(/* ... */);
const source = go.createPrinter().printFile(file);
```
