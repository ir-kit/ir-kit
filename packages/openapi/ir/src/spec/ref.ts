import type { Schema } from "@ir-kit/schema";

/**
 * Empty / unknown / void schemas — short-circuits a 2xx response to a
 * no-payload return (Kotlin `Unit`, Swift `Void`, Go's absent return).
 */
export function isMeaningless(s: Schema): boolean {
  if (s.$ref || s.const !== undefined) return false;
  if (s.items) return false;
  if (s.properties && Object.keys(s.properties).length > 0) return false;
  if (s.oneOf?.length || s.anyOf?.length || s.allOf?.length) return false;
  if (s.enum && s.enum.length > 0) return false;
  return s.type === undefined;
}
