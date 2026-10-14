// ulde/plugins/interactive/ulde-mermaid.plugin.ts

import { ULDEPluginInstance, ULDEPluginKind } from "@ulde/types/plugin";

import { createComponent, EnvironmentInjector } from "@angular/core";
import { Example01 } from "../../../../app/demo/example01/example01"; // TBD
import { ULDEExecutionContext } from "@ulde/types";
import { isBrowser } from "../../../../app/global.utils/global.utils";


import mermaid from 'mermaid';
import type { MermaidConfig } from 'mermaid';
import Panzoom from '@panzoom/panzoom'
// import type { BrowserDomPlugin } from '../../core/host/ulde-browser-host';
import { readSessionState } from '@ulde/configurator';


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

let zoomInHandlers: Array<{ button: HTMLButtonElement; handler: (e: Event) => void }> = [];
let zoomOutHandlers: Array<{ button: HTMLButtonElement; handler: (e: Event) => void }> = [];
let resetHandlers: Array<{ button: HTMLButtonElement; handler: (e: Event) => void }> = [];

let handleEventError: (e: any) => void;
let handleEventUnhandle: (e: any) => void;
let counter: number = 0;

export class UldeMermaidPlugin implements ULDEPluginInstance {
  pluginKind: ULDEPluginKind = 'interactive';
  pluginName = "UldeMermaidPlugin";
  description = "render mermaid graph";
  enabled = true;

  async run(ctx: ULDEExecutionContext) {

    if (ctx.lifecyclePhase !== 'hydrate') return;
    if (!ctx.render) return;
    if (!isBrowser()) return;


    console.log(`Log: [UldeMermaidPlugin] Start`);


    const { diagnostics } = ctx.artifacts;
    // clear the contents as initializing to prevent duplication in case of re-run;
    // const panel = document.querySelector('.dv-mermaid-debug-panel-content') as HTMLDivElement;
    // panel.innerHTML = '';

    // console.log(`Log: [UldeMermaidBrowserPlugin] init, \ncounter(called)=`, counter++, `\ncontainer=`, container, `\npanel=`, panel);

    const { docTheme } = readSessionState(isBrowser());




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


    const postRenderCB = genPostRenderCB(container);

    console.log(`Log: [UldeMermaidPlugin] container`, container);
    let mermaidNodes!: NodeListOf<HTMLElement>;
    requestAnimationFrame(() => {

      [error on diagnostics]

      mermaidNodes = container.querySelectorAll<HTMLElement>('pre code.language-mermaid');
      if (mermaidNodes.length < 1) {
        diagnostics.push({
          level: "error",
          lifecyclePhase: ctx.lifecyclePhase,
          message: `selector 'code.language-mermaid' not found in 'markdown-host'`,
          pluginKind: this.pluginKind,
          pluginName: this.pluginName
        });
      };


      // console.log(`Log: [UldeMermaidPlugin] mermaidNodes=`, mermaidNodes);

      // const logMermaidDebug = (message: string) => {
      //   const entry = document.createElement('li');
      //   entry.textContent = message;
      //   entry.style.marginBottom = '6px';

      //   panel.appendChild(entry);
      //   // console.log(`Log: [UldeMermaidBrowserPlugin] ogMermaidDebug, entry=`, panel, entry.textContent);
      // }


      try {
        // Patch Mermaid internal async error handler → log to debug panel
        mermaid.parseError = (err: any, hash: any) => {

          diagnostics.push({
            level: "error",
            lifecyclePhase: ctx.lifecyclePhase,
            message: `[Mermaid internal error]\n${err?.message || err}\nHash: ${hash ?? 'n/a'}`,
            pluginKind: this.pluginKind,
            pluginName: this.pluginName
          });
          // logMermaidDebug(`[Mermaid internal error]\n${err?.message || err}\nHash: ${hash ?? 'n/a'}`);
        };

        // Also catch global Mermaid-related errors
        handleEventError = (event: any) => {
          const error = event.error;
          if (error && typeof error.stack === 'string' && error.stack.includes('mermaid')) {
            diagnostics.push({
              level: "error",
              lifecyclePhase: ctx.lifecyclePhase,
              message: `[Window error]\n${error.message}`,
              pluginKind: this.pluginKind,
              pluginName: this.pluginName
            });
            // logMermaidDebug(`[Window error]\n${error.message}`);
            // Do not preventDefault globally; just log
          }
        };
        window.addEventListener('error', handleEventError);

        handleEventUnhandle = (event: any) => {
          const reason: any = event.reason;
          if (reason && typeof reason.stack === 'string' && reason.stack.includes('mermaid')) {

            diagnostics.push({
              level: "error",
              lifecyclePhase: ctx.lifecyclePhase,
              message: `[Unhandled Promise Rejection]\n${reason.message}`,
              pluginKind: this.pluginKind,
              pluginName: this.pluginName
            });
            // logMermaidDebug(`[Unhandled Promise Rejection]\n${reason.message}`);
          }
        };
        window.addEventListener('unhandledrejection', handleEventUnhandle);

        // Initialize Mermaid AFTER nodes exist

        mermaid.initialize({
          ...(docTheme === 'dark' ? mermaidConfigDarkTheme : mermaidConfigLightTheme),

        });

        // Run Mermaid
        mermaid.run({
          // await mermaid.run({
          nodes: mermaidNodes,
          postRenderCallback: postRenderCB
        });

        // if (panel.innerHTML == '') {
        //   panel.append('No Debug Entries Found');
        // }

        console.log(`Log: [UldeMermaidPlugin] Finished`);


      } catch (err: any) {
        // Only log to debug panel, not console

        diagnostics.push({
          level: "error",
          lifecyclePhase: ctx.lifecyclePhase,
          message: `[ULDE Mermaid Browser Plugin caught error]\n${err?.message || String(err)}`,
          pluginKind: this.pluginKind,
          pluginName: this.pluginName
        });
        // logMermaidDebug(`[ULDE Mermaid Browser Plugin caught error]\n${err?.message || String(err)}`
        // );
      }

    });
    // return () => {
    //   zoomInHandlers.forEach(zoomIn => zoomIn.button.removeEventListener('click', zoomIn.handler));
    //   zoomOutHandlers.forEach(zoomOut => zoomOut.button.removeEventListener('click', zoomOut.handler));
    //   resetHandlers.forEach(reset => reset.button.removeEventListener('click', reset.handler));

    //   window.removeEventListener('error', handleEventError);
    //   window.removeEventListener('unhandledrejection', handleEventUnhandle);
    // };

  };

