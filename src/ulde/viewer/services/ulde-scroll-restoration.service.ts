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
import { writeSessionState, getPagePosition, setPagePosition } from '@ulde/configurator';
import { isBrowser } from '../../../app/global.utils/global.utils';

@Injectable({
  providedIn: 'root',
})
export class UldeScrollRestorationService {

  private saveTimer?: number;

  private handleScroll!: () => void;

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
      () =>
        this.onScroll(
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
   * @deprecated
   */
  save(
    pageId: string,
    scrollTop: number)
    : void {

    writeSessionState({
      pageId,
      scrollTop
    },
      isBrowser()
    );
  }

  /**
   * Restore saved position
   * @param host
   * @param pageId
   * @returns
   */
  restore(
    host: HTMLElement,
    pageId: string
  ): void {

    if (!isBrowser()) {
      return;
    }

    const scrollTop =
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
   * @param host
   * @param pageId
   */
  private onScroll(
    host: HTMLElement,
    pageId: string,
  ): void {


    // console.log(
    //   '[ScrollRestore] onScroll',
    //   {
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

          setPagePosition(
            pageId,
            host.scrollTop,
            isBrowser()
          );
        },
        // 200
        100
      );

  }

}
