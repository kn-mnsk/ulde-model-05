// src/ulde/viewer/ulde-viewer.ts

import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, effect, input, output, signal, computed } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { ULDEDevtoolsService } from '@ulde/devtools';
import type { ULDERendererState } from '@ulde/types/renderer';
import { UldeNavigationRuntimeService, ULDERendererService, UldeScrollRestorationService, UldeScrollspyService } from '@ulde/viewer/services';
import { isBrowser } from '../../app/global.utils/global.utils';
import { ULDEExecutionContext } from '@ulde/types';
import { UldeViewerTocResizerDirective } from '@ulde/viewer/ulde-viewer-toc-resizer.directive';
import { UldeOverlayService } from '@ulde/viewer/services/ulde-overlay.service';
import { readSessionState, writeSessionState } from '@ulde/configurator';

import { ULDETocEntry, ULDETocNode } from '@ulde/types';

@Component({
  selector: 'ulde-viewer',
  standalone: true,
  imports: [
    UldeViewerTocResizerDirective,
    NgTemplateOutlet,
  ],
  templateUrl: 'ulde-viewer.html',
  styleUrl: 'ulde-viewer.scss',
})
export class UldeViewer implements AfterViewInit, OnDestroy {

  @ViewChild('markdownHost', { static: true })
  hostRef!: ElementRef<HTMLElement>;

  @ViewChild('markdownHostContainer', { static: true })
  hostContainerRef!: ElementRef<HTMLElement>;

  @ViewChild('uldeViewerTocOverlay', { static: false })
  viewerTocOverlayRef?: ElementRef<HTMLElement>;

  @ViewChild('uldeViewerTOC', { static: false })
  viewerTocRef!: ElementRef<HTMLElement>;

  @ViewChild('markdownHostOverlay', { static: false })
  markdownHostOverlayRef?: ElementRef<HTMLElement>;

  $viewerTocRef = signal<ElementRef<HTMLElement> | undefined>(undefined);

  // Full renderer state comes in as a signal input
  $rendererState = input<ULDERendererState>();

  $currentRendererState = signal(this.$rendererState());

  $pageId = computed(() =>
    this.$currentRendererState()?.executionContext?.page.pageId
  );

  $prevPageId = signal<string | null>(null);


  // ULDE outputs
  $toc = signal<ULDETocEntry[]>([]);
  // readonly $tocTree = computed(() => this.buildTocTree(this.$toc()));

  $ready = output<void>();
  $error = output<Error>();
  $stateChange = output<ULDERendererState>();

  constructor(
    public rendererService: ULDERendererService,
    private devtoolsService: ULDEDevtoolsService,
    private navigationRuntimeService: UldeNavigationRuntimeService,
    private scrollSpy: UldeScrollspyService,
    private scrollRestore: UldeScrollRestorationService,
    private overlayService: UldeOverlayService,
  ) {

    // 🔥1  React to ULDE lifecycle phases
    effect(() => {
      const phase =
        this.devtoolsService.$currentLifecyclePhaseTiming();

      if (!phase) return;

      const state =
        this.rendererService.getState();

      if (!state?.executionContext) return;

      console.log(`Log: [UldeViewer] effect(): 🔥1`);

      state.executionContext.lifecyclePhase =
        phase.lifecyclePhase;

      this.rendererService.setState({
        executionContext: state.executionContext
      });

    });

    // 🔥2 React to diagnostics
    effect(() => {

      const diagnostics =
        this.devtoolsService.$diagnostics();

      if (diagnostics.length < 1) return;

      console.log(`Log: [UldeViewer] effect(): 🔥2`);

      const state =
        this.rendererService.getState();

      if (!state?.executionContext?.artifacts) return;

      state.executionContext.artifacts.diagnostics =
        diagnostics;

      this.rendererService.setState({
        executionContext: state.executionContext
      });

    });

    // 🔥3 React to frame finalization
    effect(() => {

      const currentFrame =
        this.devtoolsService.$currentFrame();

      if (!currentFrame) return;

      const state =
        this.rendererService.getState();

      if (!state?.executionContext?.artifacts) return;


      console.log(`Log: [UldeViewer] effect(): 🔥3 \ncurrentFrame=\n`, currentFrame);

      state.executionContext.artifacts.frame =
        currentFrame;

      this.rendererService.setState({
        executionContext: state.executionContext
      });

    });

    // 🔥4 React to rendererState signal input (without re-init)
    effect(() => {

      const state =
        this.$rendererState();

      if (!state || !state.executionContext) return;

      if (!this.hostRef || !this.hostContainerRef || !this.viewerTocRef) return;


      this.$viewerTocRef.set(this.viewerTocRef);

      this.syncSignalInput(state);

      this.navigationRuntimeService.bind(
        this.hostRef.nativeElement,
        state.executionContext
      );

      this.scrollSpy.disconnect();

      this.scrollSpy.observe(
        this.hostRef.nativeElement,
        state.executionContext
      );

      this.scrollTracking(
        state.executionContext,
        this.hostContainerRef.nativeElement
      );



      console.log(
        `Log: [UldeViewer] effect(): 🔥4 \nexecutionContext=\n`,
        state.executionContext
      );

    });

  }

