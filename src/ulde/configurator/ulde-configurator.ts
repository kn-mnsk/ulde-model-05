// src/ulde/configurator/configurator.ts

import { AfterViewInit, Component, computed, effect, ElementRef, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';

import { ULDELifecycleService } from '@ulde/core';
import { ULDEPageContext } from '@ulde/types/context';

import { ULDEDevtools } from '@ulde/devtools';
import { ContentEngineService } from '@ulde/engine';
import { ULDERendererState } from '@ulde/types/renderer/ulde-renderer.types';
import { UldePageRestorationService, UldeViewer } from '@ulde/viewer';
import { isBrowser } from '../../app/global.utils/global.utils';
import { ULDE_SESSION_STATE_DEFAULT, ULDE_DEFAULT_PAGE_ID, UldeSessionstateManageService, UldeThemeService } from '@ulde/configurator';
import { ULDEDevtoolsSnapshot } from '@ulde/types';

@Component({
  selector: 'ulde-configurator',
  standalone: true,
  imports: [
    UldeViewer,
    ULDEDevtools
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

  // private pageId: string | null = null;
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

  $devtoolsSnapshot =
    computed<ULDEDevtoolsSnapshot | undefined>(() => this.$rendererState()?.devtoolsSnapshot);

  $theme = signal<string>('dark');
  $visibility = signal<'visible' | 'hidden'>('hidden');

  private handleKeydown!: (e: KeyboardEvent) => void;

  @ViewChild('configuratorContainer', { static: true })
  configuratorRef!: ElementRef<HTMLElement>;

  constructor(
    private contenEngine: ContentEngineService,
    private lifecycleService: ULDELifecycleService,
    private pageRestore: UldePageRestorationService,
    private themeService: UldeThemeService,
  ) {

    // this.onKeyDown = this.onKeyDown.bind(this);
    this.handleKeydown = this.onKeyDown;

    const recoveredPageId =
      this.pageRestore.getCurrentPageId();

    if (!recoveredPageId) return;

    console.log(
      `[UldeConfigurator] constructor()`,
      `\n\trecovered pageId =`, recoveredPageId
    );

    this.$pageId.set(recoveredPageId);


    effect(() => {
      if (!isBrowser()) return;

      const pageId = this.$page().id;
      if (!pageId) return;

      this.UldeLoadAndRender(pageId);

      console.log(
        `[UldeConfigurator] effect()`,
        `\n\t🔥1 Finished`
      );

    });

  }

  async ngOnInit() {

    // this.$reload.update(n => n + 1); // load current pageId
    // this.handleKeydown = this.onKeyDown;
  }

  ngAfterViewInit() {

    console.log(
      `[UldeConfigurator] ngAfterViewInit() \n\tBegin`
    );

    if (
      !isBrowser() ||
      !this.configuratorRef
    )
      return;


    // this.configuratorRef.nativeElement.addEventListener(
    document.addEventListener(
      'keydown',
      this.handleKeydown
    );

    console.log(
      `[UldeConfigurator] ngAfterViewInit() \n\tEnd`
    );
  }

  ngOnDestroy() {

    // if (this.configuratorRef) {

    // this.configuratorRef.nativeElement.removeEventListener(
    // document.removeEventListener(
    //   'keydown',
    //   this.handleKeydown
    // );

    // }

    this.handleKeydown = (e: Event): void => { };
    this.onKeyDown.bind(null);

  }

  private async buildPageContext(pageId: string): Promise<ULDEPageContext | void> {

    // load markdown file
    const markdown =
      // await this.contenEngine.load(pageId);
      await this.contenEngine.loadNew(pageId);

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

  private async uldeRun(pageId: string) {

    const pageContext =
      await this.buildPageContext(pageId);

    if (!pageContext) return undefined;

    const executionContext =
      await this.lifecycleService.executeLifecycle(pageContext);

    return executionContext;
  }

  private async UldeLoadAndRender(pageId: string) {

    const executionContext =
      await this.uldeRun(pageId);

    if (!executionContext) {
      console.error(
        `Error: [${this.component}] UldeLoadAndRender() Render context is not available.`
      );

      return;
    }

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

    // this.$rendererStateDevtoolsViewer.set(state);

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



  onErrorMarkdownViewer(error: Error) {

    console.error(
      `Log: [${this.component}] onError error=`,
      JSON.stringify(error, null, 2)
    );

  }

  // private async updateSessionState(
  //   newPageId: string
  // ): Promise<void> {

  //   const currentPage =
  //     readSessionState(isBrowser());

  //   currentPage.pagePositions ??= {};

  //   // currentPage.pagePositions[newPageId]
  //   //   = {
  //   //   ...currentPage.pagePositions[newPageId],
  //   //   ...{ scrollTop: 0 }
  //   // }
  //   currentPage.pagePositions[newPageId] ??= {
  //     scrollTop: 0
  //   };


  //   const newPage =
  //   {
  //     pageId: newPageId,
  //     prevPageId: currentPage.pageId ?? '',
  //     scrollTop: currentPage.pagePositions[newPageId].scrollTop,
  //     prevScrollTop: currentPage.scrollTop ?? 0,
  //     pagePositions: currentPage.pagePositions
  //   };

  //   writeSessionState(
  //     {
  //       ...currentPage,
  //       ...newPage
  //     },
  //     isBrowser(),
  //     '[UldeConfigurator] updateSessionState()'
  //   )

  // }

  /**
   * Theme Switcher
   * @param theme
   */
  setTheme(theme: 'light' | 'dark') {

    this.themeService.setTheme(theme);
    this.$theme.set(theme);

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

      this.$visibility.update(b =>
        b ==
          'hidden' ?
          'visible' :
          'hidden'
      );

    };

  };


}
