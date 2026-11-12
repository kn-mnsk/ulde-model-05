// src/ulde/viewer/ulde-viewer.ts

import { OnInit, AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, effect, input, output, signal, computed } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { ULDEDevtoolsService } from '@ulde/devtools';
import type { ULDERendererState } from '@ulde/types/renderer';
import { UldeNavigationRuntimeService, ULDERendererService, UldeScrollRestorationService, UldeScrollspyService } from '@ulde/viewer/services';
import { isBrowser } from '../../app/global.utils/global.utils';
import { ULDEExecutionContext } from '@ulde/types';
import { UldeViewerTocResizerDirective } from '@ulde/viewer/ulde-viewer-toc-resizer.directive';
import { UldeOverlayService } from '@ulde/viewer/services/ulde-overlay.service';
// import { readSessionState, writeSessionState } from '@ulde/configurator';

import { ULDETocEntry, ULDETocNode } from '@ulde/types';
import { UldeSessionstateManageService } from '@ulde/configurator';

@Component({
  selector: 'ulde-viewer',
  standalone: true,
  imports: [
    UldeViewerTocResizerDirective,
    // NgTemplateOutlet,
  ],
  templateUrl: 'ulde-viewer.html',
  styleUrl: 'ulde-viewer.scss',
})
export class UldeViewer implements OnInit, AfterViewInit, OnDestroy {

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
    private sessionStateService: UldeSessionstateManageService,
  ) {

    // 🔥1  React to ULDE lifecycle phases
    effect(() => {
      const phase =
        this.devtoolsService.$currentLifecyclePhaseTiming();

      if (!phase) return;

      const rendererState =
        this.rendererService.getState();

      if (
        !rendererState?.executionContext
      )
        return;

      rendererState.executionContext.lifecyclePhase =
        phase.lifecyclePhase;

      this.syncSignalInput(rendererState);

      console.log(`Log: [UldeViewer] effect(): 🔥1`);

    });

    // 🔥2 React to diagnostics
    effect(() => {

      const diagnostics =
        this.devtoolsService.$diagnostics();

      if (diagnostics.length < 1) return;

      console.log(`Log: [UldeViewer] effect(): 🔥2-1`);

      const rendererState =
        this.rendererService.getState();

      if (
        !rendererState?.executionContext?.artifacts
      )
        return;

      rendererState.executionContext.artifacts.diagnostics =
        diagnostics;

      this.syncSignalInput(rendererState);

      console.log(`Log: [UldeViewer] effect(): 🔥2-2`);

    });

    // 🔥3 React to frame finalization
    effect(() => {

      const currentFrame =
        this.devtoolsService.$currentFrame();

      if (!currentFrame) return;

      const rendererState =
        this.rendererService.getState();

      if (
        !rendererState?.executionContext?.artifacts
      )
        return;


      // console.log(`Log: [UldeViewer] effect(): 🔥3 \ncurrentFrame=\n`, currentFrame);

      rendererState.executionContext.artifacts.frame =
        currentFrame;

      // this.rendererService.setState({
      //   executionContext: rendererState.executionContext
      // });
      this.syncSignalInput(rendererState);

      console.log(
        // `Log: [UldeViewer] effect(): 🔥3 \ncurrentFrame=\n`,
        // currentFrame
        `Log: [UldeViewer] effect(): 🔥3`
      );

    });

    // 🔥4 React to rendererState signal input (without re-init)
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
        !this.viewerTocRef
      )
        return;


      this.$viewerTocRef.set(this.viewerTocRef);

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
        // `Log: [UldeViewer] effect(): 🔥4 \nexecutionContext=\n`,
        // state.executionContext
        `Log: [UldeViewer] effect(): 🔥4 `
      );

    });

  }


  ngOnInit(): void {

    const { prevPageId } =
      this.sessionStateService.getState();

    this.$prevPageId.set(prevPageId);

  }


  ngAfterViewInit(): void {

    if (!isBrowser()) return;

    this.overlayService.show(this.viewerTocRef);
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

  private syncSignalInput(rendererState: ULDERendererState): void {

    if (!rendererState.executionContext) return;

    rendererState.devtoolsSnapshot =
      this.devtoolsService.$generateDevtoolsSnapshot(
        rendererState.executionContext)();

    // console.log(
    //   `Log: [UldeViewer] syncSignalInput()`,
    //   state
    // );

    this.rendererService.setState(rendererState);

    this.$currentRendererState.set(rendererState); // input for UldeDevtools

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
    this.scrollRestore
      .restore(
        host,
        pageId
      );

    this.scrollRestore.
      stopScrollTracking(
        host
      );


    this.scrollRestore.
      startScrollTracking(
        host,
        pageId
      );

  }

  onBackToPrevPage() {
    console.log(`[UldeViewer] onBackToPrevPage 1`);

    const { pageId }
      = this.sessionStateService.getState();


    const newPageId = this.$prevPageId();// prevPageId becomes newPageId
    if (!newPageId) return;
    this.sessionStateService.swapState(newPageId);

    this.$prevPageId.set(pageId);

    const rendererState =
      this.$currentRendererState();

    if (
      !rendererState ||
      !rendererState.executionContext
    ) return;


    rendererState.executionContext.page.pageId
      = newPageId;

    this.syncSignalInput(rendererState);
    console.log(`[UldeViewer] onBackToPrevPage 🔄️`);

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
