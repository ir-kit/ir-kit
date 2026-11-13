import { kt } from "../../../../compilers/kotlin/index.js";

import {
  type KtExpr,
  type KtType,
  ktArg,
  ktCall,
  ktIdent,
  ktMember,
  typeArgs,
  typeName,
} from "../../ast/index.js";

const K = kt.KotlinNodeKind;

/**
 * Build the kotlinx-serialization `KSerializer<T>` expression for a
 * `KtType`. Used wherever the impl needs to feed a serializer to
 * `Json.encodeToString(...)` / `client.execute(..., deserializer)` /
 * `Json.decodeFromString(...)`.
 *
 *  - `String`/`Int`/`Long`/…   → `String.serializer()` etc. (built-in shortcuts)
 *  - `List<T>`                 → `ListSerializer(<inner>)`
 *  - `Map<K, V>`               → `MapSerializer(<keySer>, <valSer>)`
 *  - nullable `T?`             → `<inner>.nullable`
 *  - user type `T`             → `T.serializer()` (always present on
 *                                `@Serializable` data classes / enums)
 *  - `Any`                     → `JsonElement.serializer()` (best-effort)
 *
 * The orchestrator tracks which builtin imports are needed and emits
 * the right `import kotlinx.serialization.builtins.*` line.
 */
/** Type aliases by name, so `X.serializer()` is only emitted for real classes. */
export type SerializerAliases = ReadonlyMap<string, KtType>;

export function serializerFor(
  t: KtType,
  aliases: SerializerAliases = new Map(),
): KtExpr {
  if (t.kind === K.NullableType)
    return ktMember(serializerFor(t.type, aliases), "nullable");
  const name = typeName(t);
  if (name === undefined) return jsonElementSerializer();
  const [first, second] = typeArgs(t);
  if (name === "List" && first)
    return ktCall(ktIdent("ListSerializer"), [
      ktArg(serializerFor(first, aliases)),
    ]);
  if (name === "Map" && first && second)
    return ktCall(ktIdent("MapSerializer"), [
      ktArg(serializerFor(first, aliases)),
      ktArg(serializerFor(second, aliases)),
    ]);
  if (BUILTIN_SERIALIZERS.has(name))
    return ktCall(ktMember(ktIdent(name), "serializer"), []);
  if (name === "ByteArray") return ktCall(ktIdent("ByteArraySerializer"), []);
  if (OPAQUE.has(name)) return jsonElementSerializer();
  const target = aliases.get(name);
  if (target) return serializerFor(target, aliases);
  return ktCall(ktMember(ktIdent(name), "serializer"), []);
}

const BUILTIN_SERIALIZERS: ReadonlySet<string> = new Set([
  "String",
  "Int",
  "Long",
  "Short",
  "Byte",
  "Double",
  "Float",
  "Boolean",
]);

const OPAQUE: ReadonlySet<string> = new Set(["Unit", "Any", "Nothing"]);

const jsonElementSerializer = (): KtExpr =>
  ktCall(ktMember(ktIdent("JsonElement"), "serializer"), []);
