# @ir-kit/codegen-core

## 0.2.0

### Minor Changes

- 86fa954: Type names now resolve through a per-run `Namespace` keyed by semantic identity: component schemas, `$ref`s and synthesized inline types always agree on spelling, invalid source names (`properties-store`) become valid identifiers, and clashes get deterministic suffixes instead of duplicate declarations. Enum classification is total — boolean, number and mixed enums degrade to their value type instead of throwing, and clashing entry names are disambiguated. `assertNoEnumCollisions` is replaced by `uniqueEnumEntries`.
