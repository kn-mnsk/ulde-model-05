// src/ulde/viewer/ulde-viewer.ts

import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, effect, input, output, signal } from '@angular/core';
import { ULDEDevtoolsService } from '@ulde/devtools';
import type { ULDERendererState } from '@ulde/types/renderer';
import { UldeNavigationRuntimeService, ULDERendererService, UldeScrollRestorationService, UldeScrollspyService } from '@ulde/viewer/services';
import { isBrowser } from '../../app/global.utils/global.utils';
import { ULDEExecutionContext } from '@ulde/types';

@Component({
  selector: 'ulde-viewer',
  standalone: true,
  templateUrl: 'ulde-viewer.html',
  styleUrl: 'ulde-viewer.scss',
})
export class UldeViewer implements AfterViewInit, OnDestroy {

  @ViewChild('markdownHost', { static: true })
  hostRef!: ElementRef<HTMLElement>;

  @ViewChild('markdwonHostContainer', { static: true })
  hostContainerRef!: ElementRef<HTMLElement>;

  // Full renderer state comes in as a signal input
  $rendererState = input<ULDERendererState>();

  $currentRendererState = signal(this.$rendererState());

  $ready = output<void>();
  $error = output<Error>();
  $stateChange = output<ULDERendererState>();

  constructor(
    public rendererService: ULDERendererService,
    private devtoolsService: ULDEDevtoolsService,
    private navigationRuntimeService: UldeNavigationRuntimeService,
    private scrollSpy: UldeScrollspyService,
    private scrollRestore: UldeScrollRestorationService
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

      if (!this.hostRef || !this.hostContainerRef) return;

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

      console.log(`Log: [UldeViewer] effect(): 🔥4 \nexecutionContext=\n`, state.executionContext);
    });

  }

  ngAfterViewInit(): void {

    if (!isBrowser()) return;

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


  }

  ngOnDestroy(): void {

    this.scrollRestore.stopScrollTracking(
      this.hostContainerRef.nativeElement
    );

    this.rendererService.dispose();

    this.scrollSpy.disconnect();

    console.log(`Log: []UldeViewer ngOnDestroy Completed`);
  }

  private syncSignalInput(state: ULDERendererState): void {

    if (!state.executionContext) return;

    state.devtoolsSnapshot =
      this.devtoolsService.$generateDevtoolsSnapshot(
        state.executionContext)();

    console.log(`Log: [UldeViewer] syncSignalInput()`, state);

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

    console.log(
      '[UldeViewer] attaching tracking for page',
      pageId
    );

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


    console.log(
      '[UldeViewer] host dimensions',
      {
        clientHeight: host.clientHeight,
        scrollHeight: host.scrollHeight
      }
    );

    this.scrollRestore.
      startScrollTracking(
        host,
        pageId
      );

    console.log(
      '[UldeViewer] scroll host',
      host
    );

    // console.log(`Log: [UldeViewer] scrollTracking() end`);

  }

}
