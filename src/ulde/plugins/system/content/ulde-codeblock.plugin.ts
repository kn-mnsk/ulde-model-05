// src/ulde/plugins/system/content/ulde-codeblock.plugin.ts

import { ULDEExecutionContext } from "@ulde/types";
import {ULDEPluginInstance, ULDEPluginKind } from "@ulde/types/plugin";

export class ULDECodeblockPlugin implements ULDEPluginInstance {
  pluginKind: ULDEPluginKind = 'content';
  pluginName = "CodeblockEnhancer";
  description = "Markdown Code Block Enhancer: Enhances fenced code blocks with metadata";
  enabled = true;

  async run(ctx: ULDEExecutionContext) {
    if (ctx.lifecyclePhase !== 'load') return;
    if (ctx.page.source.raw === undefined) return;


    console.log('Log: [ULDECodeblockPlugin] run');

    ctx.page.source.raw = ctx.page.source.raw.replace(/```(\w+)/g, ((m: any, lang: any) => {
      return `\`\`\`${lang} data-lang="${lang}"`;
    }));

    console.log('Log: [ULDECodeblockPlugin] finished');
  }

}
