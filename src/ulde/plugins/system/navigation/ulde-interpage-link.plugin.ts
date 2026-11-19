// src/ulde/plugins/system/navigation/ulde-internal-link.plugin.ts

import { ULDEPluginInstance, ULDEPluginKind } from "@ulde/types/plugin";

import { Example01 } from "../../../../app/demo/example01/example01"; // TBD
import { ULDEExecutionContext } from "@ulde/types";
import { isBrowser } from "../../../../app/global.utils/global.utils";

export class UldeInterPageLinkPlugin implements
  ULDEPluginInstance {

  pluginKind: ULDEPluginKind = 'navigation';
  pluginName = "UldeInternalLinkPlugin";
  description = "register internal link as event lisner to load a new document or angular component";
  enabled = true;

  async run(
    ctx: ULDEExecutionContext
  ): Promise<void> {

    if (ctx.lifecyclePhase !== 'hydrate') return;
    if (!ctx.render) return;
    if (!isBrowser()) return;

    const markdownHost =
      document.querySelector('.markdown-host');

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

      const interPageLinks =
        markdownHost.querySelectorAll(
          `a[href^="#pageId:docs/"]`
        );

      console.log(
        `Log: [UldeInterPageLinkPlugin]`,
        `\n\tInterPage Routing`,
        `\n\tinterPageLinks=`, interPageLinks,
        `\n\tmarkdownContainer=`, markdownHost
      );

      requestAnimationFrame(() => {

        interPageLinks.forEach(a => {
          a.addEventListener('click', (e: Event) => {

            e.preventDefault();

            const href = a.getAttribute('href')!;
            const pageId = href.replace('#pageId:', '');

            const rect = a.getBoundingClientRect();
            const containerRect = markdownHost.getBoundingClientRect();
            const anchorPos = Number((rect.top - containerRect.top).toFixed(2));; // anchor position

            console.log(
              `Log: [UldeInternalLinkPlugin]`,
              `\n\tInterPage Routing pageId=`, pageId,
              `\n\tanchoPos=`, anchorPos
            );

            const InterPageLinkEvent =
              new CustomEvent('ulde:interpagelink', {
                detail: {
                  pageId: pageId,
                  scrollTop: anchorPos,
                },
                bubbles: true
              });

            markdownHost.dispatchEvent(InterPageLinkEvent);

          });
        });
      });

    });

  }

}
