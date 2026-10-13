// src/ulde/plugins/system/navigation/ulde-internal-link.plugin.ts

import { ULDEPluginInstance, ULDEPluginKind } from "@ulde/types/plugin";

import { createComponent, EnvironmentInjector } from "@angular/core";
import { Example01 } from "../../../../app/demo/example01/example01"; // TBD
import { ULDEExecutionContext } from "@ulde/types";
import { isBrowser } from "../../../../app/global.utils/global.utils";

export class UldeInternalLinkPlugin implements ULDEPluginInstance {
  pluginKind: ULDEPluginKind = 'navigation';
  pluginName = "UldeInternalLinkPlugin";
  description = "register internal link as event lisner to load a new document or angular component";
  enabled = true;
  async run(ctx: ULDEExecutionContext) {

    if (ctx.lifecyclePhase !== 'hydrate') return;
    if (!ctx.render) return;
    if (!isBrowser()) return;

    const markdownHost = document.querySelector('.markdown-host');
    if (!markdownHost) {
      ctx.artifacts.diagnostics.push({
        level: "error",
        message: `'Can't find the htmlelement with class "markdown-host"`,
        lifecyclePhase: ctx.lifecyclePhase,
        pluginKind: this.pluginKind,
        pluginName: this.pluginName
      });
      return;
    }

    requestAnimationFrame(() => {
      const internalLinks = markdownHost.querySelectorAll(`a[href^="#pageId:docs/"]`);


      console.log(`Log: [UldeInternalLinkPlugin] Internal Doc Routing \ninternalLinks=`, internalLinks, `\nmarkdownContainer=`, markdownHost);

      internalLinks.forEach(a => {
        a.addEventListener('click', (e: any) => {
          e.preventDefault();

          const href = a.getAttribute('href')!;
          const pageId = href.replace('#pageId:', '');

          const rect = a.getBoundingClientRect();
          const containerRect = markdownHost.getBoundingClientRect();
          const anchorPos = Number((rect.top - containerRect.top).toFixed(2));; // anchor position

          console.log(`Log: [UldeInternalLinkPlugin] Internal Doc Routing pageId=`, pageId);

          markdownHost.dispatchEvent(new CustomEvent('ulde:navigate', {
            detail: {
              pageId: pageId,
              // scrollTop: e.clientY
            },
            bubbles: true
          }));
        });
      });
    });


  }

}
