// ulde/plugins/interactive/ulde-mermaid.plugin.ts
import { inject, Inject } from '@angular/core'

import { ULDEPluginInstance, ULDEPluginKind } from "@ulde/types/plugin";

import { ULDEExecutionContext } from "@ulde/types";
import { isBrowser } from "../../../../app/global.utils/global.utils";

import mermaid from 'mermaid';
import type { MermaidConfig } from 'mermaid';
import Panzoom from '@panzoom/panzoom'
import { UldeThemeService } from "@ulde/configurator";
// import { readSessionState } from '@ulde/configurator';


/* ---------------------------------------------------------
   Mermaid Theme Configs
--------------------------------------------------------- */

const mermaidConfigDarkTheme: MermaidConfig = {
  startOnLoad: false,
  securityLevel: 'strict',
  theme: 'dark',
  themeVariables: {
    fontSize: '18px',
    fontFamily: 'Trebuchet MS, Verdana, Arial, Sans-Serif',
    primaryColor: '#2d3748',
    primaryTextColor: '#e2e8f0',
    primaryBorderColor: '#63b3ed',
    secondaryColor: '#4a5568',
    tertiaryColor: '#2c5282',
    lineColor: '#63b3ed',
    nodeTextSize: '20px',
    edgeLabelFontSize: '14px',
    labelTextSize: '16px',
    background: '#1e1e1e',
    clusterBkg: '#2d3748',
    clusterBorder: '#63b3ed'
  },
  flowchart: { htmlLabels: true, curve: 'linear' },
  state: { radius: 10 },
  sequence: { noteFontSize: '20px' }
};

const mermaidConfigLightTheme: MermaidConfig = {
  startOnLoad: false,
  securityLevel: 'strict',
  theme: 'default',
  themeVariables: {
    fontSize: '16px',
    fontFamily: 'Trebuchet MS, Verdana, Arial, Sans-Serif',
    primaryColor: '#f0f9ff',
    primaryTextColor: '#1a202c',
    primaryBorderColor: '#3182ce',
    secondaryColor: '#bee3f8',
    tertiaryColor: '#90cdf4',
    lineColor: '#3182ce',
    nodeTextSize: '18px',
    edgeLabelFontSize: '14px',
    labelTextSize: '16px',
    background: '#ffffff',
    clusterBkg: '#edf2f7',
    clusterBorder: '#3182ce'
  },
  flowchart: { htmlLabels: true, curve: 'basis' }
};

/* ---------------------------------------------------------
   Panzoom Handler Storage
--------------------------------------------------------- */


type PanzoomHandler = {
  button: HTMLButtonElement;
  handler: (e: Event) => void
}[];

export class UldeMermaidPlugin implements ULDEPluginInstance {

  private zoomInHandlers: PanzoomHandler = [];

  private zoomOutHandlers: PanzoomHandler = [];

  private resetHandlers: PanzoomHandler = [];

  private panZoomHandlers: PanzoomHandler[] = [];

  private handleEventError!: (e: any) => void;
  private handleEventUnhandle!: (e: any) => void;

  pluginKind: ULDEPluginKind = 'interactive';
  pluginName = "UldeMermaidPlugin";
  description = "render mermaid graph";
  enabled = true;

  constructor(
    private themeService: UldeThemeService
  ) { }

