// src/ulde/plugins/system/content/ulde-externallink.plugin.ts

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

    // const pattern = /<a\s+href="([^"]+)"[^&]*\s+title="([^"]+)"[^&]*>([^<]+)<\/a>/gi;

    // Regex to capture href, optional title, and inner text
    // Group 1: href
    // Group 2: title (optional)
    // Group 3: inner text
    const pattern = /<a\s+href="([^"]+)"(?:\s+title="([^"]*)")?>(.*?)<\/a>/gi;

    const normalized = raw.replace(
      pattern,
      (_, href, title, text) => {

        const safeHref = (href || '').trim();
        const safeTitle = (title || '').trim();
        const safeText = (text || '').trim();

        // If title exists, include it in markdown
        return safeTitle
          ? `[external:${safeText}](${safeHref} "${safeTitle}")`
          : `[external:${safeText}](${safeHref})`;
      }
    );

    // console.log(`Log: [ULDEExternalLinkPlugin] \nnormalized raw=\n`, normalized);

    return normalized;

  }
}
