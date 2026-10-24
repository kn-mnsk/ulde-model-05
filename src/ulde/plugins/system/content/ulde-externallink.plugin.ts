// src/ulde/plugins/system/content/ulde-externallink.plugin.ts

import { ULDEExecutionContext } from "@ulde/types";
import { ULDEPluginInstance, ULDEPluginKind } from "@ulde/types/plugin";

export class ULDEExternalLinkPlugin
  implements ULDEPluginInstance {

  readonly pluginName =
    'ULDEExternalLinkPlugin';

  readonly pluginKind: ULDEPluginKind =
    'content';

  readonly lifecyclePhase =
    'load';

  run(
    ctx: ULDEExecutionContext
  ): void {

    ctx.page.source.raw =
      this.normalizeExternalLinks(
        ctx.page.source.raw
      );

    console.log(`Log: [ULDExternalLinkPlugin]  run normalized raw=\n`, ctx.page.source.raw);

  }

  destroy(): void { }

  private normalizeExternalLinks(
    raw: string
  ): string {

    const pattern =
      /<a\s+href="([^"]+)"[^&]*>([^<]+)<\/a>/gi;

    // const pattern =
    //   /&lt;a\s+href="<a\s+href="([^"]+)"[^>]*>.*?<\/a>"[^>]*&gt;([^<]+)&lt;\/a&gt;/gi;


    // const html = `<a href="https://github.com/angular/angular-cli" target="_blank" rel="noopener noreferer"  title="External Site">Angular CLI version 21.0.0.</a>`
    // const normalizedHtml = html.replace(pattern,
    //   (_, href, text) =>
    //     `[external:${text.trim()}](${href.trim()})`
    // );

    // console.log(`Log: [ULDEExternalLinkPlugin] \nnormalized html=\n`, normalizedHtml, `\n`, html);

    const normalized = raw.replace(
      pattern,
      (_, href, text) =>
        `[external:${text.trim()}](${href.trim()})`
    );
    // console.log(`Log: [ULDEExternalLinkPlugin] \nnormalized raw=\n`, normalized);

    return normalized;

    // return raw.replace(
    //   pattern,
    //   (_, href, text) =>
    //     `[external:${text.trim()}](${href.trim()})`
    // );
  }
}
