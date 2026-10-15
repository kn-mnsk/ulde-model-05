// src/ulde/plugins/registry/ulde-plugin-registry.ts

import {
  ULDECodeblockPlugin, ULDEFrontmatterNormalizerPlugin
} from '@ulde/plugins/system/content';

import {
  ULDEDemoPlugin, ULDEPlaygroundInjectorPlugin
} from '@ulde/plugins/system/demo';

import { ULDEDummyTestPlugin, UldeMermaidPlugin, UldeKatexPlugin } from '@ulde/plugins/system/interactive';

import {
  ULDEAnchorPlugin, ULDETocPlugin
} from '@ulde/plugins/system/layout';

import {
  ULDENavigationBreadcrumbsPlugin, UldeInternalLinkPlugin
} from '@ulde/plugins/system/navigation';

import {
  ULDEOverlayCustomPanelPlugin, ULDESlowPluginDetectorPlugin, ULDETimelineProfilerPlugin
} from '@ulde/plugins/system/ulde';

import { ULDEPluginRegistryMap } from '@ulde/types/plugin';



/** ULDE Plugin Registry (factory-based)
 * Phase‑aware, deterministic ULDE plugin registry.
 * This is the single source of truth for plugin ordering.
 */
export const ULDE_PLUGIN_REGISTRY: ULDEPluginRegistryMap = {
  // Reserved for future init‑only plugins
  init: [],

  // Content + navigation: operate on page context / tokens / early AST
  load: [
    () => new ULDEFrontmatterNormalizerPlugin(),
    () => new ULDECodeblockPlugin(),
    () => new ULDEDemoPlugin(),
    () => new ULDEDummyTestPlugin(),
    () => new ULDENavigationBreadcrumbsPlugin(),
  ],

  // Layout: operate on AST structure (sections, anchors, TOC)
  render: [
    () => new ULDEAnchorPlugin(),
    () => new ULDETocPlugin(),
  ],

  // Interactive: operate on rendered HTML / DOM
  hydrate: [
    () => new UldeInternalLinkPlugin(),
    () => new ULDEPlaygroundInjectorPlugin(),
    () => new UldeMermaidPlugin(),
    () => new UldeKatexPlugin(),
  ],

  // ULDE system: diagnostics, overlay, performance analysis
  afterRender: [

    // () => new UldeMermaidPlugin(),
    () => new ULDEOverlayCustomPanelPlugin(),
    () => new ULDETimelineProfilerPlugin(),
    () => new ULDESlowPluginDetectorPlugin(),

  ],
};
