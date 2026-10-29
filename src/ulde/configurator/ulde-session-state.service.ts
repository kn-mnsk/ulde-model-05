// src/ulde/configurator/ulde-session-state.service.ts

import { signal } from '@angular/core';
// import { isBrowser } from '../../app/global.utils/global.utils';

// Session State
export type ULDESessionSelector =
  | 'app-root'
  | 'ulde-viewer';

export interface ULDESessionState {
  selector: ULDESessionSelector;

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
  pagePositions?: Record<
    string,
    ULDEPagePosition
  >;

  // for future
  lastVisited?: string // last visited pageId

}


export interface ULDEPagePosition {
  scrollTop: number;
  archiveAnchorId?: string;
  archiveSectionId?: string;
}

const ULDE_SESSION_STATE_KEY = 'sessionState';

const ULDE_SESSION_STATE_DEFAULT: ULDESessionState = {
  selector: 'ulde-viewer',
  pageId: 'docs/index',
  prevPageId: 'docs/index',
  scrollTop: 0,
  prevScrollTop: 0,
  refreshed: false,
  docTheme: 'dark',
  pagePositions: {
    'docs/index': {
      scrollTop: 0
    }
  }
};


const $title = signal<string>('[session-state.manage]');
// -------------------------
// Session state helpers
// -------------------------

export function readSessionState(isBrowser: boolean): ULDESessionState {

  if (!isBrowser) {
    return ULDE_SESSION_STATE_DEFAULT;
  }

  const raw = localStorage.getItem(ULDE_SESSION_STATE_KEY);
  if (!raw) {
    return ULDE_SESSION_STATE_DEFAULT;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ULDESessionState>;
    return {
      selector: parsed.selector ?? 'ulde-viewer',
      pageId: parsed.pageId ?? null,
      prevPageId: parsed.prevPageId ?? null,
      scrollTop: parsed.scrollTop ?? 0,
      prevScrollTop: parsed.prevScrollTop ?? 0,
      refreshed: parsed.refreshed ?? false,
      docTheme: parsed.docTheme ?? 'dark',
      pagePositions: parsed.pagePositions ?? undefined
    };
  } catch {
    return ULDE_SESSION_STATE_DEFAULT;
  }
}

export function writeSessionState(partial: Partial<ULDESessionState>, isBrowser: boolean): void {
  if (!isBrowser) return;

  const current = readSessionState(isBrowser);
  const next: ULDESessionState = {
    ...current,
    ...partial,
  };
  localStorage.setItem(ULDE_SESSION_STATE_KEY, JSON.stringify(next));

  // console.log(`Log: ${$title()} writeSessionState called, \ncurrent=${JSON.stringify(current, null, 2)}, \nnext=${JSON.stringify(next, null, 2)}`)

}

export function getPagePosition(
  pageId: string,
  isBrowser: boolean
): number {

  const state =
    readSessionState(isBrowser);

  return (
    state.pagePositions?.[pageId]?.scrollTop
    ?? 0
  );
}

export function setPagePosition(
  pageId: string,
  scrollTop: number,
  isBrowser: boolean
): void {

  const state =
    readSessionState(isBrowser);

  state.pagePositions ??= {};

  state.prevPageId =
    state.pageId;

  state.prevScrollTop =
    state.scrollTop;

  state.pageId =
    pageId;

  state.scrollTop =
    scrollTop;

  state.pagePositions[pageId] = {
    ...state.pagePositions[pageId],
    scrollTop
  };

  writeSessionState(
    state,
    isBrowser
  );
}


export function clearSessionState(isBrowser: boolean): void {
  if (!isBrowser) return;
  localStorage.removeItem(ULDE_SESSION_STATE_KEY);
  console.log(`Log: ${$title()} clearSessionState()`);
}
