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








// import { Injectable } from '@angular/core';
// import { ULDEOverlayService } from '@ulde/core';
// import { ULDELifecyclePhase } from '@ulde/types/lifecycle';
// import { ULDEPlugin, ULDEPluginHooks, ULDEPluginKind } from '@ulde/types/plugin';
// import { ULDEPluginTiming } from '@ulde/types/timing';

// import { createUldeStringPluginRegistry } from '@ulde/plugins/registry';

// @Injectable({ providedIn: 'root' })
// export class ULDEPluginRegistryService {

//   private plugins: ULDEPlugin[] = [];

//   /**
//    * Hook map for lifecycle service convenience.
//    */
//   hookMap: { [K in keyof ULDEPluginHooks]: K } = {
//     onInit: 'onInit',
//     onPageLoad: 'onPageLoad',
//     onBeforeRender: 'onBeforeRender',
//     onAfterRender: 'onAfterRender',
//     onDestroy: 'onDestroy',
//   };

//   constructor(private devtoolsService: ULDEOverlayService) {

//     // plugins registry
//     const plugins = createUldeStringPluginRegistry();
//     plugins.forEach(p => {
//       this.register(p);
//     })
//   }

//   /**
//    * Register a plugin.
//    */
//   register(plugin: ULDEPlugin) {
//     if (plugin.enabled === false) return;

//     this.plugins.push(plugin);
//     // this.plugins.sort((a, b) => a.pluginKind.localeCompare(b.pluginKind)); // deterministic order
//   }

//   /**
//    * Run a specific hook across all plugins.
//    */
//   async run(
//     hookName: keyof ULDEPluginHooks,
//     ctx?: { lifecyclePhase?: ULDELifecyclePhase } & Record<string, any>,
//   ): Promise<void> {
//     for (const plugin of this.plugins) {
//       const hook = plugin.hooks[hookName];
//       if (!hook) continue;

//       const start = performance.now();

//       try {
//         await hook(ctx as any);
//       } catch (err) {
//         this.devtoolsService.addDiagnostic({
//           level: 'error',
//           message: `Plugin "${plugin.pluginName}" failed in hook "${hookName}": ${String(err)}`,
//           pluginName: plugin.pluginKind,
//           lifecyclePhase: ctx?.lifecyclePhase,
//         });
//       }

//       const end = performance.now();

//       const timing: ULDEPluginTiming = {
//         pluginName: plugin.pluginName,
//         pluginKind: plugin.pluginKind,
//         hookName,
//         lifecyclePhase: ctx?.lifecyclePhase ?? 'init',
//         duration: end - start,
//       };

//       this.devtoolsService.recordPluginTiming(timing);
//     }
//   }

//   /**
//    * Destroy all plugins (called on app teardown).
//    */
//   async destroyAll() {
//     for (const plugin of this.plugins) {
//       const hook = plugin.hooks.onDestroy;
//       if (!hook) continue;

//       const start = performance.now();

//       try {
//         await hook();
//       } catch (err) {
//         this.devtoolsService.addDiagnostic({
//           level: 'error',
//           message: `Plugin "${plugin.pluginName}" failed in onDestroy: ${String(err)}`,
//           pluginName: plugin.pluginKind,
//         });
//       }

//       const end = performance.now();

//       this.devtoolsService.recordPluginTiming({
//         pluginName: plugin.pluginName,
//         pluginKind: plugin.pluginKind,
//         hookName: 'onDestroy',
//         lifecyclePhase: 'afterRender',
//         duration: end - start,
//       });
//     }

//     this.plugins = [];

//   }

//   /**
//    * Get all registered plugins.
//    */
//   list() {
//     return [...this.plugins];
//   }
// }