  destroy(): void | Promise<void> {

    zoomInHandlers.forEach(zoomIn => zoomIn.button.removeEventListener('click', zoomIn.handler));
    zoomOutHandlers.forEach(zoomOut => zoomOut.button.removeEventListener('click', zoomOut.handler));
    resetHandlers.forEach(reset => reset.button.removeEventListener('click', reset.handler));

    window.removeEventListener('error', handleEventError);
    window.removeEventListener('unhandledrejection', handleEventUnhandle);
  }

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
function genPostRenderCB(container: HTMLElement): (id: any) => void {
  return (svgId: any) => {
    const selectorId = "#" + svgId;
    const svg = container.querySelector(selectorId) as SVGElement;
    // console.log(`Log: [UldeMermaidBrowserPlugin] svg=`, svg);
    if (!svg) return;

    // Initialize Panzoom
    const panzoom = Panzoom(svg as SVGElement, {
      maxScale: 5,
      minScale: 0.5,
      step: 0.1,
    });

    // code node
    const codeNode = svg.parentNode;
    // pre node
    const pre = codeNode?.parentElement;
    if (!pre || !codeNode) return;

    pre.className = "mermaid-container";

    const buttonContainer = document.createElement('div');
    buttonContainer.className = "mermaid-button-container";
    // zoomin
    const zoomIn = document.createElement('button');
    zoomIn.className = "mermaid-zoomin-button";
    zoomIn.innerText = "+";
    const handlerIn = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      panzoom.zoomIn({ animate: true });
    };
    zoomIn.addEventListener('click', handlerIn);
    zoomInHandlers.push({ button: zoomIn, handler: handlerIn });
    // zoomout
    const zoomOut = document.createElement('button');
    zoomOut.className = "mermaid-zoomout-button";
    zoomOut.innerText = "-";
    const handlerOut = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      panzoom.zoomOut({ animate: true });
    };
    zoomOut.addEventListener('click', handlerOut);
    zoomOutHandlers.push({ button: zoomOut, handler: handlerOut });
    // rset
    const reset = document.createElement('button');
    reset.className = "mermaid-reset-button";
    reset.innerText = "reset";
    const handlerReset = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      panzoom.reset({ animate: false });
    };
    reset.addEventListener('click', handlerReset);
    resetHandlers.push({ button: reset, handler: handlerReset });

    buttonContainer.appendChild(zoomIn);
    buttonContainer.appendChild(zoomOut);
    buttonContainer.appendChild(reset);

    pre.insertBefore(buttonContainer, codeNode);

    // console.log(`Log: [UldeMermaidBrowserPlugin] final pr=`, pre);

  };
};
