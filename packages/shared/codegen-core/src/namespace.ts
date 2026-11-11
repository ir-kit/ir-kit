/**
 * Target-specific rules for turning a source string into an identifier
 * and resolving clashes. A {@link Namespace} applies one policy to every
 * name it hands out, so declaration and reference sites can never
 * disagree on spelling.
 */
export interface NamingPolicy {
  /** Source string → candidate identifier. Must be deterministic. */
  normalize(raw: string): string;
  /** n-th alternative (n ≥ 2) when `base` is already owned by another
   *  key. Default: `${base}${n}`. */
  disambiguate?(base: string, n: number): string;
  /** Identifiers that are never handed out (keywords, runtime decls). */
  reserved?: ReadonlySet<string>;
  /** Treat names differing only by case as clashing. */
  foldCase?: boolean;
}

/**
 * Owns a set of identifiers. Each name is claimed by a semantic key
 * (`schema:Pet`, `synth:Pet/status`, a raw enum value, …). Claiming is
 * idempotent per key, and two keys never receive the same name — clashes
 * are resolved deterministically via the policy instead of throwing.
 */
export class Namespace {
  readonly #byKey = new Map<string, string>();
  readonly #taken = new Set<string>();

  constructor(readonly policy: NamingPolicy) {
    for (const r of policy.reserved ?? []) this.#taken.add(this.#fold(r));
  }

  /** Resolve `key` to its identifier, claiming `raw` (normalized) on
   *  first sight. Later calls with the same key return the same name
   *  whatever `raw` they pass. */
  claim(key: string, raw: string = key): string {
    const existing = this.#byKey.get(key);
    if (existing !== undefined) return existing;
    const base = this.policy.normalize(raw);
    const disambiguate =
      this.policy.disambiguate ?? ((b: string, n: number) => `${b}${n}`);
    let name = base;
    for (let n = 2; this.#taken.has(this.#fold(name)); n++) {
      name = disambiguate(base, n);
    }
    this.#taken.add(this.#fold(name));
    this.#byKey.set(key, name);
    return name;
  }

  get(key: string): string | undefined {
    return this.#byKey.get(key);
  }

  #fold(name: string): string {
    return this.policy.foldCase ? name.toLowerCase() : name;
  }
}
