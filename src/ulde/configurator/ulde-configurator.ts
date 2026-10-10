// src/ulde/configurator/configurator.ts

import { AfterViewInit, Component, computed, OnInit, signal } from '@angular/core';

import { ULDELifecycleService } from '@ulde/core';
import { ULDEPageContext } from '@ulde/types/context';

import { ULDEDevtools } from '@ulde/devtools';
import { ContentEngineService } from '@ulde/engine';
import { ULDERendererState } from '@ulde/types/renderer/ulde-renderer.types';
import { UldeViewer } from '@ulde/viewer';
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
export class UldeConfigurator implements AfterViewInit, OnInit {

  component = 'UldeConfigurator';

  // renderContext: ULDERenderContext | undefined = undefined;

  pageId: string = 'docs/index'; // initila value
  // $pageId = signal<string>('docs/index'); // initila value

  $reload = signal<number>(0);
  $page = computed(() => {
    return { id: this.pageId, reload: this.$reload() };
  })


  $rendererStateOfMarkdownViewer = signal<ULDERendererState>({
    modelId: 'ulde-demo-01',
    variantId: 'default',
    zoom: 1,
    rotation: { x: 0, y: 0, z: 0 },

    executionContext: undefined,
    devtoolsSnapshot: undefined
  });

  $rendererStateOfDevtoolsViewer = signal<ULDERendererState>(this.$rendererStateOfMarkdownViewer());
  // private md = new MarkdownIt();

  $theme = signal<string>('dark');

  private async buildPageContext(): Promise<ULDEPageContext | void> {

    // load markdown file
    const markdown = await this.contenEngine.load(this.$page().id);
    if (!markdown) return;

    const tokens = await this.contenEngine.transform(markdown);
    // const tokens = this.md.parse(markdown, {});

    return {
      pageId: this.$page().id,
      source: {
        raw: markdown,
        tokens: tokens
      },
      meta: {},
    };
  }

  private async runUlde(lifecycle: ULDELifecycleService) {
    const pageContext = await this.buildPageContext();
    if (!pageContext) return undefined;

    const executionContext = await lifecycle.executeLifecycle(pageContext);
    // const renderContext = executionContext?.render;

    return executionContext;
  }

  constructor(
    private contenEngine: ContentEngineService,
    private lifecycle: ULDELifecycleService) { }

  async ngOnInit() {
    this.$reload.update(n => n + 1); // load current pageId
  }

  async ngAfterViewInit() {
    if (!isBrowser()) return;

    const executionContext = await this.runUlde(this.lifecycle);
    if (!executionContext) {
      console.error('Error: [${this.component}] Render context is not available.');
      return;
    }

    this.$rendererStateOfMarkdownViewer.update(state => ({ ...state, executionContext }));

    console.log(`Log: [${this.component}] ngAfterViewInit\n rendererState:`, this.$rendererStateOfMarkdownViewer());

  }

  onMarkdownViewerStateChange(state: ULDERendererState) {

    this.$rendererStateOfDevtoolsViewer.set(state);
    console.log(`Log: [${this.component}] onViewerStateChanged state=`, state);
    // sync UI or analytics
  }

  onErrorOfMarkdownViewer(error: Error) {
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


}
