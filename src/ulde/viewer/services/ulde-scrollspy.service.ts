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

import {
  Injectable,
  computed,
  signal,
  ElementRef,

} from '@angular/core';

import {
  ULDEExecutionContext,
  ULDENavigationArtifact,
  ULDETocNode,
  ULDETocEntry,
} from '@ulde/types';

import { UldeSessionstateManageService } from '@ulde/configurator';

import { isBrowser } from '../../../app/global.utils/global.utils';


@Injectable({
  providedIn: 'root',
})
export class UldeScrollspyService {

  private sectionObserver?: IntersectionObserver;

  private anchorObserver?: IntersectionObserver;

  private activeSectionId?: string;

  private activeAnchorId?: string;

  //TOC
  $toc = signal<ULDETocEntry[]>([]);

  $viewerTocRef =
    signal<ElementRef<HTMLElement> | undefined>(undefined);
  readonly $isParentActive = computed(() => {
    const toc = this.$toc();
    const active = this.$activeHeading();
    return (item: ULDETocEntry) => this.isParentOfActive(item, toc, active);
  });

  $activeHeading = signal<string | null>(null);

  readonly isParentActive = (node: ULDETocNode) =>
    this.isAncestor(node, this.$activeHeading());


  constructor(
    private sessionStateService: UldeSessionstateManageService,
  ) { }

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

    // console.log(
    //   `Log: [UldeScrollspyService] observeSections \nsections=\n`,
    //   sections
    // );

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

    // console.log(
    //   `Log: [UldeScrollspyService] observeAnchors \nanchors=\n`,
    //   anchors
    // );

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

    this.sessionStateService.persistPagePosition(
      // this.persistSessionState(
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

    this.sessionStateService.persistPagePosition(
      // this.persistSessionState(
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


  activateClickedTocItem(
    tree: ULDETocNode[],
    slug: string): void {

    for (const node of tree) {
      if (node.entry?.id === slug) {

        this.$activeHeading.set(slug);
        return;
      }
      this.activateClickedTocItem(node.children as ULDETocNode[], slug);
    }
  }


  // Build TOC tree
  buildTocTree(
    entries: ULDETocEntry[])
    : ULDETocNode[] {
    const root: ULDETocNode[] = [];
    const stack: ULDETocNode[] = [];

    for (const entry of entries) {

      const node: ULDETocNode = {
        type: 'toc',
        entry,
        children: [],
        collapsed: false
      };


      while (
        stack?.length && stack[stack.length - 1].entry.depth
        >= entry.depth
      ) {
        stack.pop();
      }

      if (!stack.length) {
        root.push(node);
      } else {
        stack[stack.length - 1].children?.push(node);
      }

      stack.push(node);
    }

    return root;
  }



  isParentOfActive(
    item: ULDETocEntry,
    toc: ULDETocEntry[],
    activeSlug: string | null
  ): boolean {

    const activeIndex =
      toc.findIndex(t => t.id === activeSlug);

    if (activeIndex === -1) return false;

    const active = toc[activeIndex];
    return item.depth < active.depth && toc.indexOf(item) < activeIndex;
  }

  isAncestor(
    node: ULDETocNode,
    activeSlug: string | null
  ): boolean {

    node.children ??= [];

    for (const child of node.children as ULDETocNode[]) {

      if (child.entry?.id === activeSlug) return true;

      if (this.isAncestor(child, activeSlug)) return true;
    }

    return false;
  }


  // Scroll to heading
  scrollTo(host: HTMLElement, slug: string) {

    const el = host.querySelector(`a[data-anchor-id="${slug}"]`);

    // console.log(`Log: [UldeScrllSpy]`,
    //   `\n\tscrollTo()`,
    //   `\n\tdata-anchor-id=`, slug,
    //   `\n\t elected element=`, el
    // );

    if (!el) return;


    queueMicrotask(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      this.highlightElement(el as HTMLElement);
    });

  }


  private highlightElement(el: HTMLElement) {
    const parent = el.parentElement ?? el;
    parent.classList.add('inline-highlight');
    setTimeout(() => {
      parent.classList.remove('inline-highlight');
      // console.log(`Log: [DocsViewer] highlightElement()`);
    },
      700
    );

  }


  // private persistSessionState(
  //   pageId: string,
  //   partial: Partial<ULDEPagePosition>
  // ): void {

  //   const sessionState =
  //     readSessionState(
  //       isBrowser()
  //     );

  //   sessionState.pagePositions ??= {};

  //   const current =
  //     sessionState.pagePositions[pageId] ?? {
  //       scrollTop: 0
  //     };

  //   sessionState.pagePositions[pageId] = {
  //     ...current,
  //     ...partial
  //   };

  //   writeSessionState(
  //     sessionState,
  //     isBrowser(),
  //     '[UldeScrollService] persistSessionState()'
  //   );

  // }



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
