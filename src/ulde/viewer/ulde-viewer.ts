// src/ulde/viewer/ulde-viewer.ts

import { OnInit, AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, effect, input, output, signal, computed } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { ULDEDevtools, ULDEDevtoolsService } from '@ulde/devtools';
import type { ULDERendererState } from '@ulde/types/renderer';
import { UldeNavigationRuntimeService, ULDERendererService, UldePageRestorationService, UldeScrollspyService } from '@ulde/viewer/services';
import { ULDEDevtoolsSnapshot, ULDETocEntry } from '@ulde/types';
import { isBrowser } from '../../app/global.utils/global.utils';
import { ULDEExecutionContext, ULDETocNode } from '@ulde/types';
import { UldeViewerTocResizerDirective } from '@ulde/viewer/ulde-viewer-toc-resizer.directive';
import { UldeOverlayService } from '@ulde/viewer/services/ulde-overlay.service';


@Component({
  selector: 'ulde-viewer',
  standalone: true,
  imports: [
    UldeViewerTocResizerDirective,
    ULDEDevtools,
    NgTemplateOutlet,
  ],
  templateUrl: 'ulde-viewer.html',
  styleUrl: 'ulde-viewer.scss',
})
export class UldeViewer implements
  OnInit,
  AfterViewInit,
  OnDestroy {


  @ViewChild('uldeViewerContainer', { static: false })
  viewerContainerRef!: ElementRef<HTMLElement>;

  @ViewChild('markdownHostContainer', { static: false })
  hostContainerRef!: ElementRef<HTMLElement>;

  @ViewChild('markdownHost', { static: false })
  hostRef!: ElementRef<HTMLElement>;

  @ViewChild('uldeViewerTocOverlay', { static: false })
  viewerTocOverlayRef?: ElementRef<HTMLElement>;

  @ViewChild('uldeViewerTocResize', { static: false })
  TocResizeRef!: ElementRef<HTMLElement>;

  @ViewChild('markdownHostOverlay', { static: false })
  markdownHostOverlayRef?: ElementRef<HTMLElement>;

  // Full renderer state comes in as a signal input
  $rendererState = input<ULDERendererState>();

  $ready = output<void>();
  $error = output<Error>();
  $rendererStateChange = output<ULDERendererState>();

  $currentRendererState = computed(() =>
    this.$rendererState()
  );

  $pageId = computed(() =>
    this.$currentRendererState()?.executionContext?.page.pageId
  );

  $prevPageId = signal<string | null>(null);


  //TOC

  $tocResizeRef =
    signal<ElementRef<HTMLElement> | undefined>(undefined);

  $toc = signal<ULDETocNode[]>([]);
  // $toc = signal<ULDETocEntry[]>([]);

  readonly $tocTree = computed<ULDETocNode[]>(() =>
    this.$toc()
  );
  // readonly $tocTree = computed<ULDETocEntry[]>(() =>
  //   this.$toc()
  // );

  $activeHeading = computed<string | null>(() =>
    this.scrollSpy.$activeHeading()
  );

  // devtools
  $visibilityDevtools = signal<'visible' | 'hidden'>('hidden');

  $devtoolsSnapshot =
    computed<ULDEDevtoolsSnapshot | undefined>(() => this.$currentRendererState()?.devtoolsSnapshot);

  // event handler
  private handleKeydown!: (e: KeyboardEvent) => void;

  constructor(
    public rendererService: ULDERendererService,
    private devtoolsService: ULDEDevtoolsService,
    private navigationRuntimeService: UldeNavigationRuntimeService,
    private scrollSpy: UldeScrollspyService,
    private pageRestore: UldePageRestorationService,
    private overlayService: UldeOverlayService,
  ) {

    this.handleKeydown = this.onKeyDown;

    // 🔥1 React to change of $rendererState()
    effect(() => {

      const rendererState =
        this.$rendererState();

      if (
        !rendererState ||
        !rendererState.executionContext
      )
        return;

      if (
        !this.hostRef ||
        !this.hostContainerRef ||
        !this.TocResizeRef
      )
        return;


      this.$tocResizeRef.set(this.TocResizeRef);

      this.syncSignalInput(rendererState);

      this.navigationRuntimeService.bind(
        this.hostRef.nativeElement,
        rendererState.executionContext
      );

      this.scrollSpy.disconnect();

      this.scrollSpy.observe(
        this.hostRef.nativeElement,
        rendererState.executionContext
      );

      this.scrollTracking(
        rendererState.executionContext,
        this.hostContainerRef.nativeElement
      );


      console.log(
        `Log: [UldeViewer] effect()`,
        `\n\t🔥1 Finished`
      );

    });

  }


  ngOnInit(): void { }


  ngAfterViewInit(): void {

    if (!isBrowser()) return;

    this.overlayService.show(this.TocResizeRef);
    this.overlayService.show(this.markdownHostOverlayRef);

    this.rendererService.init(
      this.hostRef,
      {
        width: this.hostRef.nativeElement.clientWidth,
        height: this.hostRef.nativeElement.clientHeight,
      },
      {
        onReady: () => this.$ready.emit(),
        onError: (e) => this.$error.emit(e),
        onStateChange: (s) => this.$rendererStateChange.emit(s),
      },
    );

    // const toc =
    //   this.$currentRendererState()?.executionContext?.artifacts?.toc;

    // if (toc){
    //   this.$toc.set(toc);}

    this.$prevPageId.set(
      this.pageRestore.getPrevPageId()
    );


    // this.viewerContainerRef.nativeElement.addEventListener( //Note: does not work!
    document.addEventListener(
      'keydown',
      this.handleKeydown
    );

    this.overlayService.hide(this.TocResizeRef);
    this.overlayService.hide(this.markdownHostOverlayRef);

  }

  ngOnDestroy(): void {

    this.pageRestore.stopScrollTracking(
      this.hostContainerRef.nativeElement
    );

    this.rendererService.dispose();

    this.scrollSpy.disconnect();


    this.handleKeydown = (e: Event): void => { };
    this.onKeyDown.bind(null);

    // console.log(`Log: []UldeViewer ngOnDestroy Completed`);
  }

  private syncSignalInput(
    rendererState: ULDERendererState
  ): void {

    if (!rendererState.executionContext) return;

    rendererState.devtoolsSnapshot =
      this.devtoolsService.$generateDevtoolsSnapshot(
        rendererState.executionContext)();

    this.rendererService.setState(rendererState);

    const toc = rendererState.executionContext.artifacts.toc;

    // console.log(`[UldeViewer]`,
    //   `\n\tsyncSingnalInput`,
    //   `\n\tTOC=`, toc,
    // );
    this.$toc.set(toc);

    // if (toc) {
    //   this.$toc.set(toc);
    // }

    // this.$currentRendererState.set(rendererState); // input for UldeDevtools


    // console.log(
    //   `Log: [UldeViewer] syncSignalInput()`,
    //   state
    // );

  }

  // Move to devtools???
  onHighLight(message: string) {

    this.rendererService.highlightDiagnostic(message)
  }

  /**
   * set scroll tracking
   * @param ctx
   * @param host
   */
  private scrollTracking(
    ctx: ULDEExecutionContext,
    host: HTMLElement
  ) {

    // console.log(`Log: [UldeViewer] scrollTracking() beging`);

    const pageId =
      ctx.page.pageId;

    // restore page position
    this.pageRestore.
      restorePagelPosition(
        host,
        pageId
      );

    this.pageRestore.
      stopScrollTracking(
        host
      );


    this.pageRestore.
      startScrollTracking(
        host,
        pageId
      );

  }

  onBackToPrevPage() {
    console.log(`[UldeViewer] onBackToPrevPage 1`);

    const newPageId = this.$prevPageId();// prevPageId becomes newPageId
    if (!newPageId) return;
    // this.sessionStateService.swapState(newPageId);

    // this.$prevPageId.set(pageId);

    const currentRendererState =
      this.$currentRendererState();

    if (
      !currentRendererState ||
      !currentRendererState.executionContext
    ) return;


    currentRendererState.executionContext.page.pageId
      = newPageId;

    this.syncSignalInput(currentRendererState);

    console.log(
      `[UldeViewer] onBackToPrevPage 🔄️`,
      `\ncurrent Page=`, newPageId,
      `\nprev Page=`, this.$prevPageId()
    );

  }

  private onKeyDown = (e: KeyboardEvent) => {

    console.log(
      `[UldeConfigurator] onKeyDown`
    );

    if (
      e.ctrlKey &&
      e.key === 'k'
    ) {

      e.preventDefault();

      // console.log(`Log: [${this.component}] onkeyDown`, e);

      this.$visibilityDevtools.update(b =>
        b ==
          'hidden' ?
          'visible' :
          'hidden'
      );

    };

  };

  isParentActive(node: ULDETocNode)
    : boolean {

    return this.scrollSpy.isAncestor(node, this.$activeHeading());

  }

  // Scroll to heading
  scrollTo(host: HTMLElement, slug: string) {

    this.scrollSpy.scrollTo(host, slug);

  }

}
