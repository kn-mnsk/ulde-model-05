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
import { ULDERendererService } from '@ulde/viewer/services/ulde-renderer.service';

@Injectable({
  providedIn: 'root',
})
export class UldeNavigationRuntimeService {

  constructor(
    private rendererService: ULDERendererService
  ) { }

  bind(
    host: HTMLElement,
    ctx: ULDEExecutionContext
  ): void {

    this.bindTocLinks(host);

    this.bindInternalNavigate(host, ctx);

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
   * intra-page routing
   * @param host
   */
  private bindInternalNavigate(
    host: HTMLElement,
    executionContext: ULDEExecutionContext
  ) {

    host.addEventListener(
      'ulde:navigate',
      (e: any) => {

        const pageId = e.detail.pageId;

        executionContext.page.pageId = pageId;

        const state = this.rendererService.getState();

        this.rendererService.setState({
          ...state, executionContext
        });

        console.log(`Log: [UldeNavigationRuntimeService] bindInternalNavigate pageId=`, pageId, state);

      });

  }

}
