import type { NamingConfig } from "@hey-api/shared";
import { identifierName } from "../kit/index.js";

const DEFAULT_CONTRACT_NAMING: NamingConfig = { casing: "PascalCase" };
const DEFAULT_OPERATION_NAMING: NamingConfig = { casing: "camelCase" };

export function contractName(
  operationId: string,
  config?: NamingConfig,
): string {
  return identifierName(operationId, config ?? DEFAULT_CONTRACT_NAMING);
}

export function operationName(name: string, config?: NamingConfig): string {
  return identifierName(name, config ?? DEFAULT_OPERATION_NAMING);
}
