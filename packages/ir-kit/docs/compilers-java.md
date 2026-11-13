# ir-kit

Typed Java AST and printer. Build Java source through a TypeScript-compiler-style `factory`, then print it. Zero runtime dependencies.

The printer's snapshot suite is gated by the canonical Java formatter (`scripts/lint-java.sh`), so printed output is formatter-clean by construction.

Originally developed in [typescript-compilers](https://github.com/ahmedrowaihi/typescript-compilers) (Hey API); imported with full history.

## Usage

```ts
import { java } from "ir-kit";

const file = java.factory.createSourceFile(/* ... */);
const source = java.createPrinter().printFile(file);
```
