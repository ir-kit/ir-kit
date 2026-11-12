import { Namespace, pascal } from "@ir-kit/codegen-core";

/** `PetStatus` → `PET_STATUS`, `in-progress` → `IN_PROGRESS`. */
export function upperSnake(s: string): string {
  return snakeWords(s).toUpperCase();
}

/** Field names: `petId` → `pet_id`, never starting with a digit. */
export function fieldIdent(s: string): string {
  const snake = snakeWords(s).toLowerCase() || "field";
  return /^[0-9]/.test(snake) ? `f_${snake}` : snake;
}

/** protoc's default JSON name for a field: `pet_id` → `petId`. */
export function defaultJsonName(field: string): string {
  return field.replace(/_+([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

export function typeIdent(s: string): string {
  const p = pascal(s) || "Empty";
  return /^[0-9]/.test(p) ? `X${p}` : p;
}

export function packageIdent(title: string | undefined): string {
  const snake = fieldIdent(title ?? "");
  return snake === "field" ? "api" : snake.replace(/^f_/, "api_");
}

/** Message, enum and service names share one package scope. */
export function newTypeNames(): Namespace {
  return new Namespace({ normalize: typeIdent, foldCase: true });
}

export function newFieldNames(): Namespace {
  return new Namespace({
    normalize: fieldIdent,
    disambiguate: (b, n) => `${b}_${n}`,
  });
}

function snakeWords(s: string): string {
  return s
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
