// src/ulde/plugins/system/navigation/ulde-externallink.plugin.ts

import { ULDEExecutionContext } from "@ulde/types";
import { ULDEPluginInstance, ULDEPluginKind } from "@ulde/types/plugin";

export class ULDEExternalLinkPlugin
  implements ULDEPluginInstance {

  readonly pluginName =
    'ULDEExternalLinkPlugin';

  readonly pluginKind: ULDEPluginKind =
    'navigation';

  readonly lifecyclePhase =
    'load';

  run(
    ctx: ULDEExecutionContext
  ): void {

    ctx.page.source.raw =
      this.normalizeExternalLinks(
        ctx.page.source.raw
      );

    // console.log(`Log: [ULDExternalLinkPlugin]  run normalized raw=\n`, ctx.page.source.raw);

  }

  destroy(): void { }


  private normalizeExternalLinks(
    raw: string
  ): string {

    const pattern =
      /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;

    const normalized = raw.replace(
      pattern,
      (_, attrs, text) => {
        const hrefMatch = attrs.match(
          /\bhref\s*=\s*"([^"]*)"/i
        );

        const titleMatch = attrs.match(
          /\btitle\s*=\s*"([^"]*)"/i
        );

        const safeHref = hrefMatch?.[1]?.trim() ?? '';
        const safeTitle = titleMatch?.[1]?.trim() ?? '';
        const safeText = (text || '').trim();

        return safeTitle
          ? `[external:${safeText}](${safeHref} "${safeTitle}")`
          : `[external:${safeText}](${safeHref})`;
      }
    );

    return normalized;

  }

  // private normalizeExternalLinks(
  //   raw: string
  // ): string {

  //   const pattern = /<a\s+href="([^"]+)"(?:\s+title="([^"]*)")?>(.*?)<\/a>/gi;

  //   const normalized = raw.replace(
  //     pattern,
  //     (_, href, title, text) => {

  //       const safeHref = (href || '').trim();
  //       const safeTitle = (title || '').trim();
  //       const safeText = (text || '').trim();

  //       // If title exists, include it in markdown
  //       return safeTitle
  //         ? `[external:${safeText}](${safeHref} "${safeTitle}")`
  //         : `[external:${safeText}](${safeHref})`;
  //     }
  //   );

  //   // console.log(`Log: [ULDEExternalLinkPlugin] \nnormalized raw=\n`, normalized);

  //   return normalized;

  // }


}
