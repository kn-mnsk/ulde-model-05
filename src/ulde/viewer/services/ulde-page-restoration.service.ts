// src/ulde/viewer/services/ulde-scroll-restoration.service
/**
 * Ownership
 *
1. Save scroll position
2. Restore scroll position
3. Refresh recovery
4. Back/forward recovery
 */

import { Injectable } from '@angular/core';
import { UldeSessionstateManageService } from '@ulde/configurator';
import { isBrowser } from '../../../app/global.utils/global.utils';

@Injectable({
  providedIn: 'root',
})
export class UldePageRestorationService {

  private saveTimer?: number;

  private handleScroll!: (e: Event) => void;

  constructor(
    private sessionStateService: UldeSessionstateManageService,
  ) { }

  /**
   * Begin tracking scroll position
   * @param host
   * @param pageId
   * @returns
   */
  startScrollTracking(
    host: HTMLElement,
    pageId: string
  ): void {

    if (!isBrowser()) {
      return;
    }


    this.handleScroll =
      (e) =>
        this.onScroll(
          e,
          host,
          pageId
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
  saveScrollPosition(
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
  restoreScrollPosition(
    host: HTMLElement,
    pageId: string
  ): void {

    if (!isBrowser()) {
      return;
    }

    const scrollTop =
      this.sessionStateService.getPagePosition(
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
   * @param host
   * @param pageId
   */
  private onScroll(
    e: Event,
    host: HTMLElement,
    pageId: string,
  ): void {


    // console.log(
    //   '[ScrollRestore] onScroll',
    //   {
    //     target: e.target,
    //     pageId,
    //     scrollTop: host.scrollTop
    //   }
    // );

    clearTimeout(
      this.saveTimer
    );

    this.saveTimer =
      window.setTimeout(
        () => {

          this.saveScrollPosition(
            pageId,
            host.scrollTop
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

      return this.sessionStateService.getDefaultPageId();

    }

    return sessionState.pageId;

  }

  getPrevPageId(): string | null {


    const sessionState =
      this.sessionStateService.getState();

    if (!sessionState) {

      this.sessionStateService.initState();

      return this.sessionStateService.getDefaultPageId();

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
