// src/ulde/viewer/services/ulde-scrollspy.service
/**
 * Ownership
 *
  1. Observe visible sections
  2. Determine active section
  3. Determine active anchor
  4. Update navigation artifact
  5. Update session state archive

  note: later implementation:
  1. activeAnchor
  2. URL synchronization
  3. ulde:scrollspy event
  4. history integration
  5. TOC manipulation
 */

import { Injectable } from '@angular/core';
import { ULDEExecutionContext, ULDENavigationArtifact } from '@ulde/types';
import { readSessionState, ULDEPagePosition, writeSessionState } from '@ulde/configurator';
import { isBrowser } from '../../../app/global.utils/global.utils';


@Injectable({
  providedIn: 'root',
})
export class UldeScrollspyService {

  private sectionObserver?: IntersectionObserver;

  private anchorObserver?: IntersectionObserver;

  private activeSectionId?: string;

  private activeAnchorId?: string;

  observe(
    host: HTMLElement,
    ctx: ULDEExecutionContext
  ): void {

    this.observeSections(host, ctx);

    this.observeAnchors(host, ctx);

  }

  private observeSections(
    host: HTMLElement,
    // pageId: string,
    ctx: ULDEExecutionContext
  ): void {

    const sections =
      host.querySelectorAll(
        '[data-section-id]'
        // 'section'
        // 'data-section-id'
      );

    console.log(`Log: [UldeScrollspyService] observeSections \nsections=\n`, sections);

    this.sectionObserver =
      new IntersectionObserver(
        entries =>
          this.onSectionIntersection(
            entries,
            ctx
          ),
        {
          root: host,
          rootMargin:
            '-20% 0px -60% 0px',
          threshold: 0
        }
      );

    sections.forEach(
      section => this.sectionObserver?.observe(section)
    );

  };

  private observeAnchors(
    host: HTMLElement,
    ctx: ULDEExecutionContext
  ): void {

    const anchors =
      host.querySelectorAll(
        '[data-anchor-id]'
      );

    console.log(`Log: [UldeScrollspyService] observeAnchors \nanchors=\n`, anchors);

    this.anchorObserver =
      new IntersectionObserver(
        entries =>
          this.onAnchorIntersection(
            entries,
            ctx
          ),
        {
          root: host,
          rootMargin:
            '-20% 0px -60% 0px',
          threshold: 0
        }
      );

    anchors.forEach(
      anchor => this.anchorObserver?.observe(anchor)
    );

  };


  disconnect(): void {

    this.sectionObserver?.disconnect();

    this.sectionObserver = undefined;

    this.activeSectionId = undefined;


    this.anchorObserver?.disconnect();

    this.anchorObserver = undefined;

    this.activeAnchorId = undefined;

  };

  private onSectionIntersection(
    entries: IntersectionObserverEntry[],
    // pageId: string,
    ctx: ULDEExecutionContext
  ): void {

    const active =
      entries.find(
        e => e.isIntersecting
      );

    if (!active) {
      return;
    }

    const sectionId =
      active.target.getAttribute(
        'data-section-id'
      );

    if (!sectionId) {
      return;
    }

    if (this.activeSectionId === sectionId) {
      return;
    }

    this.activeSectionId = sectionId;

    this.updateNavigationArtifact(
      ctx,
      {
        activeSectionId: sectionId
      }
    );

    this.persistSessionState(
      ctx.page.pageId,
      {
        archiveSectionId: sectionId
      }
    )

  }

  private onAnchorIntersection(
    entries: IntersectionObserverEntry[],
    ctx: ULDEExecutionContext
  ): void {

    const active =
      entries.find(
        entry => entry.isIntersecting
      );

    if (!active) {
      return;
    }

    const anchorId =
      active.target.id;

    if (!anchorId) {
      return;
    }

    if (this.activeAnchorId === anchorId) {
      return;
    }

    this.activeAnchorId =
      anchorId;

    this.updateNavigationArtifact(
      ctx,
      {
        activeAnchorId: anchorId
      }
    );

    this.persistSessionState(
      ctx.page.pageId,
      {
        archiveAnchorId: anchorId
      }
    );

  }


  private updateNavigationArtifact(
    ctx: ULDEExecutionContext,
    partial: Partial<ULDENavigationArtifact>
  ): void {
    if (!ctx.artifacts.navigation) return;

    ctx.artifacts.navigation = {

      ...ctx.artifacts.navigation,

      ...partial
    };

  }


  private persistSessionState(
    pageId: string,
    partial: Partial<ULDEPagePosition>
  ): void {

    const sessionState =
      readSessionState(
        isBrowser()
      );

    sessionState.pagePositions ??= {};

    const current =
      sessionState.pagePositions[pageId] ?? {
        scrollTop: 0
      };

    sessionState.pagePositions[pageId] = {
      ...current,
      ...partial
    };

    writeSessionState(
      sessionState,
      isBrowser()
    );

  }



  // /**
  //  *
  //  * @param ctx
  //  * @param sectionId
  //  * @returns
  //  *
  //  * note: later for activeNachor implementation
  //  */
  // private updateActiveSection(
  //   ctx: ULDEExecutionContext,
  //   sectionId: string
  // ) {

  //   if (!ctx.artifacts.navigation) return;

  //   ctx.artifacts.navigation = {

  //     ...ctx.artifacts.navigation,

  //     activeSectionId: sectionId
  //   };

  //   this.persistSection(ctx.page.pageId, sectionId);

  // }


  // private persistSection(
  //   pageId: string,
  //   sectionId: string
  // ) {

  //   const state =
  //     readSessionState(
  //       isBrowser()
  //     );

  //   state.pagePositions ??= {};

  //   state.pagePositions[pageId] ??= {
  //     scrollTop: 0
  //   };

  //   state.pagePositions[
  //     pageId
  //   ].archiveSectionId = sectionId;

  //   writeSessionState(
  //     state,
  //     isBrowser()
  //   );
  // }

  // private updateActiveAnchor(
  //   ctx: ULDEExecutionContext,
  //   anchorId: string
  // ): void {


  //   if (!ctx.artifacts.navigation) return;

  //   ctx.artifacts.navigation = {

  //     ...ctx.artifacts.navigation,

  //     activeAnchorId:
  //       anchorId
  //   };

  //   this.persistAnchor(
  //     ctx.page.pageId,
  //     anchorId
  //   );

  // }

  // private persistAnchor(
  //   pageId: string,
  //   anchorId: string
  // ): void {

  //   const state =
  //     readSessionState(
  //       isBrowser()
  //     );

  //   state.pagePositions ??= {};

  //   state.pagePositions[pageId] ??= {
  //     scrollTop: 0
  //   };

  //   state.pagePositions[
  //     pageId
  //   ].archiveAnchorId =
  //     anchorId;

  //   writeSessionState(
  //     state,
  //     isBrowser()
  //   );
  // }


}
