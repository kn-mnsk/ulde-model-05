// src/ulde/configurator/configurator.ts

import { AfterViewInit, Component, computed, effect, ElementRef, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';

import { ULDELifecycleService } from '@ulde/core';
import { ULDEPageContext } from '@ulde/types/context';

import { ULDEDevtools } from '@ulde/devtools';
import { ContentEngineService } from '@ulde/engine';
import { ULDERendererState } from '@ulde/types/renderer/ulde-renderer.types';
import { UldeScrollRestorationService, UldeViewer } from '@ulde/viewer';
import { isBrowser } from '../../app/global.utils/global.utils';
import { readSessionState, ULDE_SESSION_STATE_DEFAULT, ULDEPagePosition, ULDESessionState, writeSessionState } from '@ulde/configurator/ulde-session-state.service';

@Component({
  selector: 'ulde-configurator',
  standalone: true,
  imports: [
    UldeViewer, ULDEDevtools
  ],
  templateUrl: 'ulde-configurator.html',
  styleUrl: 'ulde-configurator.scss',
})
export class UldeConfigurator implements AfterViewInit, OnInit, OnDestroy {

  component = 'UldeConfigurator';



  // renderContext: ULDERenderContext | undefined = undefined;

  // for future use
  $contentId = signal<{ pageId: string, graphId: string }>({
    pageId: 'docs/index',
    graphId: ''
  }); // initial value

  $pageId = signal<string | null>(null); // initila value

  $reload = signal<number>(0);
  $page = computed(() => {
    return { id: this.$pageId(), reload: this.$reload() };
  })


  $rendererStateMarkdownViewer = signal<ULDERendererState>({
    modelId: 'ulde-demo-01',
    variantId: 'default',
    zoom: 1,
    rotation: { x: 0, y: 0, z: 0 },

    executionContext: undefined,
    devtoolsSnapshot: undefined
  });

  $rendererStateDevtoolsViewer = signal<ULDERendererState>(this.$rendererStateMarkdownViewer());
  // private md = new MarkdownIt();

  $theme = signal<string>('dark');
  $visibility = signal<'visible' | 'hidden'>('hidden');

  private restoredPosition: number = 0;

  private handleKeydown!: () => void;

  @ViewChild('configurator', { static: true })
  configuratorRef!: ElementRef<HTMLElement>;

  constructor(
    private contenEngine: ContentEngineService,
    private lifecycleService: ULDELifecycleService,
    private scrollRestore: UldeScrollRestorationService
  ) {

    this.handleKeydown = () => this.onKeyDown

    effect(() => {

      if (!isBrowser()) return;

      // const lastPageId = scrollRestore.restore

      const pageId = this.$page().id;

      if (pageId === null) {

        writeSessionState(ULDE_SESSION_STATE_DEFAULT, isBrowser())

        const { pageId, scrollTop } =
          readSessionState(isBrowser());

        this.$pageId.set(pageId);

        window.scrollTo(
          0, scrollTop
        );

        return;

      };

      this.UldeLoadAndRender(pageId);

    });

  }


  async ngOnInit() {
    this.$reload.update(n => n + 1); // load current pageId
  }

  async ngAfterViewInit() {

    if (!isBrowser()) return;

    const { pageId, prevPageId, scrollTop, prevScrollTop } =
      readSessionState(isBrowser());

    if (this.$pageId() === null) {

      this.$pageId.set(pageId)

      window.scrollTo(
        0, scrollTop
      );

    } else {

      this.$pageId.set(prevPageId)

      window.scrollTo(
        0, prevScrollTop
      );

    }

    this.configuratorRef.nativeElement
      .addEventListener(
        'keydown',
        this.handleKeydown
      );

  }

  async ngOnDestroy() {

    this.configuratorRef.nativeElement
      .removeEventListener(
        'keydown',
        this.handleKeydown
      );

    this.handleKeydown = (): void => { };


  }

  private async buildPageContext(pageId: string): Promise<ULDEPageContext | void> {

    // load markdown file
    const markdown = await this.contenEngine.load(pageId);
    if (!markdown) return;

    // this.restoredPosition = this.restorationService.restore(pageId);

    // const tokens = await this.contenEngine.transform(markdown);
    // const tokens = this.md.parse(markdown, {});

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
      console.error(`Error: [${this.component}] UldeLoadAndRender() Render context is not available.`);
      return;
    }

    this.$rendererStateMarkdownViewer.update(
      state => ({
        ...state, executionContext
      })
    );

    console.log(`Log: [${this.component}] ngAfterViewInit\n rendererState:`, this.$rendererStateMarkdownViewer());

  }

  //React
  async onMarkdownViewerStateChange(
    state: ULDERendererState
  ) {

    this.$rendererStateDevtoolsViewer.set(state);

    if (state.executionContext) {

      const newPageId =
        state.executionContext.page.pageId;

      await this.updateSessionState(newPageId);

      this.$pageId.set(
        newPageId
      );
    }
    console.log(`Log: [${this.component}] onViewerStateChanged state=`, state);

  }

  onErrorMarkdownViewer(error: Error) {

    console.error(`Log: [${this.component}] onError error=`, JSON.stringify(error, null, 2));

  }

  private async updateSessionState(
    newPageId: string
  ): Promise<void> {

    const currentPage =
      readSessionState(isBrowser());

    currentPage.pagePositions ??= {};

    currentPage.pagePositions[newPageId]
      = {
      ...currentPage.pagePositions[newPageId],
      ...{ scrollTop: 0 }
    }

    const newPage =
    {
      pageId: newPageId,
      prevPageId: currentPage.pageId ?? '',
      scrollTop: currentPage.pagePositions[newPageId].scrollTop,
      prevScrollTop: currentPage.scrollTop ?? 0,
      pagePositions: currentPage.pagePositions
    };

    writeSessionState(
      {
        ...currentPage, ...newPage
      },
      isBrowser()
    )

  }

  /**
   * Theme Switcher
   * @param theme
   */
  setTheme(theme: 'light' | 'dark') {

    this.$theme.set(theme);

  }

  private onKeyDown = (e: KeyboardEvent) => {

    if (e.ctrlKey && e.key === 'k') {

      e.preventDefault();

      // console.log(`Log: [${this.component}] onkeyDown`, e);

      this.$visibility.update(b =>
        b == 'hidden' ? 'visible' : 'hidden'
      );

    }

  };

}