  // async run(ctx: ULDEExecutionContext){
  async run(
    ctx: ULDEExecutionContext
  ): Promise<void> {

    if (ctx.lifecyclePhase !== 'hydrate') {
      return new Promise(() => undefined);
    };

    if (!ctx.render) {
      return new Promise(() => undefined);
    };

    if (!isBrowser()) {
      return new Promise(() => undefined);
    };


    // console.log(`Log: [UldeMermaidPlugin] run() Start`);

    const { diagnostics }
      = ctx.artifacts;

    const docTheme =
      this.themeService.currentTheme ?? 'light';

    // let container!: HTMLElement | null;
    // let mermaidNodes!: NodeListOf<HTMLElement>;


    const container: HTMLElement | null =
      document.querySelector<HTMLElement>(
        '.markdown-host'
      );

    if (!container) {
      diagnostics.push(
        {
          level: "error",
          lifecyclePhase: ctx.lifecyclePhase,
          message: `selector class='markdown-host' not found`,
          pluginKind: this.pluginKind,
          pluginName: this.pluginName
        }
      );
      return new Promise(() => undefined);
    }


    const postRenderCB =
      this.genPostRenderCB(container);

    // console.log(`Log: [UldeMermaidPlugin] container`, container);


    requestAnimationFrame(() => {

      const mermaidNodes: NodeListOf<HTMLElement> =
        container.querySelectorAll<HTMLElement>(
          'pre code.language-mermaid'
        );

      if (mermaidNodes.length < 1) {
        diagnostics.push(
          {
            level: "info",
            lifecyclePhase: ctx.lifecyclePhase,
            message: `selector 'code.language-mermaid' not found in 'markdown-host'`,
            pluginKind: this.pluginKind,
            pluginName: this.pluginName
          }
        );
      };

      try {
        // Patch Mermaid internal async error handler → log to debug panel
        mermaid.parseError = (err: any, hash: any) => {

          diagnostics.push(
            {
              level: "error",
              lifecyclePhase: ctx.lifecyclePhase,
              message: `[Mermaid internal error]\n${err?.message || err}\nHash: ${hash ?? 'n/a'}`,
              pluginKind: this.pluginKind,
              pluginName: this.pluginName
            }
          );
        };

        // Also catch global Mermaid-related errors
        this.handleEventError = (event: any) => {

          const error =
            event.error;

          if (
            error &&
            typeof error.stack === 'string' &&
            error.stack.includes('mermaid')
          ) {
            diagnostics.push(
              {
                level: "error",
                lifecyclePhase: ctx.lifecyclePhase,
                message: `[Window error]\n${error.message}`,
                pluginKind: this.pluginKind,
                pluginName: this.pluginName
              }
            );
          }
        };

        window.addEventListener(
          'error',
          this.handleEventError
        );

        this.handleEventUnhandle = (event: any) => {

          const reason: any =
            event.reason;

          if (
            reason &&
            typeof reason.stack === 'string' &&
            reason.stack.includes()
          ) {

            diagnostics.push(
              {
                level: "error",
                lifecyclePhase: ctx.lifecyclePhase,
                message: `[Unhandled Promise Rejection]\n${reason.message}`,
                pluginKind: this.pluginKind,
                pluginName: this.pluginName
              }
            );
          }
        };

        window.addEventListener(
          'unhandledrejection',
          this.handleEventUnhandle
        );

        // Initialize Mermaid AFTER nodes exist

        mermaid.initialize(
          {
            ...(docTheme === 'dark' ?
              mermaidConfigDarkTheme :
              mermaidConfigLightTheme
            ),
          }
        );

        // Run Mermaid
        mermaid.run(
          {
            nodes: mermaidNodes,
            postRenderCallback: postRenderCB
          }
        );

      } catch (err: any) {
        // Only log to debug panel, not console

        diagnostics.push(
          {
            level: "error",
            lifecyclePhase: ctx.lifecyclePhase,
            message: `[ULDE Mermaid Browser Plugin caught error]\n${err?.message || String(err)}`,
            pluginKind: this.pluginKind,
            pluginName: this.pluginName
          }
        );
      }
    }
    );

  };

  async destroy(): Promise<void> {

    // console.log(`Log: [UldeMermaidPlugin] destroy() start`);

    this.panZoomHandlers.push(
      this.zoomInHandlers,
      this.zoomOutHandlers,
      this.resetHandlers
    );
    // tear down process
    this.panZoomHandlers.forEach(pHandler =>
      pHandler.forEach(p =>
        p.button.removeEventListener(
          'click',
          p.handler
        )

      )
    );

    this.zoomInHandlers = [];
    this.zoomOutHandlers = [];
    this.resetHandlers = [];
    this.panZoomHandlers = [];

    window.removeEventListener(
      'error',
      this.handleEventError
    );

    window.removeEventListener(
      'unhandledrejection',
      this.handleEventUnhandle
    );
    // console.log(`Log: [UldeMermaidPlugin] destroy() start`);
  }




