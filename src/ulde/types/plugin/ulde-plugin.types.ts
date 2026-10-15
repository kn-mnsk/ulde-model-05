// src/ulde/types/plugin/ulde-plugin.types.ts

import { ULDEExecutionContext, ULDEPageContext, ULDERenderContext } from "@ulde/types/context";
import { ULDELifecyclePhase } from "@ulde/types/lifecycle";

// ---------------------------------------------------------
// ULDE Plugin Kinds
// ---------------------------------------------------------

export type ULDEPluginKind =
  | 'content'
  | 'layout'
  | 'interactive'
  | 'navigation'
  | 'demo'
  | 'ulde';

// ---------------------------------------------------------
// ULDE Plugin Definition - Legacy
// ---------------------------------------------------------

// export interface ULDEPlugin {
//   pluginKind: ULDEPluginKind;
//   pluginName: string;
//   version?: string;
//   description?: string;
//   enabled?: boolean;
//   hooks: ULDEPluginHooks;
// }

// ---------------------------------------------------------
// ULDE Plugin Hooks - Legacy
// ---------------------------------------------------------

// export interface ULDEPluginHooks {
//   onInit?(): void | Promise<void>;
//   onPageLoad?(ctx: ULDEPageContext): void | Promise<void>;
//   onBeforeRender?(ctx: ULDERenderContext): void | Promise<void>;
//   onAfterRender?(ctx: ULDERenderContext): void | Promise<void>;
//   onDestroy?(): void | Promise<void>;
// }

/**
 * ULDE Plugin Instance - Unified Runtime Plugin
 * Every plugin ULDE executes will be an instance of this type.
 */
export interface ULDEPluginInstance {
  pluginKind: ULDEPluginKind;
  pluginName: string;
  enabled?: boolean;

  /**
   * Unified execution entry point.
   * The registry decides which lifecycle phase is being executed.
   */
  run(ctx: ULDEExecutionContext): void | Promise<void> | Promise<() => void |undefined>;

  /**
   * Optional teardown hook.
   */
  destroy?(): void | Promise<void> | Promise<() => void |undefined>;
}

/**
 * ULDE Plugin Classs
 * This is the type stored in the registry
 * This ensures:
 *  registry stores classes
*   registry instantiates instances
*   lifecycle executes run()
 */
export type ULDEPluginClass = {
  new (...args: any[]): ULDEPluginInstance;
};


/**
 * Factory type:
 * Returns either:
 *  - a legacy ULDEPlugin (object)
 *  - a new ULDEPluginInstance (class instance)
 */
export type ULDEPluginFactory = () => ULDEPluginInstance;
// export type ULDEPluginFactory = () => ULDEPlugin | ULDEPluginInstance;

/**
 * Phase-aware plugin registry using factories.
 */
export type ULDEPluginRegistryMap = {
  [P in ULDELifecyclePhase]?: ULDEPluginFactory[];
};


export type ULDEPluginExecutionHook =
  | 'run'
  | 'destroy'
  // | keyof ULDEPluginHooks;



