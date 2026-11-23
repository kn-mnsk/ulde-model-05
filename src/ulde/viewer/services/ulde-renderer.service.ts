// src/ulde/viewer/services/ulde-renderer.service.ts

/**
 * Ownership should be
 *
1. render HTML
2. update DOM
3. emit event
 */

import { ElementRef, Injectable } from '@angular/core';

import {
  ULDERenderContext,
  ULDETocNode,
  ULDETocEntry
} from '@ulde/types/context';

import {
  ULDEDiagnostic
} from '@ulde/types/diagnostics';

import {
  ULDEFrame

} from '@ulde/types/frame';

import {
  ULDERendererConfig,
  ULDERendererEvents,
  ULDERendererHandle,
  ULDERendererState
} from '@ulde/types/renderer';


@Injectable({ providedIn: 'root' })
export class ULDERendererService {

  private rendererHandle: ULDERendererHandle | null = null;

  init(
    rendererState: ULDERendererState,
    host: ElementRef<HTMLElement>,
    size: { width: number; height: number },
    events?: ULDERendererEvents
  ): void {

    const config: ULDERendererConfig = {
      container: host.nativeElement,
      width: size.width,
      height: size.height,
      backgroundColor: '#ffffff'
    };

    this.rendererHandle =
      this.createUldeRendererHandle(
        rendererState,
        config,
        events
      );

    events?.onReady?.();
  }

  setState(
    partial: Partial<ULDERendererState>
  ): void {
    this.rendererHandle?.setState(partial);
  }

  getState(): ULDERendererState | null {

    return this.rendererHandle ? this.rendererHandle.getState() : null;
  }

  highlightDiagnostic(
    message: string
  ): void {

    this.rendererHandle?.highlightDiagnostic(message);
  }

  dispose(): void {

    this.rendererHandle?.dispose();
    this.rendererHandle = null;
  }

