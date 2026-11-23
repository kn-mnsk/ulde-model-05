// src/ulde/configurator/services/ulde-sessionstate-manage.service.ts

import { Injectable } from '@angular/core';

import { ThemeName } from '@ulde/viewer/services/ulde-theme.service';
import { isBrowser } from '../../../app/global.utils/global.utils';


// Session State
export type ULDESessionSelector =
  | 'app-root'
  | 'ulde-viewer';

export interface ULDESessionState {
  selector?: ULDESessionSelector;

  pageId: string | null;
  prevPageId: string | null;

  scrollTop: number;
  prevScrollTop: number;

  refreshed: boolean;

  docTheme: string;

  /**
   * key: pageId
   * value: history
   */
  pageHistories?: Record<
    string,
    ULDEPagePosition
  >;

  // for future
  lastVisitedPgeId?: string // last visited pageId

}

export interface ULDEPagePosition {
  scrollTop: number;
  archiveAnchorId?: string;
  archiveSectionId?: string;
}

const ULDE_SESSION_STATE_KEY = 'UldeSessionState';

export const ULDE_DEFAULT_PAGE_ID = 'docs/index';

export const ULDE_SESSION_STATE_DEFAULT: ULDESessionState = {
  selector: 'ulde-viewer',
  pageId: ULDE_DEFAULT_PAGE_ID,
  prevPageId: ULDE_DEFAULT_PAGE_ID,
  scrollTop: 0,
  prevScrollTop: 0,
  refreshed: false,
  docTheme: 'dark',
  pageHistories: {
    'docs/index': {
      scrollTop: 0
    }
  }
};

@Injectable({
  providedIn: 'root',
})
export class UldeSessionstateManageService {

  private readonly title = '[UldeSessionstateManageService]';

  constructor() { }

  // -------------------------
  // Session state helpers
  // -------------------------

  private readSessionState(
    isBrowser: boolean
  ): ULDESessionState {

    if (!isBrowser) {
      return ULDE_SESSION_STATE_DEFAULT;
    }

    const raw =
      localStorage.getItem(ULDE_SESSION_STATE_KEY);
    if (!raw) {
      return ULDE_SESSION_STATE_DEFAULT;
    }

    try {
      const parsed =
        JSON.parse(raw) as Partial<ULDESessionState>;

      return {
        selector: parsed.selector ?? 'ulde-viewer',
        pageId: parsed.pageId ?? null,
        prevPageId: parsed.prevPageId ?? null,
        scrollTop: parsed.scrollTop ?? 0,
        prevScrollTop: parsed.prevScrollTop ?? 0,
        refreshed: parsed.refreshed ?? false,
        docTheme: parsed.docTheme ?? 'dark',
        pageHistories: parsed.pageHistories ?? undefined
      };
    } catch {
      return ULDE_SESSION_STATE_DEFAULT;
    }
  }

  private writeSessionState(
    partial: Partial<ULDESessionState>,
    isBrowser: boolean,
    debug?: string | null
  ): void {

    if (!isBrowser) return;

    const current =
      this.readSessionState(isBrowser);

    const next: ULDESessionState = {
      ...current,
      ...partial,
    };

    localStorage.setItem(
      ULDE_SESSION_STATE_KEY,
      JSON.stringify(next)
    );

    /**Debug purpose */
    const debugMsg =
      debug !== undefined ?
        `\n[Debug: called from ${debug}]` :
        '';

    // console.log(
    //   `Debug: [${this.title}]`,
    //   `\n\twriteSessionState call finished`,
    //   `\n\tDebug message=`, debugMsg,
    // );

  }

  initState(): void {

    this.writeSessionState(
      ULDE_SESSION_STATE_DEFAULT,
      isBrowser(),
      `${this.title} initState()`
    );

  }

  get defaultPageId()
    : string {

    return ULDE_DEFAULT_PAGE_ID;

  }

  getPageId()
    : { pageId: string | null, prevPageId: string | null } {

    const pageIdPair: { pageId: string | null, prevPageId: string | null }
      = this.readSessionState(isBrowser())

    return pageIdPair;

  };


