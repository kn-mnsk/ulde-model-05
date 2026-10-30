// src/ulde/plugins/system/content/ulde-frontmatter-normalizer.plugin.ts

import { ULDEExecutionContext } from '@ulde/types';
import { ULDEPluginInstance, ULDEPluginKind } from '@ulde/types/plugin';

export class ULDEFrontmatterNormalizerPlugin implements ULDEPluginInstance {
  pluginKind: ULDEPluginKind = 'content';
  pluginName = "ULDEFrontmatterNormalizerPlugin";
  description = "Normalizes frontmatter fields";
  enabled = true;
  async run(ctx: ULDEExecutionContext) {

    if (ctx.lifecyclePhase !== 'load') return;

    // console.log('Log: [ULDEFrontmatterNormalizerPlugin] run');

    // How and what to be Coded???
    // ctx.meta['title'] ??= "Untitled";
    // ctx.meta['tags'] ??= [];
    // ctx.meta['updated'] ??= new Date().toISOString();


    const frontmatter = { title: "Untitled", 'tags': [], updated: new Date().toISOString() };

    ctx.artifacts.pluginData['frontmatter'] = frontmatter;

    // console.log('Log: [ULDEFrontmatterNormalizerPlugin] finished');


  }
}
