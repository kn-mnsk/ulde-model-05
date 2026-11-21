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

  lastScrollTop = -1;
  constructor(
    private sessionStateService: UldeSessionstateManageService,
  ) { }

  observe(
    host: HTMLElement, //scroll container: hostContainerRef.nativeElement of UldeVierwer,
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
      );

    // console.log(
    //   `Log: [UldeScrollspyService]`,
    //   `\n\tobserveSections`,
    //   `\n\t sections=`, sections
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
          // rootMargin:
          //   '-20% 0px -60% 0px',
          // threshold: 0
          rootMargin:
            '0px 0px 0px 0px',
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
          // rootMargin:
          //   '-20% 0px -60% 0px',
          // threshold: 0
          rootMargin:
            '0px 0px 0px 0px',
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

    this.sessionStateService.persistPageHistory(
      // this.persistSessionState(
      ctx.page.pageId,
      {
        archiveSectionId: sectionId
      }
    )

    // console.log(
    //   `Log: [UldeScrollspyService]`,
    //   `\n\tonSctionIntersection`,
    //   `\n\t pageId=`, ctx.page.pageId,
    //   `\n\t active SectionId=`, active.target,
    //   `\n\t archiveSectionId=`, sectionId,
    //   `\n\tentries=`, entries
    // );


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

    this.sessionStateService.persistPageHistory(
      // this.persistSessionState(
      ctx.page.pageId,
      {
        archiveAnchorId: anchorId
      }
    );


    // console.log(
    //   `Log: [UldeScrollspyService]`,
    //   `\n\tonAnchorIntersection`,
    //   `\n\t pageId=`, ctx.page.pageId,
    //   `\n\t active anchorId=`, active.target,
    //   `\n\t archiveAnchorId=`, anchorId,
    //   `\n\tentries=`, entries
    // );

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

  hightLightIntersectingTocItem(
    host: HTMLElement,
    pageId: string,
    tree: ULDETocNode[]
  ): void {

    const { archiveAnchorId, archiveSectionId } =
      this.sessionStateService.getPageHistory(pageId) ?? {};

    if (!archiveAnchorId || !archiveSectionId) return;

    this.$activeHeading.set(archiveAnchorId);
    // this.$activeHeading.set(archiveSectionId);

    // console.log(
    //   `Log: [UldeScrollspyService] hightLightIntersectingTocItem()`,
    //   `\n\archiveAnchorId=`, archiveAnchorId,
    //   `\n\archiveSectionId=`, archiveSectionId
    // );


    // this.$activeHeading.set(archiveAnchorId);
    // this.$activeHeading.set(archiveSectionId);

    // queueMicrotask(() => {

    //   // actvate and hightlight
    //   this.detectScrollEnd(host, () => {
    //     this.activateClickedTocItem(tree, archiveAnchorId);
    //   });

    // });

  };

  private activateClickedTocItem(
    tree: ULDETocNode[],
    slug: string): void {

    for (const node of tree) {
      if (node.entry?.id === slug) {

        this.$activeHeading.set(slug);
        return;
      }
      this.activateClickedTocItem(
        node.children as ULDETocNode[],
        slug
      );

    }
  }

  /**
   *
   * @param wrapper
   * @param callback
   */
  private detectScrollEnd(
    wrapper: HTMLElement,
    callback: () => void
  ): void {

    this.lastScrollTop = -1;
    let counter = 1;

    const check = () => {
      const now = wrapper.scrollTop;

      if (now === this.lastScrollTop) {

        const lastScrollTop =
          Number(this.lastScrollTop.toFixed(2));

        // console.log(
        //   `Log: [UldeScrollspyService] detectScrollEnd()`,
        //   `\n\tfinal end=`, lastScrollTop,
        //   `\n\tounter=`, counter
        // );

        callback();

        return;
      }

      this.lastScrollTop = now;
      counter++;
      requestAnimationFrame(check);
    };

    requestAnimationFrame(check);
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

  private isAncestor(
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
  /**
   * activate TOC heading, and scroll to heading in the main document
   * @param host
   * @param slug
   * @param tree
   * @returns
   */
  scrollTo(
    host: HTMLElement,
    slug: string,
    tree: ULDETocNode[]
  ): void {

    const el =
      host.querySelector(`a[data-anchor-id="${slug}"]`);

    // console.log(`Log: [UldeScrllSpy]`,
    //   `\n\tscrollTo()`,
    //   `\n\tdata-anchor-id=`, slug,
    //   `\n\t elected element=`, el
    // );

    if (!el) return;


    queueMicrotask(() => {

      // actvate and hightlight
      this.detectScrollEnd(host, () => {
        this.activateClickedTocItem(tree, slug);
      });

      // scroll to headng, and highlight
      // el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.scrollIntoView({ behavior: 'auto', block: 'start' });
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

  // Build TOC tree
  /**
   *
   * @param entries
   * @returns
   * @depricated
   * @description moved to ULDETOCPlugin as buildTocNodeTree
   */
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

}
