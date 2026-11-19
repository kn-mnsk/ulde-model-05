// src/ulde/configurator/configurator.ts

/**
 * Ownership
 *
 * Document
    1. Load page
    2. initiallize ULDESessionState parameters
    3. Generaie ULDERenderState object, and
        input it to UldeViewer component
 * display Graph (Babylonjs, image, or matlib, etc) by links inside any page (Next Project)
 */



import { AfterViewInit, Component, computed, effect, ElementRef, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { ULDELifecycleService } from '@ulde/core';
import { ULDEExecutionContext, ULDEPageContext } from '@ulde/types/context';

import { ContentEngineService } from '@ulde/engine';
import { ULDERendererState } from '@ulde/types/renderer/ulde-renderer.types';
import { UldePageRestorationService, UldeViewer } from '@ulde/viewer';
import { isBrowser } from '../../app/global.utils/global.utils';
import { UldeThemeService } from '@ulde/configurator';
import { ULDEDevtoolsSnapshot } from '@ulde/types';

@Component({
  selector: 'ulde-configurator',
  standalone: true,
  imports: [
    UldeViewer,
    // ULDEDevtools
  ],
  templateUrl: 'ulde-configurator.html',
  styleUrl: 'ulde-configurator.scss',
})
export class UldeConfigurator implements
  AfterViewInit,
  OnInit,
  OnDestroy {

  component = 'UldeConfigurator';

  // for future use
  $contentId =
    signal<{ pageId: string, graphId: string }>({
      pageId: 'docs/index',
      graphId: ''
    }); // initial value

  private $pageId = signal<string | null>(null);

  $reload = signal<number>(0);
  $page = computed(() => {
    return { id: this.$pageId(), reload: this.$reload() };
  })


  $rendererState =
    signal<ULDERendererState>(
      {
        modelId: 'ulde-demo-05',
        variantId: 'default',
        zoom: 1,
        rotation: { x: 0, y: 0, z: 0 },

        executionContext: undefined,
        devtoolsSnapshot: undefined
      }
    );

  // $devtoolsSnapshot =
  //   computed<ULDEDevtoolsSnapshot | undefined>(() => this.$rendererState()?.devtoolsSnapshot);

  private debugCounter: number = 0;

  $theme = signal<string>('dark');
  $visibility = signal<'visible' | 'hidden'>('hidden');

  // private handleKeydown!: (e: KeyboardEvent) => void;

  @ViewChild('configuratorContainer', { static: true })
  configuratorRef!: ElementRef<HTMLElement>;

  constructor(
    private router: Router,
    private contenEngine: ContentEngineService,
    private lifecycleService: ULDELifecycleService,
    private pageRestore: UldePageRestorationService,
    private themeService: UldeThemeService,
  ) {

    // this.onKeyDown = this.onKeyDown.bind(this);
    // this.handleKeydown = this.onKeyDown;

    const currentPageId =
      this.pageRestore.getCurrentPageId();

    if (!currentPageId) return;

    console.log(
      `[UldeConfigurator]`,
      `\n\tconstructor()`,
      `\n\trecovered pageId =`, currentPageId
    );

    this.$pageId.set(currentPageId);


    effect(() => {

      /** debug */
      this.debugCounter++;

      console.log(
        `[UldeConfigurator] effect debug count\n\t`,
        this.debugCounter
      );

      if (this.debugCounter > 20) {
        debugger;
        throw new Error('Loop detected');
      }
      /** debug */

      if (!isBrowser()) return;

      const pageId = this.$page().id;
      if (!pageId) return;

      this.UldeLoadAndRender(pageId);

      console.log(
        `[UldeConfigurator]`,
        `\n\teffect()`,
        `\n\t🔥1 Finished`
      );

      // console.trace(`[UldeConfigurator] effect trace`);

    });

  }

  async ngOnInit() {

    // this.$reload.update(n => n + 1); // load current pageId
    // this.handleKeydown = this.onKeyDown;
  }

  ngAfterViewInit() {

    console.log(
      `[UldeConfigurator]`,
      `\n\tngAfterViewInit() Begin`
    );

    if (
      !isBrowser() ||
      !this.configuratorRef
    )
      return;


    // this.configuratorRef.nativeElement.addEventListener( //Note: does not work!
    // document.addEventListener(
    //   'keydown',
    //   this.handleKeydown
    // );

    console.log(
      `[UldeConfigurator]`,
      `\n\tngAfterViewInit() End`
    );
  }

  ngOnDestroy() {

    // this.handleKeydown = (e: Event): void => { };
    // this.onKeyDown.bind(null);

  }

  private async buildPageContext(
    pageId: string
  ): Promise<ULDEPageContext | void> {

    // load markdown file
    const markdown =
      // await this.contenEngine.load(pageId);
      await this.contenEngine.loadPage(pageId);

    if (!markdown) return;

    return {
      pageId: pageId,
      source: {
        raw: markdown,
        tokens: [],
      },
      meta: {},
    };
  }

  private async uldeRun(
    pageId: string
  ): Promise<ULDEExecutionContext | undefined> {

    const pageContext =
      await this.buildPageContext(pageId);

    if (!pageContext) return undefined;

    const executionContext =
      await this.lifecycleService.executeLifecycle(pageContext);

    return executionContext;
  }

  private async UldeLoadAndRender(
    pageId: string
  ): Promise<void> {

    const executionContext =
      await this.uldeRun(pageId);

    if (!executionContext) {
      console.error(
        `Error: [${this.component}]`,
        `\n\tUldeLoadAndRender()`,
        `\n\tRenderer context is not available.`
      );

      await this.router.navigate(['/PageError']);

      throw new Error(
        `Invalid PageId: ${pageId}`
      );

    };

    // $rendererState update
    const newState = this.$rendererState();

    newState.executionContext =
      executionContext;

    newState.devtoolsSnapshot ??=
      {} as ULDEDevtoolsSnapshot;

    newState.devtoolsSnapshot.executionContext =
      executionContext;

    this.$rendererState.
      update(state =>
      ({
        ...state,
        ...newState
      })
      );

    // console.log(
    //   `Log: [${this.component}] ngAfterViewInit \n rendererState:`,
    //   this.$rendererStateMarkdownViewer()
    // );

  }

  //React
  async onRendererStateChange(
    state: ULDERendererState
  ): Promise<void> {

    const pageId =
      state.executionContext?.page.pageId;

    if (!pageId) return;

    if (pageId === this.$pageId()) {

      return;
    }

    // wap curentt page to prev page, and new page to current page...
    this.pageRestore.swapPage(pageId)

    /**
     * invoke effect =>
     * 1. load new page, and
     * 2. finally $rendererrState is updated
     */
    this.$pageId.set(
      pageId
    );


    // console.log(
    //   `Log: [${this.component}] onViewerStateChanged state=`,
    //   state
    // );

  }

  onErrorMarkdownViewer(
    error: Error
  ): void {

    console.error(
      `Log: [${this.component}] onError error=`,
      JSON.stringify(error, null, 2)
    );

  }

  /**
   * Theme Switcher
   * @param theme
   */
  setTheme(
    theme: 'light' | 'dark'
  ): void {

    this.themeService.setTheme(theme);
    this.$theme.set(theme);

  }

  // private onKeyDown = (e: KeyboardEvent) => {

  //   console.log(
  //     `[UldeConfigurator] onKeyDown`
  //   );

  //   if (
  //     e.ctrlKey &&
  //     e.key === 'k'
  //   ) {

  //     e.preventDefault();

  //     // console.log(`Log: [${this.component}] onkeyDown`, e);

  //     this.$visibility.update(b =>
  //       b ==
  //         'hidden' ?
  //         'visible' :
  //         'hidden'
  //     );

  //   };

  // };


}