  getState()
    : ULDESessionState {

    return this.readSessionState(isBrowser())

  }

  /**
   * get scrollTop of the pageId
   * @param pageId
   * @param isBrowser
   * @returns
   */
  getPagePosition(
    pageId: string,
    isBrowser: boolean
  ): number {

    const state =
      this.readSessionState(isBrowser);

    return (
      state.pageHistories?.[pageId]?.scrollTop
      ?? 0
    );
  }

  /**
   * pagePositions[pageId].scrollTop = scrollTop
   * @param pageId
   * @param scrollTop
   * @param isBrowser
   */
  setPagePosition(
    pageId: string,
    scrollTop: number,
    isBrowser: boolean
  ): void {

    const state =
      this.readSessionState(isBrowser);


    state.prevPageId =
      state.pageId;

    state.prevScrollTop =
      state.scrollTop;

    state.pageId =
      pageId;

    state.scrollTop =
      scrollTop;


    // if (!state.pageHistories) {
    //   state.pageHistories = {};
    // };

    // in case of undefined state.pageHistories
    state.pageHistories ??= {};

    state.pageHistories[pageId] ?? {
      scrollTop: 0
    };

    state.pageHistories[pageId].scrollTop = scrollTop;
    
    // {
    //   ...currentHistory,
    //   ...{ scrollTop: scrollTop }
    // };


    this.writeSessionState(
      state,
      isBrowser,
      `[${this.title}] setPagePosition()`
    );
  }


  clearSessionState(
    isBrowser: boolean
  ): void {

    if (!isBrowser) return;

    localStorage.removeItem(
      ULDE_SESSION_STATE_KEY
    );

    console.log(`Log: ${this.title} clearSessionState()`);

  }

  /**
   * swap pageId and scrollTo for prevPageId and prevScrollTop respectively, and
   * Set newPageId to pageId, recover scrollTop from pagePosition
   * @param newpageId
   */
  // updateStateByNewPageId(newPageId: string): void {
  swapPage(newPageId: string): void {

    const state = this.readSessionState(isBrowser());

    state.pageHistories ??= {};
    state.pageHistories[newPageId] ??= {
      scrollTop: 0
    };

    // swap and set
    const swapped = {
      pageId: newPageId,
      prevPageId: state.pageId ?? '',
      scrollTop: state.pageHistories[newPageId].scrollTop,
      prevScrollTop: state.scrollTop ?? '',
      pageHistories: state.pageHistories
    };

    console.log(`Log: [${this.title}]`,
      `\n\tswapPage()`,
      '\n\tswapped=', swapped,
    );

    const newState = { ...state, swapped };


    this.writeSessionState(
      newState,
      isBrowser(),

      // `[${this.title}] swapPage() \n\t${JSON.stringify(newState)}'`
    )

  }

  /**
   * Keep pagePoisition in sync
   * @param pageId
   * @param partial
   */
  persistPageHistory(
    pageId: string,
    partial: Partial<ULDEPagePosition>
  ): void {

    const sessionState =
      this.readSessionState(
        isBrowser()
      );

    // partial.scrollTop

    sessionState.pageHistories ??= {};

    const current =
      sessionState.pageHistories[pageId] ?? {
        scrollTop: 0
      };

    sessionState.pageHistories[pageId] = {
      ...current,
      ...partial
    };

    this.writeSessionState(
      sessionState,
      isBrowser(),
      `[${this.title}] persistPageHistory()`
    );

  }

  persistTheme(theme: ThemeName): void {

    this.writeSessionState(
      { docTheme: theme },
      isBrowser(),
      `[${this.title}] persistTheme()`
    );

  }

  getTheme(): ThemeName {

    const { docTheme } =
      this.readSessionState(isBrowser());

    return docTheme as ThemeName;

  }

  /**
   * return a history by pageId
   * @param pageId
   * @returns
   */
  getPageHistory(
    pageId: string
  ): ULDEPagePosition | undefined {

    const { pageHistories } =
      this.readSessionState(isBrowser());

    return pageHistories?.[pageId];

  }


}