  ngAfterViewInit(): void {

    if (!isBrowser()) return;

    this.overlayService.show(this.viewerTocRef);
    this.overlayService.show(this.markdownHostOverlayRef);

    const { prevPageId } = readSessionState(isBrowser());
    this.$prevPageId.set(prevPageId);

    this.rendererService.init(
      this.hostRef,
      {
        width: this.hostRef.nativeElement.clientWidth,
        height: this.hostRef.nativeElement.clientHeight,
      },
      {
        onReady: () => this.$ready.emit(),
        onError: (e) => this.$error.emit(e),
        onStateChange: (s) => this.$stateChange.emit(s),
      },
    );

    this.overlayService.hide(this.viewerTocRef);
    this.overlayService.hide(this.markdownHostOverlayRef);

  }

  ngOnDestroy(): void {

    this.scrollRestore.stopScrollTracking(
      this.hostContainerRef.nativeElement
    );

    this.rendererService.dispose();

    this.scrollSpy.disconnect();

    // console.log(`Log: []UldeViewer ngOnDestroy Completed`);
  }

  private syncSignalInput(state: ULDERendererState): void {

    if (!state.executionContext) return;

    state.devtoolsSnapshot =
      this.devtoolsService.$generateDevtoolsSnapshot(
        state.executionContext)();

    // console.log(
    //   `Log: [UldeViewer] syncSignalInput()`,
    //   state
    // );

    this.rendererService.setState(state);

    this.$currentRendererState.set(state); // input for UldeDevtools

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

    // console.log(
    //   '[UldeViewer] attaching tracking for page',
    //   pageId
    // );

    // restore page position
    this.scrollRestore
      .restore(
        host,
        pageId
      );

    this.scrollRestore.
      stopScrollTracking(
        host
      );


    // console.log(
    //   '[UldeViewer] host dimensions',
    //   {
    //     clientHeight: host.clientHeight,
    //     scrollHeight: host.scrollHeight
    //   }
    // );

    this.scrollRestore.
      startScrollTracking(
        host,
        pageId
      );

    // console.log(
    //   '[UldeViewer] scroll host',
    //   host
    // );

    // console.log(`Log: [UldeViewer] scrollTracking() end`);

  }

  onBackToPrevPage() {
    console.log(`[UldeViewer] onBackToPrevPage 1`);

    const { pageId, prevPageId, scrollTop, prevScrollTop } = readSessionState(isBrowser());
    writeSessionState({
      pageId: this.$prevPageId(),
      prevPageId: this.$pageId(),
      scrollTop: prevScrollTop,
      prevScrollTop: scrollTop
    },
      isBrowser()
    );

    // const currentRendererState = this.$currentRendererState();
    // if (!currentRendererState || !currentRendererState.executionContext) return;
    // currentRendererState.executionContext.page.pageId = prevPageId ?? '';

    const rendererState =
      this.rendererService.getState();
    if (
      !prevPageId ||
      !rendererState ||
      !rendererState.executionContext
    ) return;

    console.log(`[UldeViewer] onBackToPrevPage 2`);

    rendererState.executionContext.page.pageId
      = this.$prevPageId() ?? 'docs/index';

    this.syncSignalInput(rendererState);
    // this.rendererService.setState({
    //   executionContext: rendererState.executionContext
    // });

  }



  // // Build TOC tree
  // private buildTocTree(entries: ULDETocEntry[]): ULDETocNode[] {
  //   const root: ULDETocNode[] = [];
  //   const stack: ULDETocNode[] = [];

  //   for (const entry of entries) {
  //     const node: ULDETocNode = {
  //       entry,
  //       children: [],
  //       collapsed: false
  //     };

  //     while (stack.length && stack[stack.length - 1].entry.level >= entry.level) {
  //       stack.pop();
  //     }

  //     if (!stack.length) root.push(node);
  //     else stack[stack.length - 1].children.push(node);

  //     stack.push(node);
  //   }

  //   return root;
  // }


}
