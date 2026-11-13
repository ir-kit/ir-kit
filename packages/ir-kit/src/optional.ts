/**
 * Load a module that needs an optional peer dependency. When one of
 * `packages` is missing, throw an error that says what to install
 * instead of Node's bare "Cannot find package".
 */
export async function loadOptional<T>(
  load: () => Promise<T>,
  feature: string,
  packages: ReadonlyArray<string>,
): Promise<T> {
  try {
    return await load();
  } catch (error) {
    const missing = packages.find((name) => isMissingPackage(error, name));
    if (missing) {
      throw new Error(
        `${feature} needs ${packages.join(", ")}. Install with: npm i -D ${packages.join(" ")}`,
        { cause: error },
      );
    }
    throw error;
  }
}

function isMissingPackage(error: unknown, name: string): boolean {
  if (!(error instanceof Error)) return false;
  const code = (error as { code?: string }).code;
  return (
    (code === "ERR_MODULE_NOT_FOUND" || code === "MODULE_NOT_FOUND") &&
    (error.message.includes(`'${name}'`) ||
      error.message.includes(`"${name}"`) ||
      error.message.includes(`'${name}/`))
  );
}