  /*
      Source - https://stackoverflow.com/a/79199554
      Posted by grappler
      Retrieved 2026-04-23, License - CC BY-SA 4.0
      */

  // mermaid code block <pre><code class="language-container">...</code></pre> by mardown-it
  /**
   * A callback to call after each diagram is rendered.
   * mermaid code block: <pre><code class="language-mermaid">'mermaid source'</code></pre>, generated by "markdown-it"
   * this callback changes <pre><code class="language-mermaid"><svg>...</svg></code></pre>to to
   * <pre class="mermaid-container"><div class="mermaid-button-container"><code class="language-mermaid"><svg>...</svg></code></pre>, also to implement zoomIn, zoomOut, reset evens.
   * @param svgId
   * @returns
   */
  private genPostRenderCB(container: HTMLElement): (id: any) => void {
    return (svgId: any) => {

      const selectorId = "#" + svgId;

      const svg =
        container.querySelector(selectorId) as SVGElement;

      // console.log(`Log: [UldeMermaidBrowserPlugin] svg=`, svg);
      if (!svg) return;

      // Initialize Panzoom
      const panzoom = Panzoom(
        svg as SVGElement,
        {
          maxScale: 5,
          minScale: 0.5,
          step: 0.05,
          canvas: true,
          startScale: 0.6,
          startX: -100,
          // startY: -50,
          
        }
      );

      // code node
      const codeNode =
        svg.parentNode;

      // debug
      /**  'data-lang=mermaid' is added in the class  , somewhere in the pipeline*/
      const code =
        svg.parentElement;
      // console.log(
      //   `[ULDEMermaidPlugin] code htmlelment=\n`,
      //   code
      // );
      code?.classList.remove('data-lang="mermaid"')
      //debug

      // pre node
      const pre =
        codeNode?.parentElement;

      if (
        !pre ||
        !codeNode
      )
        return;

      pre.className =
        "mermaid-container";

      const buttonContainer =
        document.createElement('div');

      buttonContainer.className =
        "mermaid-button-container";

      // zoomin
      const zoomIn =
        document.createElement('button');

      zoomIn.className =
        "mermaid-zoomin-button";
      zoomIn.innerText = "＋";

      const handlerIn = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        panzoom.zoomIn({ animate: true });
      };

      zoomIn.addEventListener(
        'click',
        handlerIn
      );

      this.zoomInHandlers.push(
        {
          button: zoomIn,
          handler: handlerIn
        }
      );

      // zoomout
      const zoomOut =
        document.createElement('button');

      zoomOut.className =
        "mermaid-zoomout-button";

      zoomOut.innerText
        = "－";

      const handlerOut = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        panzoom.zoomOut({ animate: true });
      };

      zoomOut.addEventListener(
        'click',
        handlerOut
      );

      this.zoomOutHandlers.push(
        {
          button: zoomOut,
          handler: handlerOut
        }
      );

      // rset
      const reset =
        document.createElement('button');

      reset.className =
        "mermaid-reset-button";

      reset.innerText =
        "🔄️";

      const handlerReset = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        panzoom.reset({ animate: false });
      };
      reset.addEventListener(
        'click',
        handlerReset
      );

      this.resetHandlers.push(
        {
          button: reset,
          handler: handlerReset
        }
      );

      buttonContainer.appendChild(zoomIn);
      buttonContainer.appendChild(zoomOut);
      buttonContainer.appendChild(reset);

      pre.insertBefore(buttonContainer, codeNode);


      // console.log(`Log: [UldeMermaidBrowserPlugin] final pr=`, pre);

    };
  };

}

