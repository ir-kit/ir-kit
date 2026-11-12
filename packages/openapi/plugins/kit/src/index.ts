import {
  applyNaming,
  collectDeps,
  defineConfig as defineConfigTable,
  definePluginConfig,
  type NamingConfig,
  type Plugin,
} from "@hey-api/shared";

/** `name` cased by `naming`, with every non-identifier character removed. */
export function identifierName(name: string, naming: NamingConfig): string {
  return applyNaming(name, naming).replace(/[^\w]/g, "");
}

/**
 * `definePluginConfig` that resolves nested user options against the default
 * table, so omitted keys keep their defaults and coercers.
 */
export function definePlugin<T extends Plugin.Types>(
  defaultConfig: Plugin.Config<T>,
) {
  const pluginFromDefaults = definePluginConfig(defaultConfig);
  const normalizeConfig = defineConfigTable<
    Record<string, unknown>,
    Record<string, unknown>
  >(defaultConfig.config as never);
  return (userConfig?: Omit<T["config"], "name">) => {
    const plugin = pluginFromDefaults();
    const config = normalizeConfig({ ...userConfig });
    const dependencies = new Set<string>(defaultConfig.dependencies);
    collectDeps(defaultConfig.config as never, config, dependencies);
    return {
      ...plugin,
      config: config as typeof plugin.config,
      dependencies: [...dependencies] as typeof plugin.dependencies,
    };
  };
}
