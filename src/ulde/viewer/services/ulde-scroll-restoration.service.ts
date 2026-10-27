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
import { writeSessionState, readSessionState } from '@ulde/configurator';
import { isBrowser } from '../../../app/global.utils/global.utils';

@Injectable({
  providedIn: 'root',
})
export class UldeScrollRestorationService {

  private saveTimer?: number;
  private handleScroll!: () => {};

  /**
   * Begin tracking scroll position
   */
  startTracking(
    host: HTMLElement,
    pageId: string
  ) {

    if (!isBrowser()) {
      return;
    }

    this.handleScroll = () => this.onScroll(host, pageId);

    host.addEventListener(
      'scroll',
      this.handleScroll
    );
  }

  /**
   * Save scroll position
   * @param pageId
   * @param scrollTop
   */
  save(
    pageId: string,
    scrollTop: number) {
    writeSessionState({
      pageId,
      scrollTop
    },
      isBrowser()
    );
  }

  /**
     * Restore saved position
     */
  restore(
    host: HTMLElement,
    pageId: string
  ) {

    if (!isBrowser()) {
      return;
    }

    const state =
      readSessionState(
        isBrowser()
      );

    if (
      state.pageId !== pageId
    ) {
      return;
    }

    requestAnimationFrame(() => {

      host.scrollTop =
        state.scrollTop;

    });
  }

  /**
   * Scroll tracking
   */
  private onScroll(
    host: HTMLElement,
    pageId: string
  ) {

    return () => {

      clearTimeout(
        this.saveTimer
      );

      this.saveTimer =
        window.setTimeout(
          () => {

            writeSessionState(
              {
                pageId: pageId,
                scrollTop:
                  host.scrollTop
              },
              isBrowser()
            );

          },
          200
        );

    };
  }

  removeScrollEvent(host: HTMLElement) {
    host.removeEventListener('scroll', this.handleScroll);
  }
}
