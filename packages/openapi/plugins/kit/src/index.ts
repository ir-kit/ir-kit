import {
  collectDeps,
  defineConfig as defineConfigTable,
  definePluginConfig,
  type Plugin,
} from "@hey-api/shared";

/**
 * `definePluginConfig` with user config resolved against the default table.
 *
 * Hey API's `definePluginConfig` spreads user config over the defaults, so a
 * nested user object replaces its whole table and loses the defaults and
 * coercers for the keys it leaves out. This resolves user config through the
 * table instead and recollects the dependencies the resolved values imply.
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
