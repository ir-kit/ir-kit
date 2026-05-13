export function stripScheme(origin: string): string {
  return origin.replace(/^https?:\/\//, "");
}

export function slugifyOrigin(origin: string): string {
  return stripScheme(origin).replace(/[^a-z0-9]+/gi, "-");
}
