// src/ulde/viewer/services/ulde-scroll-restoration.service
/**
 * Ownership
 *
1. Save scroll position
2. Restore scroll position
3. Refresh recovery
4. Back/forward recovery
 */

import { Injectable, signal } from '@angular/core';
import { UldeSessionstateManageService } from '@ulde/configurator';
import { isBrowser } from '../../../app/global.utils/global.utils';
import { UldeScrollspyService } from '@ulde/viewer/services/ulde-scrollspy.service';
import { ULDETocNode } from '@ulde/types';

@Injectable({
  providedIn: 'root',
})
export class UldePageRestorationService {

  private saveTimer?: number;

  private handleScroll!: (e: Event) => void;

  // reactive signal for current scroll percentage
  readonly $scrollPercent = signal(0);
  get scrollPercent(): number {
    return this.$scrollPercent();
  }


  constructor(
    private sessionStateService: UldeSessionstateManageService,
    private scrollSpy: UldeScrollspyService,
  ) { }

  /**
   * Begin tracking scroll position
   * @param host
   * @param pageId
   * @returns
   */
  startScrollTracking(
    host: HTMLElement,
    pageId: string,
    tree: ULDETocNode[]
  ): void {

    if (!isBrowser()) {
      return;
    }


    this.handleScroll =
      (e) =>
        this.onScroll(
          e,
          // host,
          pageId,
          tree
        );

    host.addEventListener(
      'scroll',
      this.handleScroll
    );

    // console.log(
    //   '[ScrollRestore] addEventLister'
    // );

  }

  stopScrollTracking(
    host: HTMLElement
  ): void {

    if (!isBrowser()) {
      return;
    }

    host.removeEventListener(
      'scroll',
      this.handleScroll
    );

    // console.log(
    //   '[ScrollRestore] removeEventLister'
    // );


    this.handleScroll =
      () =>
        void {};


    if (this.saveTimer) {
      clearTimeout(
        this.saveTimer
      );
    }

  }

  /**
   * Save scroll position
   * @param pageId
   * @param scrollTop
   */
  setPagePosition(
    pageId: string,
    scrollTop: number
  ): void {

    this.sessionStateService.setPagePosition(
      pageId,
      scrollTop,
      isBrowser(),
    );

  }

  /**
   * Restore saved position
   * @param host
   * @param pageId
   * @returns
   */
  restorePagelPosition(
    host: HTMLElement,
    pageId: string
  ): void {

    if (!isBrowser()) {
      return;
    }

    const scrollTop =
      this.sessionStateService.
        getPagePosition(
          pageId,
          isBrowser()
        );

    requestAnimationFrame(() => {

      host.scrollTop =
        scrollTop;

    });
  }

  /**
   * scroll event
   * @param e
  //  * @param host
   * @param pageId
   */
  private onScroll(
    e: Event,
    // host: HTMLElement,
    pageId: string,
    tree: ULDETocNode[]
  ): void {

    // console.log(
    //   '[ScrollRestore] onScroll',
    //   {
    //     target: e.target,
    //     pageId,
    //     // scrollTop: host.scrollTop
    //   }
    // );

    const target = e.target as HTMLElement;
    const scrollTop = target.scrollTop;
    const height = target.scrollHeight - target.clientHeight;
    const percent = height > 0 ? Math.round((scrollTop / height) * 100) : 0;
    this.$scrollPercent.set(percent);

    /this.scrollSpy.hightLightIntersectingTocItem(
    target,
      pageId,
      tree
    );

    clearTimeout(
      this.saveTimer
    );

    this.saveTimer =
      window.setTimeout(
        () => {

          this.setPagePosition(
            pageId,
            // host.scrollTop
            scrollTop
          );

          const history =
            this.sessionStateService.getPageHistory(pageId);

          console.log(
            `[ScrollRestore] onScroll`,
            `${pageId} history=`, history
          );

        },
        // 200
        100
      );

  };

  getCurrentPageId(): string | null {

    const sessionState =
      this.sessionStateService.getState();

    if (!sessionState) {

      this.sessionStateService.initState();

      // return this.sessionStateService.getDefaultPageId();
      return this.sessionStateService.defaultPageId;

    }

    return sessionState.pageId;

  }

  getPrevPageId(): string | null {


    const sessionState =
      this.sessionStateService.getState();

    if (!sessionState) {

      this.sessionStateService.initState();

      // return this.sessionStateService.getDefaultPageId();
      return this.sessionStateService.defaultPageId;

    }

    return sessionState.prevPageId;

  }






  /**
   * swap Page State
   * @param newPageId
   */
  swapPage(newPageId: string): void {

    this.sessionStateService.swapPage(newPageId);

  }

}
