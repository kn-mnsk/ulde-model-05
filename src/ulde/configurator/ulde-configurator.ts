// src/ulde/configurator/configurator.ts

import { AfterViewInit, Component, computed, effect, ElementRef, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';

import { ULDELifecycleService } from '@ulde/core';
import { ULDEPageContext } from '@ulde/types/context';

import { ULDEDevtools } from '@ulde/devtools';
import { ContentEngineService } from '@ulde/engine';
import { ULDERendererState } from '@ulde/types/renderer/ulde-renderer.types';
import { UldeScrollRestorationService, UldeViewer } from '@ulde/viewer';
import { isBrowser } from '../../app/global.utils/global.utils';

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

  $pageId = signal<string>('docs/index'); // initila value

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


  @ViewChild('configurator', { static: true })
  configuratorRef!: ElementRef<HTMLElement>;

  constructor(
    private contenEngine: ContentEngineService,
    private lifecycleService: ULDELifecycleService,
    private restorationService: UldeScrollRestorationService
  ) {

    effect(() => {

      if (!isBrowser()) return;

      this.UldeLoadAndRender();

    });

  }


  private handleKey = (e: KeyboardEvent) => void {};

  private async buildPageContext(pageId: string): Promise<ULDEPageContext | void> {

    // load markdown file
    const markdown = await this.contenEngine.load(pageId);
    if (!markdown) return;

    // this.restoredPosition = this.restorationService.restore(pageId);

    // const tokens = await this.contenEngine.transform(markdown);
    // const tokens = this.md.parse(markdown, {});

    return {
      pageId: this.$page().id,
      source: {
        raw: markdown,
        tokens: [],
        // tokens: tokens
      },
      meta: {},
    };
  }

  private async uldeRun() {
    const pageContext = await this.buildPageContext(this.$pageId());
    if (!pageContext) return undefined;

    const executionContext = await this.lifecycleService.executeLifecycle(pageContext);
    // const renderContext = executionContext?.render;

    // console.log(`Log: [UldeConfigurator] uldeLoadAndRender executionContext=\n`, executionContext);


    return executionContext;
  }


  private async UldeLoadAndRender() {

    const executionContext = await this.uldeRun();
    if (!executionContext) {
      console.error(`Error: [${this.component}] UldeLoadAndRender() Render context is not available.`);
      return;
    }


    this.$rendererStateMarkdownViewer.update(state => ({ ...state, executionContext }));

    console.log(`Log: [${this.component}] ngAfterViewInit\n rendererState:`, this.$rendererStateMarkdownViewer());

  }


  async ngOnInit() {
    this.$reload.update(n => n + 1); // load current pageId
  }

  async ngAfterViewInit() {
    if (!isBrowser()) return;

    // await this.UldeLoadAndRender();
    // const executionContext = await this.uldeRun(this.lifecycleService);
    // if (!executionContext) {
    //   console.error('Error: [${this.component}] Render context is not available.');
    //   return;
    // }

    // this.$rendererStateMarkdownViewer.update(state => ({ ...state, executionContext }));

    // console.log(`Log: [${this.component}] ngAfterViewInit\n rendererState:`, this.$rendererStateMarkdownViewer());

    window.scrollTo(
      0, this.restoredPosition
    );

    document.addEventListener('keydown', this.onKeyDown);
    // this.configuratorRef.nativeElement.addEventListener('keydown', this.handleKey.bind(this.onKeyDown));

  }

  async ngOnDestroy() {
    if (isBrowser()) {
      document.removeEventListener('keypress', this.onKeyDown);
    }
    // this.configuratorRef.nativeElement.removeEventListener('keydown', this.onKeyDown);
  }

  //React
  async onMarkdownViewerStateChange(state: ULDERendererState) {


    this.$rendererStateDevtoolsViewer.set(state);

    if (state.executionContext) {
      this.$pageId.set(state.executionContext.page.pageId);
      // this.$reload.update(n => n + 1)

      // await this.UldeLoadAndRender()
    }
    console.log(`Log: [${this.component}] onViewerStateChanged state=`, state);
    // sync UI or analytics
  }

  onErrorMarkdownViewer(error: Error) {
    console.error(`Log: [${this.component}] onError error=`, JSON.stringify(error, null, 2));

  }


  /**
   * Theme Switcher
   * @param theme
   */
  setTheme(theme: 'light' | 'dark') {

    this.$theme.set(theme);

    // coding
    /**
     * use local session
     * Reload from the lifecyclephase 'hydrate', by theme plugin */

    // this.hostRef.nativeElement.setAttribute('data-theme', theme);
  }


  private onKeyDown = (e: KeyboardEvent) => {
    // e.preventDefault();

    if (e.ctrlKey && e.key === 'k') {
      // if (e.ctrlKey && e.shiftKey && e.key === 'd') {
      e.preventDefault();
      console.log(`Log: [${this.component}] onkeyDown`, e);
      this.$visibility.update(b =>
        b == 'hidden' ? 'visible' : 'hidden'
      );
    }

  };


}
