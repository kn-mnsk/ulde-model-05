// src/ulde/plugins/system/navigation/ulde-internal-link.plugin.ts

import { ULDEPluginInstance, ULDEPluginKind } from "@ulde/types/plugin";

import { createComponent, EnvironmentInjector } from "@angular/core";
import { Example01 } from "../../../../app/demo/example01/example01"; // TBD
import { ULDEExecutionContext } from "@ulde/types";

export class UldeInternalLinkPlugin implements ULDEPluginInstance {
  pluginKind: ULDEPluginKind = 'navigation';
  pluginName = "UldeInternalLinkPlugin";
  description = "register internal link as event lisner to load a new document or angular component";
  enabled = true;
  async run(ctx: ULDEExecutionContext) {

    if (ctx.lifecyclePhase !== 'hydrate') return;
    if (!ctx.render) return;

    const markdownContainer = document?.querySelector('ulde-markdown-container');
    if (!markdownContainer) {
      ctx.artifacts.diagnostics.push({
        level: "error",
        message: `'Can't find the htmlelement with class "ulde-markdown-container"`,
        lifecyclePhase: ctx.lifecyclePhase,
        pluginKind: this.pluginKind,
        pluginName: this.pluginName
      });
      return;
    }

    const internalLinks = markdownContainer.querySelectorAll('a[href^="#docId:"]');

    internalLinks.forEach(a => {
      a.addEventListener('click', (e: any) => {
        e.preventDefault();

        const href = a.getAttribute('href')!;
        const pageId = href.replace('#docId:', '');

        const rect = a.getBoundingClientRect();
        const containerRect = markdownContainer.getBoundingClientRect();
        const anchorPos = Number((rect.top - containerRect.top).toFixed(2));; // anchor position

        // console.log(`Log: [UldeAnchotsBrowserPlugin] Internal Doc Routing Click Event ClientY=`, e.currentTarget);

        markdownContainer.dispatchEvent(new CustomEvent('ulde:navigate', {
          detail: {
            pageId: pageId,
            // scrollTop: e.clientY
          },
          bubbles: true
        }));
      });
    });

  }

}