  private createUldeRendererHandle(
    rendererState: ULDERendererState,
    config: ULDERendererConfig,
    events?: ULDERendererEvents
  ): ULDERendererHandle {

    // initial placeholder
    const host = config.container;
    host.innerHTML = '<p>ULDE Viewer READY</p>';

    function renderFromContext(
      renderContext: ULDERenderContext | undefined
    ): void {

      if (!renderContext) return;

      host.innerHTML = renderContext.html;
      // bindInteractivity(host);

    }

    function renderLifecyclePhase(
      phase: string | undefined
    ): void {
      // optional: could add a data attribute or small badge
      if (!phase) {
        delete host.dataset['uldeLifecyclePhase'];
        return;
      }

      host.dataset['uldeLifecyclePhase'] = phase;
    }

    function renderDiagnosticsOverlay(
      diags: ULDEDiagnostic[] | undefined
    ): void {

      if (!diags || diags.length === 0) {
        delete host.dataset['uldeDiagnosticsCount'];
        return;
      }
      host.dataset['uldeDiagnosticsCount'] = String(diags.length);

    }

    function renderFrameInfo(
      frame: ULDEFrame | undefined
    ): void {
      // optional: could add timing info; keep minimal for now
      if (!frame) {
        delete host.dataset['uldeFrameId'];
        delete host.dataset['uldeFrameTimestamp'];
        return;
      }

      host.dataset['uldeFrameId'] = frame.id;
      host.dataset['uldeFrameTimestamp'] = String(frame.timestamp);
    }

    function highlightDiagnostic(
      message: string
    ): void {
      const nodes =
        host.querySelectorAll('.ulde-diagnostic');

      nodes.forEach(n => {
        if (n.textContent?.includes(message)) {
          n.classList.add('ulde-diagnostic-highlight');

          setTimeout(() => {
            n.classList.remove('ulde-diagnostic-highlight');
          }, 1500);
        }
      });

    }

    function bindInteractivity(
      host: HTMLElement
    ): void {
      // clear previous listeners by resetting innerHTML already done in renderFromContext

      // add event to highlight active section on scroll
      const sections =
        Array.from(host.querySelectorAll('section'));

      window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY;

        for (const section of sections) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            section.classList.add('active');
          } else {
            section.classList.remove('active');
          }
        }
      });

      // add event to highlight TOC entry for active section
      const tocLinks =
        Array.from(host.querySelectorAll('.ulde-toc a'));

      window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY;

        tocLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (!href) return;

          const target = host.querySelector(href);
          if (!target) return;

          const rect = target.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      });


      // TOC links: .ulde-toc a[href="#section-id"]
      // container.querySelectorAll('.ulde-toc a').forEach(a => {
      //   a.addEventListener('click', ev => {
      //     ev.preventDefault();
      //     const href = (ev.currentTarget as HTMLAnchorElement).getAttribute('href');
      //     if (!href) return;
      //     const target = container.querySelector(href);
      //     if (target) {
      //       target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      //     }
      //   });
      // });

      // Anchors: a[data-ulde-anchor="id"]
      host
        .querySelectorAll('a[data-ulde-anchor]')
        .forEach(a => {
          a.addEventListener('click', ev => {
            ev.preventDefault();
            const id = (ev.currentTarget as HTMLElement).getAttribute('data-ulde-anchor');
            if (!id) return;
            const target = host.querySelector(`#${id}`);
            if (target) {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          });
        });

      // Demo blocks: .ulde-demo[data-demo-code]
      host
        .querySelectorAll('.ulde-demo')
        .forEach(demo => {
          demo.addEventListener('click', () => {
            const code = demo.getAttribute('data-demo-code');
            if (!code) return;
            try {
              const fn = new Function('console', code);
              fn(console);
              // console.log('[ULDE Demo] Running code:', code);
              // // eslint-disable-next-line no-eval
              // eval(code);
            } catch (err) {
              console.error('[ULDE Demo] Error running code:', err);
            }
          });
        });

    }


    // const bindNavigate = (container: HTMLElement) => {

    //   // const handleNavigate = (e: any) => {
    //   //   const pageId = e.detail.pageId;

    //   //   const executionContext = state.executionContext;
    //   //   if (!executionContext) return;
    //   //   executionContext.page.pageId = pageId;

    //   //   this.handle?.setState({ ...state, executionContext });

    //   //   console.log(`Log: [UldeRendererService] bindNavigate pageId=`, pageId);

    //   // };

    //   // container.addEventListener('ulde:navigate', handleNavigate);
    // }

    let currentRendererState!: ULDERendererState;

    return {

      setState(
        partial: Partial<ULDERendererState>
      ): void {

        currentRendererState = {
          ...rendererState,
          ...partial
        };

        if (currentRendererState.executionContext !== undefined) {
          // if (partial.executionContext !== undefined) {
          renderFromContext(currentRendererState.executionContext?.render);

          // internal docrouting
          // config.container.addEventListener('ulde:navigate', (e: any) => {
          //   const pageId = e.detail.pageId;

          //   const executionContext = state.executionContext;
          //   if (!executionContext) return;
          //   executionContext.page.pageId = pageId;

          //   this.setState({ ...state, executionContext });

          //   console.log(`Log: [UldeRendererService] bindNavigate pageId=`, pageId, state);

          // });

        }

        // if (partial.currentLifecyclePhase !== undefined) {
        //   renderLifecyclePhase(state.currentLifecyclePhase);
        // }

        // if (partial.diagnostics !== undefined) {
        //   renderDiagnosticsOverlay(state.diagnostics);
        // }

        // if (partial.frame !== undefined) {
        //   renderFrameInfo(state.frame);
        // }

        events?.onStateChange?.(currentRendererState);
      },

      getState() {
        return currentRendererState;
      },


      highlightDiagnostic(message: string) {
        highlightDiagnostic(message);
      },

      dispose() {
        config.container.innerHTML = '';
        // delete config.container.dataset['uldeLifecyclePhase'];
        // delete config.container.dataset['uldeDiagnosticsCount'];
        // delete config.container.dataset['uldeFrameId'];
        // delete config.container.dataset['uldeFrameTimestamp'];
      }
    };
  }


  // VS Code auto-expand logic
  updateTocCollapseState(
    tree: ULDETocNode[],
    activeSlug: string | null
  ): void {

    const visit = (node: ULDETocNode): boolean => {

      const isSelfActive = node.entry.id === activeSlug;

      const children = node.children as ULDETocNode[] ?? [];
      const hasActiveDesc = children.some(child => visit(child)) ?? false;

      node.collapsed = !(isSelfActive || hasActiveDesc);

      return isSelfActive || hasActiveDesc;
    };

    tree.forEach(root => visit(root));
  }

}
