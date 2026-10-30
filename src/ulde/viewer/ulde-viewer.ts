// src/ulde/viewer/ulde-viewer.ts

import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, effect, input, output, signal, computed } from '@angular/core';
import { ULDEDevtools, ULDEDevtoolsService } from '@ulde/devtools';
import { ULDEFrame } from '@ulde/types/frame';
import type { ULDERendererState } from '@ulde/types/renderer';
import { UldeNavigationRuntimeService, ULDERendererService, UldeScrollRestorationService, UldeScrollspyService } from '@ulde/viewer/services';
import { isBrowser } from '../../app/global.utils/global.utils';
import { ULDEExecutionContext } from '@ulde/types';

@Component({
  selector: 'ulde-viewer',
  standalone: true,
  imports: [
    // ULDEDevtools
  ],
  templateUrl: 'ulde-viewer.html',
  styleUrl: 'ulde-viewer.scss',
})
export class UldeViewer implements AfterViewInit, OnDestroy {
  @ViewChild('markdownHost', { static: true })
  hostRef!: ElementRef<HTMLElement>;

  // Full renderer state comes in as a signal input
  $rendererState = input<ULDERendererState>();

  $currentRendererState = signal(this.$rendererState());

  // $reload = signal<number>(0);
  // $currentRendererState = computed(() => {  return { state: this.$rendererState(), reload: this.$reload() } });

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
      const phase = this.devtoolsService.$currentLifecyclePhaseTiming();
      if (!phase) return;
      const state = this.rendererService.getState();
      if (!state?.executionContext) return;

      console.log(`Log: [UldeViewer] effect(): 🔥1`);

      state.executionContext.lifecyclePhase = phase.lifecyclePhase;
      this.rendererService.setState({
        executionContext: state.executionContext
      });



    });

    // 🔥2 React to diagnostics
    effect(() => {
      const diagnostics = this.devtoolsService.$diagnostics();
      if (diagnostics.length < 1) return;
      console.log(`Log: [UldeViewer] effect(): 🔥2`);

      const state = this.rendererService.getState();
      if (!state?.executionContext?.artifacts) return;

      state.executionContext.artifacts.diagnostics = diagnostics;

      this.rendererService.setState({
        executionContext: state.executionContext
      });

    });

    // 🔥3 React to frame finalization
    effect(() => {
      const currentFrame = this.devtoolsService.$currentFrame();
      if (!currentFrame) return;

      const state = this.rendererService.getState();
      if (!state?.executionContext?.artifacts) return;


      console.log(`Log: [UldeViewer] effect(): 🔥3 \ncurrentFrame=\n`, currentFrame);

      state.executionContext.artifacts.frame = currentFrame;

      this.rendererService.setState({
        executionContext: state.executionContext
      });

    });

    // 🔥4 React to rendererState signal input (without re-init)
    effect(() => {

      const state = this.$rendererState();
      // const input = this.$currentRendererState();
      if (!state || !state.executionContext) return;

      this.syncSignalInput(state);
      // this.$reload.update(n => n + 1);

      this.navigationRuntimeService.bind(this.hostRef.nativeElement, state.executionContext);

      this.scrollSpy.disconnect();
      this.scrollSpy.observe(this.hostRef.nativeElement, state.executionContext)

      this.scrollTracking(state.executionContext, this.hostRef.nativeElement);

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

    // Push initial state after init
    // this.syncSignalInput();

  }

  ngOnDestroy(): void {
    this.scrollRestore.removeScrollEvent(this.hostRef.nativeElement);
    this.rendererService.dispose();
    this.scrollSpy.disconnect();

    console.log(`Log: []UldeViewer ngOnDestroy Completed`);
  }

  private syncSignalInput(state: ULDERendererState): void {
    // const input = this.$currentRendererState();
    // if (!input || !input.executionContext) return;

    if (!state.executionContext) return;

    state.devtoolsSnapshot = this.devtoolsService.


      $generateDevtoolsSnapshot(state.executionContext)();

    // const state = {
    //   modelId: input.modelId,
    //   variantId: input.variantId,
    //   zoom: input.zoom,
    //   rotation: input.rotation,
    //   executionContext: input.executionContext,
    //   devtoolsSnapshot: this.devtoolsService.$generateDevtoolsSnapshot(input.executionContext)()
    // };

    console.log(`Log: [UldeViewer] syncSignalInput()`, state);

    this.rendererService.setState(state);



    this.$currentRendererState.set(state); // input for UldeDevtools
  }

  // /**
  //  * Theme Switcher
  //  * @param theme
  //  */
  // setTheme(theme: 'light' | 'dark') {
  //   this.hostRef.nativeElement.setAttribute('data-theme', theme);
  // }

  // Move to devtools???
  onHighLight(message: string) {
    this.rendererService.highlightDiagnostic(message)
  }

  // getFrame(): ULDEFrame | null {

  //   const frame = this.rendererService.getState()?.executionContext?.artifacts.frame;
  //   if (!frame) return null;

  //   return frame

  // }


  private scrollTracking(ctx: ULDEExecutionContext, host: HTMLElement) {
    const pageId =
      ctx.page.pageId;

    // restore page position
    this.scrollRestore
      .restore(
        host,
        pageId
      );

    this.scrollRestore.removeScrollEvent(host);
    this.scrollRestore
      .startTracking(
        host,
        pageId
      );
  }

}
