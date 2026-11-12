import { paramIdent } from "../identifiers.js";

export interface PropertyName {
  jsonKey: string;
  javaName: string;
  renamed: boolean;
}

export function propertyName(jsonKey: string): PropertyName {
  const javaName = paramIdent(jsonKey);
  return { jsonKey, javaName, renamed: javaName !== jsonKey };
}
