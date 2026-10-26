// src/ulde/core/ulde-plugin-registry.service.ts

import { Injectable } from '@angular/core';
import { ULDEDevtoolsService } from '@ulde/devtools';
import { ULDEPluginInstance, ULDEPluginFactory } from '@ulde/types/plugin';
// import { ULDEPluginInstance, ULDEPlugin, ULDEPluginFactory } from '@ulde/types/plugin';

import { ULDE_PLUGIN_REGISTRY } from '@ulde/plugins/registry'; // updated registry
// import { ULDEPluginHookAdapter } from '@ulde/plugins/adaptors';
import { ULDEExecutionContext } from '@ulde/types';

@Injectable({ providedIn: 'root' })
export class ULDEPluginRegistryService {


  /**
   * All instantiated plugins (run‑based instances).
   * Legacy plugins are wrapped using ULDEPluginHookAdapter.
   */
  private instances: ULDEPluginInstance[] = [];

  constructor(private devtoolsService: ULDEDevtoolsService) {
    this.instantiateAllPlugins();
  }

  /**
  * Instantiate all plugins from the registry using factories.
  */
  private instantiateAllPlugins() {
    this.instances = Object.values(ULDE_PLUGIN_REGISTRY)
      .flat()
      .map(factory => this.instantiateFromFactory(factory))
      .filter(plugin => plugin.enabled !== false);
  }

  /**
   * Instantiate plugin from factory.
   * Detect legacy plugins (ULDEPlugin) vs new plugins (ULDEPluginInstance).
   */
  private instantiateFromFactory(factory: ULDEPluginFactory): ULDEPluginInstance {
    const raw = factory();

    // Legacy plugin: has "hooks"
    // if ((raw as ULDEPlugin).hooks) {
    //   return new ULDEPluginHookAdapter(raw as ULDEPlugin);
    // }

    // New plugin: already run‑based
    return raw as ULDEPluginInstance;
  }

  /**
   * Run all plugins assigned to a lifecycle phase.
   */
  async runPhase(executionCtx: ULDEExecutionContext): Promise<void> {

    // const { diagnostics } = executionCtx.artifacts;
    const phase = executionCtx.lifecyclePhase;
    const factories = ULDE_PLUGIN_REGISTRY[phase] || [];

    for (const factory of factories) {
      const raw: ULDEPluginInstance = factory();
      // const raw: ULDEPlugin | ULDEPluginInstance = factory();
      const plugin = raw as ULDEPluginInstance;
      // const plugin = ('hooks' in raw) ?
      //   new ULDEPluginHookAdapter(raw as ULDEPlugin)
      //   : (raw as ULDEPluginInstance);

      if (!plugin) continue;

      const start = performance.now();

      try {

        await plugin.run(executionCtx);
        // await plugin.destroy?.(); // did not exist before
      } catch (err) {
        this.devtoolsService.addDiagnostic({
          level: 'error',
          message: `Plugin "${plugin.pluginName}" failed in phase "${phase}": ${String(err)}`,
          pluginName: plugin.pluginName,
          lifecyclePhase: phase,
        });
      }

      const end = performance.now();

      this.devtoolsService.recordPluginTiming({
        pluginName: plugin.pluginName,
        pluginKind: plugin.pluginKind,
        hookName: 'run',
        lifecyclePhase: phase,
        duration: end - start,
      })
        ;
    }
  }

  /**
   * Destroy all plugins (called at end of lifecycle).
   */
  async destroyAll() {
    // const { diagnostics } = executionCtx.artifacts;

    for (const plugin of this.instances) {
      if (!plugin.destroy) continue;

      const start = performance.now();

      try {
        await plugin.destroy();
      } catch (err) {

        this.devtoolsService.addDiagnostic({
          level: 'error',
          message: `Plugin "${plugin.pluginName}" failed in destroy(): ${String(err)}`,
          pluginName: plugin.pluginName,
          lifecyclePhase: 'afterRender',
        });
      }

      const end = performance.now();

      this.devtoolsService.recordPluginTiming({
        pluginName: plugin.pluginName,
        pluginKind: plugin.pluginKind,
        hookName: 'destroy',
        lifecyclePhase: 'afterRender',
        duration: end - start,
      });
    }

    this.instances = [];
  }

  /**
   * List all instantiated plugins.
   */
  list() {
    return [...this.instances];
  }
}

