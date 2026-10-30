// ulde/plugins/interactive/ulde-katex.plugin.ts

import { ULDEPluginInstance, ULDEPluginKind } from "@ulde/types/plugin";

import { ULDEExecutionContext } from "@ulde/types";
import { isBrowser } from "../../../../app/global.utils/global.utils";

import renderMathInElement from 'katex/contrib/auto-render';


export class UldeKatexPlugin implements ULDEPluginInstance {
  pluginKind: ULDEPluginKind = 'interactive';
  pluginName = "UldeKatexPlugin";
  description = "render Latex";
  enabled = true;

  async run(ctx: ULDEExecutionContext): Promise<void> {

    if (!isBrowser()) return;

    // console.log(`Log: [UldeKatexPlugin] run() Start`);

    const { diagnostics } = ctx.artifacts;

    const container = document.querySelector<HTMLElement>('.markdown-host');

    if (!container) {
      diagnostics.push({
        level: "error",
        lifecyclePhase: ctx.lifecyclePhase,
        message: `selector class='markdown-host' not found`,
        pluginKind: this.pluginKind,
        pluginName: this.pluginName
      });
      return;
    }

    requestAnimationFrame(() => {
      renderMathInElement(container, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\begin{equation}", right: "\\end{equation}", display: true },
          { left: "\\begin{align}", right: "\\end{align}", display: true },
          { left: "\\begin{alignat}", right: "\\end{alignat}", display: true },
          { left: "\\begin{gather}", right: "\\end{gather}", display: true },
          { left: "\\begin{CD}", right: "\\end{CD}", display: true },
          { left: "\\[", right: "\\]", display: true }
        ],
        errorCallback: (err) => {
          diagnostics.push({
            level: "error",
            lifecyclePhase: ctx.lifecyclePhase,
            message: `Error in renderMathInElement, ${JSON.stringify(err)}`,
            pluginKind: this.pluginKind,
            pluginName: this.pluginName
          });

          // console.error('Error in katex-render.service renderMathInElement', JSON.stringify(`${err}`));
        },
        throwOnError: false,
        errorColor: "#ff0000",
        output: "mathml",
      });
    });

    // console.log(`Log: [UldeKatexPlugin] run() Finish`);


  }
}
