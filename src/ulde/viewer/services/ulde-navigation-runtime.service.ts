// src/ulde/viewer/services/ulde-navigation-runtime.service
/**
 * Ownership
 *
1. Anchor clicks
2. TOC clicks
3. Jump-to-section
4. Internal document link
 */


import { Injectable } from '@angular/core';
import { ULDEExecutionContext } from '@ulde/types';
import { UldePageRestorationService } from '@ulde/viewer/services/ulde-page-restoration.service';
import { ULDERendererService } from '@ulde/viewer/services/ulde-renderer.service';

@Injectable({
  providedIn: 'root',
})
export class UldeNavigationRuntimeService {

  constructor(
    private rendererService: ULDERendererService,
    private pageRestore: UldePageRestorationService,
  ) { }

  bind(
    host: HTMLElement,
    ctx: ULDEExecutionContext
  ): void {

    this.bindTocLinks(host);

    this.bindInterPageLink(host, ctx);

  }

  private bindTocLinks(
    host: HTMLElement
  ) {

    host.querySelectorAll(
      '.ulde-toc a'
    ).forEach(link => {

      link.addEventListener(
        'click',
        e => {

          e.preventDefault();

          const href =
            link.getAttribute(
              'href'
            );

          if (!href) return;

          host
            .querySelector(href)
            ?.scrollIntoView({
              behavior: 'smooth'
            });

        }
      )

    })
  }

  /**
   * inter-page routing
   * @param host
   */
  private bindInterPageLink(
    host: HTMLElement,
    executionContext: ULDEExecutionContext
  ) {

    host.addEventListener(
      'ulde:interpagelink',
      (e: any) => {

        const pageId = e.detail.pageId;
        const scrollTop = e.detail.scrollTop as number;

        // save pagePosition info in SessionState
        this.pageRestore.saveScrollPosition(
          pageId,
          scrollTop
        );

        // then update RendererState, and eventually open the pageId in the UldeConfigurator compenent
        executionContext.page.pageId =
          pageId;

        const rendererState =
          this.rendererService.getState();

        this.rendererService.setState(
          {
            ...rendererState,
            ...executionContext
          }
        );

        console.log(`Log: [UldeNavigationRuntimeService]`,
          `\n\tbindInternalNavigate()`,
          `\n\tpageId=`, pageId,
          `\n\trenderer state=`, rendererState
        );

      });

  }

}
