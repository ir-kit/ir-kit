export {
  assertSafeOutputDir,
  defaultProjectName,
  type OutputFile,
  writeOutput,
} from "./fs.js";
export {
  avoidLeadingDigit,
  camel,
  escapeIfReserved,
  pascal,
  safeCaseName,
  safeIdent,
  softCamel,
  synthName,
  typeIdent,
} from "./identifiers.js";
export { Namespace, type NamingPolicy } from "./namespace.js";
