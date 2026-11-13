# ir-kit

Typed Swift AST and printer. Build Swift source through a TypeScript-compiler-style `factory`, then print it. Zero runtime dependencies.

The printer's snapshot suite is gated by the canonical Swift formatter (`scripts/lint-swift.sh`), so printed output is formatter-clean by construction.

Originally developed in [typescript-compilers](https://github.com/ahmedrowaihi/typescript-compilers) (Hey API); imported with full history.

## Usage

```ts
import { swift } from "@ir-kit/kit";

const file = swift.factory.createSourceFile(/* ... */);
const source = swift.createPrinter().printFile(file);
```
