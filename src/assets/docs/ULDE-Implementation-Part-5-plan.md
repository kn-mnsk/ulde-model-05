# ULDE Implementation Part 5

## 1. Plan To Do

ULDE Implementation Part 5
Runtime Experience, Navigation, Layout, and Viewer Intelligence
Context

Parts 1-4 established the framework core:

✅ ULDEExecutionContext
✅ ULDEArtifacts
✅ Lifecycle Pipeline
✅ RenderContextBuilder
✅ Plugin Registry
✅ AST Stabilization
✅ Internal Links
✅ External Links
✅ DevTools Foundation
✅ Runtime Snapshot Model


Part 5 should focus on bringing mature viewer functionality from the older ULDE into the new architecture.

Part 5 Objectives
Goal

Restore and modernize the viewer/runtime
features from the legacy ULDE using
the new architecture.

NOT redesigning the core.

Review Phase A
Project Structure & Ownership
Deliverables

Review:

Current folder structure
Current services
Current engines
Current plugins
Current viewer components
Current devtools

Questions
What moved from old ULDE?

What still exists?

What should become plugins?

What should remain viewer concerns?

What should move into lifecycle?

Output

Updated architecture map:

Folder
 ↓
Responsibility
 ↓
Lifecycle ownership

Review Phase B
Navigation & Recovery
Topics
Page Recovery

Current URL:

#pageId:docs/...


Requirements:

Browser refresh

Back button

Forward button

Direct URL entry


Review:

PageRecoveryService

Route Synchronization

Page Context Restoration

Scroll Restoration

Requirements:

Refresh page

Navigate away

Navigate back

Restore previous position


Review:

Current implementation

Saved state model

Lifecycle location

DevTools visibility

Deliverable

Possible artifacts:

artifacts.navigation = {
    pageId,
    scrollPosition,
    selectedAnchor
};

Review Phase C
Layout Architecture
Topics
Viewer Shell

Target:

Header

Sidebar

Content Area

TOC Area

DevTools Overlay

Layout Model

Review whether:

render.layout


should evolve into:

ULDELayout


Example:

{
    id: 'docs-layout',
    type: 'sidebar'
}

Responsive Behavior

Review:

Desktop

Tablet

Mobile

Deliverable

Layout architecture diagram.

Review Phase D
ScrollSpy & Active Section Tracking
Topics

Current artifacts already provide:

artifacts.sections

artifacts.toc

artifacts.anchors


These should become the basis of:

Active Section Tracking

TOC Highlighting

Anchor Navigation

ScrollSpy

Questions

Who owns:

Active section

Viewer?

DevTools?

Lifecycle?

Expected Result

New service:

ULDEScrollSpyService


or

ULDENavigationRuntimeService


depending on findings.

Review Phase E
Theme System
Topics

Existing legacy behavior:

Light Theme

Dark Theme

Theme Persistence

Code Theme

Questions

Should themes be:

Viewer only?

Runtime state?

Plugin driven?

Proposed Model
export interface ULDETheme {
    id: string;
    name: string;
    mode: 'light' | 'dark';
}

Areas
Viewer

Panels

Code blocks

Diagrams

Mermaid

KaTeX

Review Phase F
DevTools Phase 2
Current Status

Already implemented:

Diagnostics

Timeline

Profiler

Heatmap

Inspector

Review

Verify ownership of:

ULDEDevtoolsSnapshot


vs

ULDEArtifacts

Future Tabs
Navigation

Theme

Links

Sections

Runtime

Plugins

Review Phase G
Plugin Audit

Review plugins one-by-one.

Current candidates:

Anchor Plugin

TOC Plugin

Section Plugin

External Link Plugin

Mermaid Plugin

KaTeX Plugin

Diagnostics Plugin


For each:

Phase

Inputs

Outputs

Artifacts

DevTools support

Future improvements

Expected End State

At the conclusion of Part 5:

Core Architecture
    Stable

Navigation
    Stable

Recovery
    Stable

ScrollSpy
    Stable

Layout
    Stable

Theme System
    Stable

DevTools
    Enhanced

Plugin Model
    Mature

First Session of Part 5

When you open the new chat and provide the current folder/file structure, I recommend starting with:

Step 1
Folder Structure Review

Step 2
Map old ULDE features

Step 3
Navigation & Recovery

Step 4
Scroll Restoration

Step 5
ScrollSpy


because those runtime/navigation concerns usually influence layout, TOC behavior, and DevTools, making them the best foundation for the remainder of Part 5.

## 2. Current Folder Structure (In Part 4)

```
src/
  app/
    demo/
      example01-01 //  for fure use
        example01.html
        example01.scss
        example-01.ts
    ...
    app.html
    app.routes.ts
    app.scss
    app.spec.ts
    app.ts
  ...
  ulde/
    configurator/
      index.ts
      ulde-configurator.html
      ulde-configurator.routes.ts
      ulde-configurator.scss
      ulde-configurator.ts
      ulde-session-state.service.ts // for part5
      ulde-theme.service.ts  // for part5
    core/
      devtools/
        panels/
          /diagnostics
            index.ts
            ulde-devtools-diagnostics.panel.html
            ulde-devtools-diagnostics.panel.scss
            ulde-devtools-diagnostics.panel.ts
          /frame-timeline
            index.ts
            ulde-devtools-frame-timeline.panel.html
            ulde-devtools-frame-timeline.panel.scss
            ulde-devtools-frame-timeline.panel.ts
          /plugin-timeline
            index.ts
            ulde-devtools-plugin-timeline.panel.html
            ulde-devtools-plugin-timeline.panel.scss
            ulde-devtools-plugin-timeline.panel.ts
          /runtime-inspector
            index.ts
            ulde-devtools-runtime-inspector.panel.html
            ulde-devtools-runtime-inspector.panel.scss
            ulde-devtools-runtime-inspector.panel.ts
          index.ts
        index.ts
        ulde-devtools.html
        ulde-devtools.scss
        ulde-devtools.service.ts
        ulde-devtools.ts
      index.ts
      ulde-lifecycle.service.ts
      ulde-plugin-registry.service.ts
      ulde-runtime.service.ts
    engine/
      index.ts
      ulde-ast-builder.engine.ts
      ulde-ast-renderer.engine.ts
      ulde-ast-visitor.engine.ts
      ulde-content.engine.service.ts
      ulde-interactive.engine.service.ts
      ulde-layout.engine.service.
      ulde-render-context-builder.engine.service.ts
    plugins/
      adaptors/ // depricated
        index.ts
        ulde-plugin-hook-adaptor.ts
      contributor/ // for the future
      registry/
        index.ts
        ulde-plugin-registry.ts
      system/
        content/
          index.ts
          ulde-codeblock.plugin.ts
          ulde-frontmatter-normalizer.plugin.ts
        demo/
          index.ts
          ulde-demo.plugin.ts
          ulde-playground-injector.plugin.ts
        interactive/
          index.ts
          ulde-dummy-test.plugin.ts
          ulde-katex.plugin.ts
          ulde-mermaid.plugin.ts
        layout/
          index.ts
          ulde-anchor.plugin.ts
          ulde-toc.plugin.ts
        navigation/
          index.ts
          ulde-external-link.plugin.ts
          ulde-internal-link.plugin.ts
          ulde-navigation-breadcrumbs.plugin.ts
        ulde/
         index.ts
         ulde-devtools-panel.plugin.ts // for future
         ulde-overlay-custom-panel.plugin.ts // to be depricated
         ulde-slow-plugin-detector.plugin.ts
         ulde-timeline-profiler.plugin.ts
        index.ts
      index.ts
    tools/  // for the future
    types/
      context/
        index.ts
        ulde-context.types.ts
      devtools/
        index.ts
        ulde-devtools.types.ts
      diagnostics/
        index.ts
        ulde-diagnostics.types.ts
      frame/
        index.ts
        ulde-frame.types.ts
      lifecycle/
        index.ts
        ulde-lifecycle.types.ts
      plugin/
        index.ts
        ulde-plugin.types.ts
      renderer/
        index.ts
        ulde-renderer.types.ts
      timing/
        index.ts
        ulde-timing.types.ts
      index.ts
    viewer/
      services/
        ulde-renderer.service.ts
      styles/
        ulde-viewer-base.scss
        ulde-viewer-components.scss
        ulde-viewer-theme-dark.scss
        ulde-viewer-theme-light.scss
      index.ts
      ulde-viewer.html
      ulde-viewer.scss
      ulde-viewer.ts
    index.ts
  ...
...
tsconfig.paths.json
...
vite.config.ts

```

## 3. File contents by the folder structure

### 1. app/

#### 1-1. demo/example01-01/example-01.html
```html
<!-- src/app/demo/example01/example01.html -->

<p>example01 works!</p>

```

#### 1-2.  demo/example01-01/example-01.scss
```scss
// src/app/demo/example01/example01.scss

// for future


```

#### 1-3. demo/example01-01/example-01.ts
```ts
// src/app/demo/example01/example01.ts

import { Component } from '@angular/core';

@Component({
  selector: 'app-example01',
  imports: [],
  templateUrl: './example01.html',
  styleUrl: './example01.scss',
})
export class Example01 {}

```

#### 1-4. app.html
```ts
<!-- src/app/app.html -->

<!-- <p>App Works!</p> -->
<ulde-configurator></ulde-configurator>

```

#### 1-5. app.routes.ts
```ts
// src/app/app.routes.ts

import type { Routes } from '@angular/router';;


export const routes: Routes = [

  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./app')
        .then(m => m.App)
  },
  {
    path: 'PageNotFound',
    loadComponent: () => import('./page-not-found/page-not-found').then(m => m.PageNotFound)
  },

  {
    path: '**',
    redirectTo: 'PageNotFound'
  }
];

```

#### 1-6. app.scss

None


#### 1-7. app.ts
```ts
// src/app/app.ts

import { Component, signal } from '@angular/core';
import { UldeConfigurator } from '../ulde/configurator/ulde-configurator';

@Component({
  selector: 'app-root',
  imports: [UldeConfigurator],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('App');

}

```


### 2. src/ulde/configurator/

#### 2-1. index.ts
```ts
/// src/ulde/configurator/index.ts

export * from "./ulde-configurator";
export * from "./ulde-session-state.service";
export * from "./ulde-theme.service";


```

#### 2-2. ulde-configurator.html
```ts
<!-- src/ulde/configurator/ulde-configurator.html -->
 
<diV class="ulde-configurator-container" #configurator>

  <div class="ulde-markdwon-viewer-container">
    <ulde-viewer [$rendererState]="$rendererStateMarkdownViewer()"
      ($stateChange)="onMarkdownViewerStateChange($event)" ($error)="onErrorMarkdownViewer($event)">
    </ulde-viewer>
  </div>

  <!-- hidden for the time being: To be changed as Directive -->
  <div class="ulde-graph-viewer-container" draggable="true" [class.visible]="false">
    <div #graphDirective> </div>
  </div>


  <div class="ulde-devtools-viewer-container" [class.hidden]="$visibility()==='hidden' ? true : false">
    <ulde-devtools [$rendererState]="$rendererStateDevtoolsViewer()"></ulde-devtools>
  </div>


</diV>

```

#### 2-3. ulde-configurator.routes.ts
```ts
// src/ulde/configurator/ulde-configurator.routes.ts


import type { Routes } from '@angular/router';
import { UldeConfigurator } from '@ulde/configurator';

export const PRODUCT_CONFIGURATOR_ROUTES: Routes = [
  {
    path: '',
    component: UldeConfigurator
  }
];

```

#### 2-4. ulde-configurator.scss
```scss
.ulde-configurator-container {
  display: flex;
  flex-direction: column;
}

.ulde-markdown-viewer-container {
  display: flex;

  .viewer-host {
    padding-left: 15px;
    min-height: 400px;
  }

}

.ulde-graph-viewer-container {
  display: flex;
  align-content: center;
  visibility: hidden;
  cursor:pointer;

  &.visible {
    width: 600px;
    height: 400px;
    visibility: visible;
  }

}


.ulde-devtools-viewer-container {
  position: fixed;
  top: 0;
  right: 0;
  width: 650px;
  height: 90vh;
  background: rgba(20, 20, 20, 0.85); // var(--ulde-background
  color: #eee;
  font-family: system-ui, sans-serif;
  border-radius: 8px 8px 8px 8px;
  padding: 12px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(6px);
  transition: all 0.5s ease-in-out;
  // transition: visibility 2s 500ms;// ease-in-out;
  opacity: 1.0;
  visibility: visible;

  &.hidden {
    padding: 0;
    display: flex;
    width: 0%;
    height: 0%;
    visibility: hidden;
  }

}

```

#### 2-5. ulde-configurator.ts
```ts
// src/ulde/configurator/configurator.ts

import { AfterViewInit, Component, computed, effect, ElementRef, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';

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




  @ViewChild('configurator', { static: true })
  configuratorRef!: ElementRef<HTMLElement>;

  constructor(
    private contenEngine: ContentEngineService,
    private lifecycleService: ULDELifecycleService) {

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

```

#### 2-6. ulde-session-state.service.ts
```ts
// src/ulde/configurator/ulde-session-state.service.ts

import { signal } from '@angular/core';

// Session State
export type SessionSelector = 'app-root' | 'app-docs-viewer' | 'app-ulde-viewer';
export interface SessionState {
  selector: SessionSelector;
  docId: string | null;
  prevDocId: string | null;
  scrollTop: number;
  prevScrollTop: number;
  refreshed: boolean;
  docTheme: string;
}
const SESSION_STATE_KEY = 'sessionState';
const SESSION_STATE_DEFAULT: SessionState = {
  selector: 'app-docs-viewer',
  docId: 'docs/index',
  prevDocId: 'docs/index',
  scrollTop: 0,
  prevScrollTop: 0,
  refreshed: false,
  docTheme: 'dark',
};


const $title = signal<string>('[session-state.manage]');
// -------------------------
// Session state helpers
// -------------------------

export function readSessionState(isBrowser: boolean): SessionState {

  if (!isBrowser) {
    return SESSION_STATE_DEFAULT;
  }

  const raw = localStorage.getItem(SESSION_STATE_KEY);
  if (!raw) {
    return SESSION_STATE_DEFAULT;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SessionState>;
    return {
      selector: parsed.selector ?? 'app-docs-viewer',
      docId: parsed.docId ?? null,
      prevDocId: parsed.prevDocId ?? null,
      scrollTop: parsed.scrollTop ?? 0,
      prevScrollTop: parsed.prevScrollTop ?? 0,
      refreshed: parsed.refreshed ?? false,
      docTheme: parsed.docTheme ?? 'dark',
    };
  } catch {
    return SESSION_STATE_DEFAULT;
  }
}

export function writeSessionState(partial: Partial<SessionState>, isBrowser: boolean): void {
  if (!isBrowser) return;

  const current = readSessionState(isBrowser);
  const next: SessionState = {
    ...current,
    ...partial,
  };
  localStorage.setItem(SESSION_STATE_KEY, JSON.stringify(next));

  // console.log(`Log: ${$title()} writeSessionState called, \ncurrent=${JSON.stringify(current, null, 2)}, \nnext=${JSON.stringify(next, null, 2)}`)

}

export function clearSessionState(isBrowser: boolean): void {
  if (!isBrowser) return;
  localStorage.removeItem(SESSION_STATE_KEY);
  console.log(`Log: ${$title()} clearSessionState()`);
}

```


#### 2-7. ulde-theme.service.ts
```ts
// src/ulde/configurator/ulde-theme.service.ts

import { Injectable } from '@angular/core';
import { isBrowser } from '../../app/global.utils/global.utils';
import { readSessionState, writeSessionState } from '@ulde/configurator';

export type ThemeName = 'light' | 'dark';
export const defaultThemeName: ThemeName = 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {


  private readonly attrName = 'data-theme';

  constructor() {
    if (!isBrowser()) return;
    const { docTheme } = readSessionState(isBrowser());
    const saved = docTheme as ThemeName || defaultThemeName;
    // const saved = (sessionStorage.getItem(this.storageKey) as ThemeName) || 'light';
    this.applyTheme(saved, { animate: false });
  }

  get currentTheme(): ThemeName {
    if (!isBrowser()) {
      return defaultThemeName;
    };
    let attr: ThemeName | null = null;
    try {
      const { docTheme } = readSessionState(isBrowser());
      attr = docTheme as ThemeName | null;
      // attr = document.documentElement.getAttribute(this.attrName) as ThemeName | null;
    } catch (err) {
      console.error('Error: [ThemeService]:', err);
    }
    return attr ?? defaultThemeName;;

  }

  toggleTheme(theme: ThemeName): void {
    // const next: ThemeName = theme;
    // this.applyTheme(theme, { animate: false });
    this.applyTheme(theme, { animate: true });
    writeSessionState({ docTheme: theme }, isBrowser());
    // console.log(`Log: [ThemeService] ToggleTheme new theme=`, next)
  }

  setTheme(theme: ThemeName): void {
    // this.applyTheme(theme, { animate: false });
    this.applyTheme(theme, { animate: true });
    writeSessionState({ docTheme: theme }, isBrowser());
    // writeSessionState({ docTheme: theme as string }, isBrowser());
    // sessionStorage.setItem(this.storageKey, theme as string);
    // console.log(`Log: [ThemeService] setTheme =`, theme);
  }

  private applyTheme(theme: ThemeName, opts: { animate: boolean }) {

    // Apply attribute for CSS + Angular Material theming
    document.documentElement.setAttribute(this.attrName, theme);

    // Body fade-in (uses your @keyframes fade-in)
    if (opts.animate) {
      this.animateBodyFade();
    }

    // Artifacts panel micro animation
    if (opts.animate) {
      this.animateArtifactsPanelTheme();
    }
    // Mermaid micro animation
    if (opts.animate) {
      this.animateMermaid();
    }
  }

  private animateBodyFade() {
    const body = document.body;
    if (!body) return;

    // Restart animation
    body.style.animation = 'none';
    // Force reflow
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    body.offsetHeight;
    body.style.animation = 'fade-in 0.7s forwards ease-in-out';
  }

  private animateArtifactsPanelTheme() {
    const panel = document.querySelector('.ulde-artifacts-panel-content') as HTMLElement | null;
    if (!panel) return;

    panel.classList.add('theme-enter');
    setTimeout(() => panel.classList.remove('theme-enter'), 180);
  }

  // test implementation
  private animateMermaid() {
    // const mermaidSvgs = document.querySelectorAll('.language-mermaid');
    const mermaidSvgs = document.querySelectorAll('code.language-mermaid svg');
    mermaidSvgs.forEach(s => {
      s.classList.add('theme-enter');

      // console.log(`Log: mermaidSvg=`, s);

      setTimeout(() => s.classList.remove('theme-enter'), 700);
    });

  }
}

```

### 3. src/ulde/core/

#### 3-1. index.ts
```ts
// src/ulde/core/index.ts

export * from "./ulde-lifecycle.service";
export * from "./ulde-plugin-registry.service";
export * from "./ulde-runtime.service";

```

#### 3-2. ulde-lifecycle.service.ts
```ts
// src/ulde/core/ulde-lifecycle.service.ts

import { Injectable } from '@angular/core';
import { ULDEPluginRegistryService, ULDERuntimeService } from '@ulde/core';
import { ULDEArtifacts, ULDEExecutionContext, ULDEPageContext } from '@ulde/types/context';
import { ULDELifecyclePhase } from '@ulde/types/lifecycle';
import { ULDEDevtoolsService } from '../devtools';

import { ContentEngineService, ULDERenderContextBuilderService } from '@ulde/engine';

@Injectable({ providedIn: 'root' })
export class ULDELifecycleService {

  constructor(
    private devtoolsService: ULDEDevtoolsService,
    private pluginRegistry: ULDEPluginRegistryService,
    private runtime: ULDERuntimeService,
    private renderContextBuilder: ULDERenderContextBuilderService,
    private contentEngine: ContentEngineService,
  ) { }


  /**
   * Wrap lifecycle phase start/end with devtoolsService timing.
   */
  private async runPluginByLifecyclePhase(
    lifecyclePhase: ULDELifecyclePhase,
    executionCtx: ULDEExecutionContext
  ) {
    this.devtoolsService.startPhase(lifecyclePhase);

    // const { diagnostics } = executionCtx.artifacts;

    try {


      await this.pluginRegistry.runPhase(executionCtx);


      this.devtoolsService.endPhase(lifecyclePhase);
    } catch (err) {

      this.devtoolsService.addDiagnostic({
        level: 'error',
        message: `Error in phase "${lifecyclePhase}": ${String(err)}`,
        lifecyclePhase,
      });
      // console.log(`Log: [ULDELifecycleServic - runPluginByLifecyclePhase]\nmessage=`, `Error in phase "${lifecyclePhase}": ${String(err)}`);
    }

  }

  /**
  * Full lifecycle execution for a page.
  */
  async executeLifecycle(pageContext: ULDEPageContext): Promise<ULDEExecutionContext | undefined> {
    // async executeLifecycle(pageContext: ULDEPageContext): Promise<ULDERenderContext | undefined> {

    // INIT
    const artifacts: ULDEArtifacts = {
      internalLinks: [],
      externalLinks: [],
      toc: [],
      anchors: [],
      sections: [],
      codeBlocks: [],
      diagnostics: [],
      pluginData: {}
    };

    const executionContext: ULDEExecutionContext = {
      lifecyclePhase: 'init',
      page: pageContext,
      artifacts: artifacts
    }

    executionContext.lifecyclePhase = 'init';
    await this.runPluginByLifecyclePhase('init', executionContext);

    // LOAD (content + navigation plugins)
    executionContext.lifecyclePhase = 'load';
    await this.runPluginByLifecyclePhase('load', executionContext);

    // generate markdown-it tokens for the next step
    executionContext.page.source.tokens = await this.contentEngine.transform(executionContext.page.source.raw);

    console.log(`Log: [ULDELifecycleService] executeLifecycle() generated markdown-it tokens=\n`, executionContext.page.source.tokens);

    // RENDER
    // 1. Build initial AST
    const initialAst = this.renderContextBuilder.buildInitialAst(executionContext);

    executionContext.render = {
      pageId: pageContext.pageId,
      ast: initialAst,
      html: '',
      layout: undefined
    };

    // console.log(`Log: [ULDELifecycleService] initialAst : \n`, initialAst);

    // 2. Run render phase plugins on AST
    executionContext.lifecyclePhase = 'render';
    await this.runPluginByLifecyclePhase('render', executionContext);
    // console.log(`Log: [ULDELifecycleService] rendercontex after run render phase plugins on AST : \n`, executionContext.render);

    // 3. Build final context (sections + diagnostics + HTML)
    this.renderContextBuilder.buildFinalContext(executionContext);
    // console.log(`Log: [ULDELifecycleService] rendercontex after .buildFinalContext : \n`, executionContext.render);

    // HYDRATE (interactive plugins)
    executionContext.lifecyclePhase = 'hydrate';
    await this.runPluginByLifecyclePhase('hydrate', executionContext);

    // AFTER RENDER (ULDE system plugins)
    executionContext.lifecyclePhase = 'afterRender';
    await this.runPluginByLifecyclePhase('afterRender', executionContext);

    // Cleanup
    await this.pluginRegistry.destroyAll();
    this.runtime.finalizeFrameAndAnalyze();

    // finally add disgnostics caught by UldeDevtoolsService.addDiagnostics
    const diagnostics = this.devtoolsService.$diagnostics();
    executionContext.artifacts.diagnostics.push(...diagnostics);

    // console.log(`Log: [ULDELifecycleService] final rendercontext: \n`, executionContext.render);

    return executionContext;
    // return executionContext.render;
    // return renderContext;
  }
}

```

#### 3-3. ulde-plugin-registry.service.ts
```ts
// src/ulde/core/ulde-plugin-registry.service.ts
// src/ulde/core/ulde-plugin-registry.service.ts

import { Injectable } from '@angular/core';
import { ULDEDevtoolsService } from '@ulde/devtools';
import { ULDEPluginInstance, ULDEPluginFactory } from '@ulde/types/plugin';
// import { ULDEPluginInstance, ULDEPlugin, ULDEPluginFactory } from '@ulde/types/plugin';

import { ULDE_PLUGIN_REGISTRY } from '@ulde/plugins/registry'; // updated registry
// import { ULDEPluginHookAdapter } from '@ulde/plugins/adaptors';
import { ULDEExecutionContext } from '@ulde/types';

@Injectable({ providedIn: 'root' })
export class ULDEPluginRegistryService {


  /**
   * All instantiated plugins (run‑based instances).
   * Legacy plugins are wrapped using ULDEPluginHookAdapter.
   */
  private instances: ULDEPluginInstance[] = [];

  constructor(private devtoolsService: ULDEDevtoolsService) {
    this.instantiateAllPlugins();
  }

  /**
  * Instantiate all plugins from the registry using factories.
  */
  private instantiateAllPlugins() {
    this.instances = Object.values(ULDE_PLUGIN_REGISTRY)
      .flat()
      .map(factory => this.instantiateFromFactory(factory))
      .filter(plugin => plugin.enabled !== false);
  }

  /**
   * Instantiate plugin from factory.
   * Detect legacy plugins (ULDEPlugin) vs new plugins (ULDEPluginInstance).
   */
  private instantiateFromFactory(factory: ULDEPluginFactory): ULDEPluginInstance {
    const raw = factory();

    // Legacy plugin: has "hooks"
    // if ((raw as ULDEPlugin).hooks) {
    //   return new ULDEPluginHookAdapter(raw as ULDEPlugin);
    // }

    // New plugin: already run‑based
    return raw as ULDEPluginInstance;
  }

  /**
   * Run all plugins assigned to a lifecycle phase.
   */
  async runPhase(executionCtx: ULDEExecutionContext): Promise<void> {

    // const { diagnostics } = executionCtx.artifacts;
    const phase = executionCtx.lifecyclePhase;
    const factories = ULDE_PLUGIN_REGISTRY[phase] || [];

    for (const factory of factories) {
      const raw: ULDEPluginInstance = factory();
      // const raw: ULDEPlugin | ULDEPluginInstance = factory();
      const plugin = raw as ULDEPluginInstance;
      // const plugin = ('hooks' in raw) ?
      //   new ULDEPluginHookAdapter(raw as ULDEPlugin)
      //   : (raw as ULDEPluginInstance);

      if (!plugin) continue;

      const start = performance.now();

      try {

        await plugin.run(executionCtx);
        // await plugin.destroy?.(); // did not exist before
      } catch (err) {
        this.devtoolsService.addDiagnostic({
          level: 'error',
          message: `Plugin "${plugin.pluginName}" failed in phase "${phase}": ${String(err)}`,
          pluginName: plugin.pluginName,
          lifecyclePhase: phase,
        });
      }

      const end = performance.now();

      this.devtoolsService.recordPluginTiming({
        pluginName: plugin.pluginName,
        pluginKind: plugin.pluginKind,
        hookName: 'run',
        lifecyclePhase: phase,
        duration: end - start,
      })
        ;
    }
  }

  /**
   * Destroy all plugins (called at end of lifecycle).
   */
  async destroyAll() {
    // const { diagnostics } = executionCtx.artifacts;

    for (const plugin of this.instances) {
      if (!plugin.destroy) continue;

      const start = performance.now();

      try {
        await plugin.destroy();
      } catch (err) {

        this.devtoolsService.addDiagnostic({
          level: 'error',
          message: `Plugin "${plugin.pluginName}" failed in destroy(): ${String(err)}`,
          pluginName: plugin.pluginName,
          lifecyclePhase: 'afterRender',
        });
      }

      const end = performance.now();

      this.devtoolsService.recordPluginTiming({
        pluginName: plugin.pluginName,
        pluginKind: plugin.pluginKind,
        hookName: 'destroy',
        lifecyclePhase: 'afterRender',
        duration: end - start,
      });
    }

    this.instances = [];
  }

  /**
   * List all instantiated plugins.
   */
  list() {
    return [...this.instances];
  }
}

```

#### 3-4. ulde-runtime.service.ts
```ts
// src/ulde/core/ulde-runtime.service.ts

import { Injectable } from '@angular/core';
import {ULDEDevtoolsService } from '@ulde/devtools';
import { ULDEFrame } from '@ulde/types/frame';


@Injectable({ providedIn: 'root' })
export class ULDERuntimeService {
  // Simple thresholds (tune as needed)
  private phaseWarnThreshold = 12;   // ms
  private phaseErrorThreshold = 24;  // ms
  private pluginWarnThreshold = 8;   // ms
  private pluginErrorThreshold = 16; // ms

  constructor(
    private devtoolsService: ULDEDevtoolsService,

  ) { }

  /**
   * Called at the end of each full lifecycle (afterRender).
   * Orchestrates fro
   * ame finalization + anomaly detection.
   */
  finalizeFrameAndAnalyze() {
    this.devtoolsService.finalizeFrame();

    const frame = this.devtoolsService.$currentFrame();
    if (!frame) return;

    this.detectPhaseAnomalies(frame);
    this.detectPluginAnomalies(frame);
  }

  private detectPhaseAnomalies(frame: ULDEFrame) {
    for (const phase of frame.lifecyclePhaseTimings) {
      if (phase.duration > this.phaseErrorThreshold) {
        this.devtoolsService.addDiagnostic({
          level: 'error',
          message: `Lifecycle phase "${phase.lifecyclePhase}" exceeded error threshold (${this.phaseErrorThreshold}ms): ${phase.duration.toFixed(1)}ms`,
          lifecyclePhase: phase.lifecyclePhase,
        });
      } else if (phase.duration > this.phaseWarnThreshold) {
        this.devtoolsService.addDiagnostic({
          level: 'warn',
          message: `Lifecycle phase "${phase.lifecyclePhase}" exceeded warn threshold (${this.phaseWarnThreshold}ms): ${phase.duration.toFixed(1)}ms`,
          lifecyclePhase: phase.lifecyclePhase,
        });
      }
    }
  }

  private detectPluginAnomalies(frame: ULDEFrame) {
    for (const t of frame.pluginTimings) {
      if (t.duration > this.pluginErrorThreshold) {
        this.devtoolsService.addDiagnostic({
          level: 'error',
          message: `Plugin "${t.pluginName}" in hook "${t.hookName}" exceeded error threshold (${this.pluginErrorThreshold}ms): ${t.duration.toFixed(1)}ms`,
          pluginName: t.pluginName,
          lifecyclePhase: t.lifecyclePhase,
        });
      } else if (t.duration > this.pluginWarnThreshold) {
        this.devtoolsService.addDiagnostic({
          level: 'warn',
          message: `Plugin "${t.pluginName}" in hook "${t.hookName}" exceeded warn threshold (${this.pluginWarnThreshold}ms): ${t.duration.toFixed(1)}ms`,
          pluginName: t.pluginName,
          lifecyclePhase: t.lifecyclePhase,
        });
      }
    }
  }

  // in ULDERuntimeService
  // async runForPage(pageCtx: ULDEPageContext, renderCtx: ULDERenderContext) {
  //   await this.lifecycle.run(pageCtx, renderCtx);
  //   this.finalizeFrameAndAnalyze();
  // }

}

```


### 4. src/ulde/devtools/

#### 4-1. panels/diagnostics/

##### 4-1-1. index.ts
```ts
// src/ulde/devtools/panels/diagnostics/index.ts

export * from "./ulde-devtools-diagnostics.panel";

```

##### 4-1-2. ulde-devtools-diagnostics.panel.html
```html
<!-- src/ulde/devtools/panels/diagnostics/ulde-devtools-diagnostics.panel.html -->

<!-- <p>ulde-diagnostics-panel works!</p> -->

<div #diagnosticHost class="ulde-diagnostics-panel-root" [class.collapsed]="!$expanded()">

  <div class="header" (click)="toggle()">
    <span>Diagnostics ({{ $diagnostics()?.length }})</span>
    <span class="chevron">{{ $expanded() ? '▼' : '▲' }}</span>
  </div>


  @if ($expanded()) {
    <div class="body">
      @for (d of $diagnostics(); track trackDiag($index, d)) {
        <div class="diag-item diag-{{ d.level }}" (click)="onHighlight(d.message)">
          <strong>{{ d.level.toUpperCase() }}</strong>
          <span class="msg">{{ d.message }}</span>

          @if (d.pluginName) {
            <span class="meta">plugin: {{ d.pluginName }}</span>
          }
          <br>
          @if (d.lifecyclePhase) {
            <span class="meta">phase: {{ d.lifecyclePhase }}</span>
          }
        </div>
      }
    </div>
  }
</div>

```

###### 4-1-3. ulde-devtools-diagnostics.panel.scss
```scss
// src/ulde/devtools/panels/diagnostics/ulde-devtools-diagnostics.panel.scss

.ulde-diagnostics-panel-root {
  // position: fixed;
  display:flex;
  bottom: 1rem;
  right: 1rem;
  width: 100%;//320px;
  background: var(--ulde-bg);
  color: var(--ulde-text);
  border: 1px solid var(--ulde-border);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  font-size: 0.9rem;
  // z-index: 9999;
}

.ulde-diagnostics-panel.collapsed {
  height: auto;
}

.header {
  padding: 0.75rem 1rem;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 1px solid var(--ulde-border);
  // display: flex;
  justify-content: space-between;
}

.body {
  max-height: 300px;
  overflow-y: auto;
  padding: 0.5rem 1rem;
}

.diag-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--ulde-border);
}

.diag-item:last-child {
  border-bottom: none;
}

.diag-info {
  color: var(--ulde-diagnostic-info);
}

.diag-warn {
  color: var(--ulde-diagnostic-warn);
}

.diag-error {
  color: var(--ulde-diagnostic-error);
}

.msg {
  display: block;
  margin: 0.25rem 0;
}

.meta {
  font-size: 0.8rem;
  opacity: 0.7;
  margin-right: 0.5rem;
}


.highlight {
  background: rgba(255, 255, 0, 0.3);
  transition: background 0.5s ease;
}

/* Define diagnostics injected into AST */
.ulde-diagnostic {
  padding: 0.75rem;
  margin: 1rem 0;
  border-radius: 4px;
  font-size: 0.9rem;
}

.ulde-diagnostic-info {
  background: rgba(0, 120, 212, 0.1);
  border-left: 4px solid var(--ulde-diagnostic-info);
}

.ulde-diagnostic-warn {
  background: rgba(230, 161, 0, 0.1);
  border-left: 4px solid var(--ulde-diagnostic-warn);
}

.ulde-diagnostic-error {
  background: rgba(216, 59, 1, 0.1);
  border-left: 4px solid var(--ulde-diagnostic-error);
}

.ulde-diagnostic strong {
  font-weight: 600;
}

```

###### 4-1-3. ulde-devtools-diagnostics.panel.ts
```ts
// src/ulde/devtools/panels/diagnostics/ulde-devtools-diagnostics.panel.ts

import { Component, input, signal, ViewChild, ElementRef } from '@angular/core';
import { ULDEDiagnostic } from '@ulde/types/diagnostics';

@Component({
  selector: 'ulde-devtools-diagnostics-panel',
  standalone: true,
  templateUrl: './ulde-devtools-diagnostics.panel.html',
  styleUrl: './ulde-devtools-diagnostics.panel.scss',
})
export class UldeDevToolsDiagnosticsPanel {

  @ViewChild('diagnosticsHost', { static: true })
  hostRef!: ElementRef<HTMLElement>;

  $diagnostics = input<ULDEDiagnostic[]>();
  // $highlight = output<string>();

  $expanded = signal(true);

  toggle() {
    this.$expanded.update(v => !v);
  }

  trackDiag(i: number, d: ULDEDiagnostic) {
    return `${d.level}-${d.message}-${i}`;
  }

  onHighlight(msg: string) {
    const nodes = this.hostRef.nativeElement.querySelectorAll('.body .ulde-item .msg');

    nodes.forEach(n => {
      if (n.textContent?.includes(msg)) {
        n.classList.add('ulde-diagnostic-highlight');

        setTimeout(() => {
          n.classList.remove('ulde-diagnostic-highlight');
        }, 1500);
      }
    });
  }


}

```

#### 4-2. panels/frame-timeline/

##### 4-2-1. index.ts
```ts
// src/ulde/devtools/panels/frame-timeline/index.ts

export * from './ulde-devtools-frame-timeline.panel';

```

##### 4-2-2. ulde-devtools-frame-timeline.panel.html
```html
<!-- src/ulde/devtools/panels/frame-timeline/ulde-devtools-frame-timeline.panel.html -->

<!-- <p>ulde-devtools-frame-timeline-panel works!</p> -->

<div class="ulde-frame-timeline-panel-root">
  <div class="header">
    <span>Frame Execution Timeline Panel</span>
  </div>
  @if($timelines()){
  <!-- @if($timelines().length > 0 ){ -->
  <div class="timelines">
    @for(t of $timelines(); track t.frameId){
    <div class="timeline">
      <div class="timeline-header">
        <div class="item">
          <span>Frame id: </span><span>{{ t.frameId}}</span>
        </div>
        <div class="item">
          <span>Timestamp: </span><span>{{ t.timeStamp | date:'full'}}</span>
        </div>
        <div class="item">
          <span>Total duration: </span><span>{{t.totalDuration.toFixed(3)}} ms</span>
        </div>

      </div>

      <div class="timeline-bar">
        @for (p of t.phases; track p.lifecyclePhase) {
        <div class="segment" [style.width.%]="(p.duration/t.totalDuration) * 100"
          [style.background]="phaseColor(p.lifecyclePhase)" [title]="p.lifecyclePhase + ': ' + p.duration + ' ms'">
        </div>
        }

      </div>

      <div class="legend">
        @for (p of t.phases; track p.lifecyclePhase) {
        <div class="legend-item" [class.warn]="p.duration > $thresholds().phaseWarn"
          [class.error]="p.duration > $thresholds().phaseError">
          <span class="color" [style.background]="phaseColor(p.lifecyclePhase)"></span>
          <span class="name">{{ p.lifecyclePhase }}</span>
          <span class="duration">{{ p.duration.toFixed(3) }} ms</span>
        </div>
        }
      </div>
    </div>
    }
  </div>
  }
</div>

```

##### 4-2-3. ulde-devtools-frame-timeline.panel.scss
```scss
//src/ulde/devtools/panels/frame-timeline/ulde-devtools-frame-timeline.panel.scss

.ulde-frame-timeline-panel-root {
  // display: flex;
  // background: var(--ulde-bg);
  border: 1px solid var(--ulde-border);
  border-radius: 6px;
  padding: 1rem;
  // height: fit-content;
  // width: fit-content;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.header {
  margin-bottom: 1rem;
  font-weight: 800;
}

.timelines {
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.timeline {
  border: 1px solid var(--ulde-border);
}

.timeline-header {
  display: grid;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-weight: 600;

  .item {
    display: grid;
    flex-direction: row;
    grid-template-columns: 1fr 3fr ;
  }
}

.timeline-bar {
  width: 90%;
  // border: 20px;
  align-items: center;
  // overflow: fobidden;
  // border-radius: 3px;
  margin-bottom: 0.75rem;

  .segment {
    // width: 100%;
    display: inline-flex;
    height: 5px; // 100%;
    transition: width 0.1s linear;
  }

}

.legend {
  height: 120px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 4px;
  background: #333;
  border-right: 1px solid #444;
  cursor: pointer;
  transition: background 0.2s;
  // overflow: auto;

  .legend-item {
    display: flex;
    align-items: end;
    // width: 30px;
    gap: 0.5rem;

    &.warn {
      background: #7a5f00;
    }

    &.error {
      background: #7a0000;
    }

    .color {
      width: 12px;
      height: 15px;
      border-radius: 3px;
    }

    .name,
    .duration {
      width: 100px;
      height: 20px;
      text-align: left;
    }

  }

}

```

###### 4-2-4. ulde-devtools-frame-timeline.panel.ts
```ts
// src/ulde/devtools/panels/frame-timeline/ulde-devtools-frame-timeline.panel.ts

import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ULDELifecyclePhase, ULDETimelinePoint } from '@ulde/types';

@Component({
  selector: 'ulde-devtools-frame-timeline-panel',
  imports: [DatePipe],
  templateUrl: './ulde-devtools-frame-timeline.panel.html',
  styleUrl: './ulde-devtools-frame-timeline.panel.scss',
})
export class UldeDevtoolsFrameTimelinePanel {

  $thresholds = input<any>();

  $timelines = input<ULDETimelinePoint[]>();


  phaseColor(phase: ULDELifecyclePhase) {
    switch (phase) {
      case 'init': return '#607d8b';
      case 'load': return '#03a9f4';
      case 'render': return '#4caf50';
      case 'hydrate': return '#9c27b0';
      case 'afterRender': return '#9e9e9e';
      default: return '#cccccc';
    }
  }
}

```

#### 4-3. panels/plugin-timeline/

##### 4-3-1. index.ts
```ts
// src/ulde/devtools/panels/plugin-timeline/index.ts

export * from './ulde-devtools-plugin-timeline.panel';

```

##### 4-3-2. ulde-devtools-plugin-timeline.panel.html
```ts
<!-- src/ulde/devtools/panels/plugin-timeline/ulde-devtools-plugin-timeline.panel.html -->

<!-- <p>ulde-plugin-timeline-panel works!</p> -->

<div class="ulde-plugin-timeline-panel-root">

  <div class="header">
    <span><strong>Plugin Execution Timeline Panel</strong></span>
    <span>{{ $pluginTimings()?.length }} plugins</span>
    <span>total duration: {{total.toFixed(3)}} ms</span>
  </div>

  <div class="rows">
    @if($pluginTimings()){
    <!-- @if($pluginTimings().length > 0){ -->

    @for (p of $plugins(); track p.label) {
    <div class="row">
      <div class="color" [style.background]="p.color"></div>
      <div class="kind">{{p.kind}} </div>
      <div class="label">{{ p.label }}</div>
      <div class="phase">{{p.phase}}</div>
      <div class="duration" [style.color]="p.color">
        {{ p.duration.toFixed(3) }} ms
      </div>
      <div class="bar-container">
        <div class="bar" [style.width.%]="p.ratio * 100" [style.background]="p.color">
        </div>
      </div>

    </div>
    }
    }
  </div>

</div>

```

##### 4-3-3. ulde-devtools-plugin-timeline.panel.scss
```scss
// src/ulde/devtools/panels/plugin-timeline/ulde-devtools-plugin-timeline.panel.scss

.ulde-plugin-timeline-panel-root {
  display: inline-block;
  height: auto;
  width: 90%;
  border: 1px solid var(--ulde-border);
  border-radius: 6px;
  padding: 1rem;
  margin-top: 1rem;
  font-size: 0.9rem;
  overflow: auto;

}

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.rows {
  display: flex;
  height: 400px;
  flex-direction: column;
  gap: 0.5rem;
  overflow: auto;


  .row {
    padding-left: 5px;
    padding-right: 5px;
    width: 100%;
    display: grid;
    flex-direction: row;
    align-items: center;
    border: 1px solid var(--ulde-border);
    grid-template-columns: 0.05fr 0.2fr 0.8fr 0.25fr 0.25fr 0.3fr;
    // grid-template-columns: 0.05fr 0.3fr 0.6fr 0.3fr 0.3fr 0.3fr;

    font-size: 0.8rem;
  }

  .kind,
  .phase,
  .label,
  .duraion {
    height: 20px;
    padding-left: 3px;
    text-wrap: wrap;
    text-align: left;

  }

  .color {
    height: 12px;
    border-radius: 3px;
  }


  .duration {
    font-weight: bold;
  }

  .bar-container {
    background: var(--ulde-border);
    width: 100px;
    height: 12px;
    border-radius: 3px;

    .bar {
      border-radius: 3px;
      height: 100%;
      transition: width 0.15s ease-out;
    }

  }
}

```

##### 4-3-4. ulde-devtools-plugin-timeline.panel.ts
```ts
// src/ulde/devtools/panels/plugin-timeline/ulde-devtools-plugin-timeline.panel.ts

import { Component, computed, input } from '@angular/core';
import { ULDEPluginKind } from '@ulde/types/plugin';
import { ULDEPluginTiming } from '@ulde/types/timing';

@Component({
  selector: 'ulde-devtools-plugin-timeline-panel',
  imports: [],
  templateUrl: './ulde-devtools-plugin-timeline.panel.html',
  styleUrl: './ulde-devtools-plugin-timeline.panel.scss',
})
export class UldeDevtoolsPluginTimelinePanel {

  total: number = 0;

  $pluginTimings = input<ULDEPluginTiming[]>();


  $plugins = computed(() => {
    const list = this.$pluginTimings() ?? [];
    if (list.length === 0) return [];

    this.total = list.reduce((sum, p) => sum + p.duration, 0) || 1;

    return list
      .slice()
      .sort((a, b) => b.duration - a.duration)
      .map(p => ({
        label: `${p.pluginName} (${p.hookName})`,
        duration: p.duration,
        ratio: p.duration / this.total,
        color: pluginColor(p.pluginKind),
        phase: p.lifecyclePhase,
        kind: p.pluginKind,
      }));
  });
}

function pluginColor(kind: ULDEPluginKind) {
  switch (kind) {
    // switch (kind) {
    case 'content': return '#4caf50';
    case 'layout': return '#2196f3';
    case 'interactive': return '#ff9800';
    case 'navigation': return '#9c27b0';
    case 'demo': return '#e91e63';
    case 'ulde': return '#9e9e9e';
    default: return '#cccccc';
  }
}

```


#### 4-4. panels/runtime-inspector/

##### 4-4-1. index.ts
```ts
// src/ulde/devtools/panels/runtime-inspector/index.ts

export * from './ulde-devtools-runtime-inspector.panel';

```

##### 4-4-2. ulde-devtools-runtime-inspector.panel.html
```html
<!-- src/ulde/devtools/panels/runtime-inspector/ulde-devtools-runtime-inspector.panel.html -->

<p>ulde-runtime-inspector-panel works!</p>

<div class="devtools-runtime-inspector-panel-root">

  <div class="header">
    <span><strong>Runtime Inspector Panel</strong></span>
    <span class="meta">model: {{ $rendererState()?.modelId }}</span>
    <span class="meta">variant: {{ $rendererState()?.variantId }}</span>
  </div>

  @if($rendererState()){

  <div class="tabs">
    <button class="tab" [class.active]="$activeTab() === 'ast'" (click)="setTab('ast')">AST</button>
    <button class="tab" [class.active]="$activeTab() === 'layout'" (click)="setTab('layout')">Layout</button>
    <button class="tab" [class.active]="$activeTab() === 'sections'" (click)="setTab('sections')">Sections</button>
    <button class="tab" [class.active]="$activeTab() === 'toc'" (click)="setTab('toc')">TOC</button>
    <button class="tab" [class.active]="$activeTab() === 'anchors'" (click)="setTab('anchors')">Anchors</button>
    <!-- <button class="tab" [class.active]="$activeTab() === 'frame'" (click)="setTab('frame')">Frame</button> -->
  </div>

  <div class="body">

    @if ($activeTab() === 'ast') {
    <pre class="json-view">{{ $astNodes() | json }}</pre>
    }

    @if ($activeTab() === 'layout') {
    <pre class="json-view">{{ $layout() | json }}</pre>
    }

    @if ($activeTab() === 'sections') {
    <ul class="list-view">
      @for (s of $sections(); track track($index)) {
      <li>
        <code>{{ s.id }}</code>
        <!-- <span class="title">{{ s.title }}</span> -->
        <span class="depth">depth: {{ s.depth }}</span>
      </li>
      }
    </ul>
    }

    @if ($activeTab() === 'toc') {
    <ul class="list-view">
      @for (t of $toc(); track track($index)) {
      <li>
        <code>{{ t.href }}</code>
        <span class="title">{{ t.label }}</span>
      </li>
      }
    </ul>
    }

    @if ($activeTab() === 'anchors') {
    <ul class="list-view">
      @for (a of $anchors(); track track($index)) {
      <li>
        <code>{{ a.id }}</code>
        <span class="depth">{{ a.depth }}</span>
        <span class="title">{{ a.text }}</span>
      </li>
      }
    </ul>
    }

    <!-- @if ($activeTab() === 'frame') {
    <pre class="json-view">{{ $frame() | json }}</pre>
    } -->

  </div>
  }
</div>

```

##### 4-4-3. ulde-devtools-runtime-inspector.panel.scss
```scss
// src/ulde/devtools/panels/runtime-inspector/ulde-devtools-runtime-inspector.panel.scss

.devtools-runtime-inspector-panel-root {
  // background: var(--ulde-bg);
  height: 300px;// auto;
  border: 1px solid var(--ulde-border);
  border-radius: 6px;
  padding: 1rem;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.meta {
  font-size: 0.8rem;
  opacity: 0.7;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.tab {
  border: 1px solid var(--ulde-border);
  background: var(--ulde-bg);
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
}

.tab.active {
  background: var(--ulde-accent);
  color: #fff;
  border-color: var(--ulde-accent);
}

.body {
  max-height: 260px;
  overflow: auto;
}

.json-view {
  font-family: monospace;
  font-size: 0.8rem;
  background: #1113;
  padding: 0.5rem;
  border-radius: 4px;
}

.list-view {
  list-style: none;
  padding: 0;
  margin: 0;
}

.list-view li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
  border-bottom: 1px solid var(--ulde-border);
}

.list-view li:last-child {
  border-bottom: none;
}

code {
  font-family: monospace;
  font-size: 0.8rem;
  background: #0001;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
}

```

##### 4-4-4. ulde-devtools-runtime-inspector.panel.ts
```ts
// src/ulde/devtools/panels/runtime-inspector/ulde-devtools-runtime-inspector.panel.ts

import { JsonPipe } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { ULDERendererState } from '@ulde/types/renderer';
import { ULDEAstNode } from '@ulde/types/context';
import { ULDEFrame } from '@ulde/types/frame';
import { ULDEDevtoolsInspectorTab } from '@ulde/types/devtools';

@Component({
  selector: 'ulde-devtools-runtime-inspector-panel',
  imports: [JsonPipe],
  templateUrl: './ulde-devtools-runtime-inspector.panel.html',
  styleUrl: './/ulde-devtools-runtime-inspector.panel.scss',
})
export class UldeDevtoolsRuntimeInspectorPanel {

  $rendererState = input<ULDERendererState>();

  $frame = input<ULDEFrame>();
  // $frame = input<ULDEFrame | null>(null);

  $activeTab = signal<ULDEDevtoolsInspectorTab>('ast');

  $astNodes = computed(() => this.$rendererState()?.executionContext?.render?.ast ?? []);
  $layout = computed(() => this.$rendererState()?.executionContext?.render?.layout ?? null);
  // $frame = computed(() => this.$rendererState()?.frame ?? null);
  $sections = computed(() => this.extractSections(this.$astNodes()));
  $toc = computed(() => this.extractToc(this.$astNodes()));
  $anchors = computed(() => this.extractAnchors(this.$astNodes()));

  private extractSections(ast: ULDEAstNode[]) {
    const result: { id: string; depth: number }[] = [];

    function walk(node: ULDEAstNode) {
      if (node.type === 'section') {
        result.push({
          id: node.id ?? '',
          depth: node.depth ?? 0,
        });
      }

      node.children?.forEach(child => walk(child));
    }

    ast.forEach(n => walk(n));


    return result;
  }

  private extractToc(ast: ULDEAstNode[]) {
    const tocs: { href: string; label: string }[] = [];

    function walk(node: ULDEAstNode) {
      if (node.type === 'internalLink') {
        tocs.push({
          href: node.href,
          label: node.children?.filter(n => n.type === 'text').map(n => n.value).join('') ?? ''
        });
      }

      node.children?.forEach(child => walk(child));
    }

    ast.filter(n => n.type === 'toc').forEach(n => walk(n));

    return tocs;
  }

  private extractAnchors(ast: ULDEAstNode[]) {

    console.log(`Log: [UldeRuntimeInspectorPanel] extractAnchors`);

    const anchors: { id: string; depth: number, text: string }[] = [];
    let depth: number = 0;

    function walk(children: ULDEAstNode[] | undefined) {

      if (children === undefined) return;

      let id: string ='';
      let text: string ='';

      children.forEach((child) => {

        switch (child.type) {
          case 'anchor': {
            id = child.id ?? '';
            break;
          }
          case 'text': {
            text = child.value ?? '';
            break;
          }
        };

        if (id !== '' && text !== '') {
          anchors.push({
            id: id,
            depth: depth,
            text: text
          });

          walk(child.children);
        }

      });

    }

    ast.filter(n => n.type === 'section').forEach(n => n.children?.filter(n => n.type === 'heading').forEach(n => {
      depth = n.depth ?? -1;
      walk(n.children);
    }));

    return anchors;
  }

  setTab(tab: ULDEDevtoolsInspectorTab) {
    this.$activeTab.set(tab);
  }

  track(i: number) { return i; }


}

```

#### 4-5. panels/index.ts
```ts
// src/ulde/devtools/panels/index.ts

export * from "./diagnostics";
export * from "./frame-timeline";
export * from "./plugin-timeline";
export * from "./runtime-inspector";

```

#### 4-6. index.ts
```ts
// src/ulde/devtools/index.ts

export * from './panels';
export * from "./ulde-devtools.service";
export * from "./ulde-devtools";

```

#### 4-7. udel-devtools.html
```html
<!-- src/ulde/devtools/ulde-devtools.html -->

<!-- <p>UldeDevtools Works!</p> -->

<div class="ulde-devtools-root" [class.hidden]="!$visible()">
  <!-- <div class="ulde-devtools-root" [class.hidden]="!$visible()" [style.opacity]="$opacity()"> -->

  <!-- Header -->
  <header class="header" [class.hidden]="!$visible()">
    <!-- <header class="header"> -->
    <h3>ULDE DevTools Panel</h3>
    <div class="controls" [class.hidden]="!$visible()">
      <button (click)="toggleDevTools()">Toggle</button>
      <button (click)="pinDevTools()">
        {{ $pinned() ? 'Unpin' : 'Pin' }}
      </button>
      <input [class.hidden]="!$visible()" type="range" min="0.2" max="1" step="0.1" [value]="$opacity()"
        (input)="setDevToolsOpacity($any($event.target).value)" />
    </div>
  </header>

  <div class="body" [class.hidden]="!$visible()" [style.opacity]="$opacity()">
    <!-- <div class="body"> -->

    <div class="tabs">
      <button class="tab" [class.active]="$activeTab() === 'diagnostics'"
        (click)="selectTab('diagnostics')">Diagnostics</button>
      <button class="tab" [class.active]="$activeTab() === 'timeline'" (click)="selectTab('timeline')">Timeline</button>
      <button class="tab" [class.active]="$activeTab() === 'profiler'" (click)="selectTab('profiler')">Profiler</button>
      <button class="tab" [class.active]="$activeTab() === 'heatmap'" (click)="selectTab('heatmap')">Heatmap</button>
      <button class="tab" [class.active]="$activeTab() === 'inspector'"
        (click)="selectTab('inspector')">Inspector</button>
      <button class="tab" [class.active]="$activeTab() === 'frames'" (click)="selectTab('frames')">Frames</button>
      <button class="tab" [class.active]="$activeTab() === 'plugins'" (click)="selectTab('plugins')">Plugins</button>
      <button class="tab" [class.active]="$activeTab() === 'sparkline'"
        (click)="selectTab('sparkline')">Sparkline</button>
    </div>

    <!-- @if($rendererState() !== undefined){ -->


    @if($activeTab() === 'diagnostics'){
    <!-- Disgnostics -->
    <div class="diagnostics-tab">
      <ulde-devtools-diagnostics-panel
        [$diagnostics]="$snapshot()?.executionContext?.artifacts?.diagnostics"></ulde-devtools-diagnostics-panel>
    </div>

    }

    @if($activeTab() === 'timeline'){
    <!-- Timeline -->
    <div class="timeline-tab">
      <ulde-devtools-frame-timeline-panel [$timelines]="$snapshot()?.analytics?.timeline"
        [$thresholds]="thresholds"></ulde-devtools-frame-timeline-panel>
    </div>
    }

    @if($activeTab() === 'profiler'){
    <div class="profiler-tab">
    </div>

    }

    @if($activeTab() === 'heatmap'){

    <div class="heatmap-tab">
      <div class="header">
        <span>Plugin Heatmap</span>
      </div>

      <div class="rows">
        @for (t of $snapshot()?.analytics?.heatMap; track ($index)) {
        <div class="row">
          <div class="phase">
            <span>{{ t.lifecyclePhase }} </span>
          </div>
          <div class="kind">
            <span>{{ t.pluginKind }} </span>
          </div>
          <div class="plugin hook">
            <span>{{ t.pluginName }} ({{ t.hookName }}) </span>
          </div>
          <div class="intensity-container">
            <div class="intensity" [style.width.%]="t.intensity * 100" [style.background]="'#d53c3c'"
              [title]="t.lifecyclePhase + '-' + t.pluginKind + '-' + t.pluginName + '-' + t.hookName ">
            </div>
          </div>
          <div class="ratio">
            <span>{{t.intensity.toFixed(3)}}</span>
          </div>
        </div>
        }
      </div>
    </div>

    }

    @if($activeTab() === 'inspector'){
    <!-- Inspector -->
    <div class="inspector-tab">
      <ulde-devtools-runtime-inspector-panel [$rendererState]="$rendererState()"
        [$frame]="$snapshot()?.executionContext?.artifacts?.frame"></ulde-devtools-runtime-inspector-panel>
    </div>
    }

    @if($activeTab() === 'frames'){
    <!-- Frames -->
    <div class="frame-history-tab">
      <section class="frame-history">
        <h4>Frame History</h4>
        <div class="frame-history-container">

          @for (f of $snapshot()?.frameHistory; track f.id) {
          <div class="frame-row" (click)="selectFrame(f)">
            <span class="frame-id">Frame Id: {{ f.id }}</span>
            <span class="timestamp">Timestamp: {{ f.timestamp | date:'full' }}</span>
            <span class="total">Total Duration:
              {{
              f.lifecyclePhaseTimings.reduce((a, p) => a + p.duration, 0)
              | number:'1.0-1'
              }}ms
            </span>
            <span class="json-view">
              @for(t of f.lifecyclePhaseTimings; track t.lifecyclePhase; let no = $index){
              <span>#{{no}}: </span>
              <span>{{t| json }}</span><br>
              }
            </span>
          </div>
          }
        </div>
      </section>
    </div>

    }

    @if($activeTab() === 'plugins'){
    <!-- Plugin Timings -->
    <div class="plugins-tab">
      <ulde-devtools-plugin-timeline-panel
        [$pluginTimings]=" $snapshot()?.executionContext?.artifacts?.frame?.pluginTimings"></ulde-devtools-plugin-timeline-panel>
    </div>

    }

    @if($activeTab() === 'sparkline'){
    <!-- Sparkline -->
    <div class="sparkline-tab">
      <section class="sparkline">
        <h4>Sparline</h4>
        <svg width="100%" height="100%">
          <polyline class="sparkline-line" [attr.points]="$sparklinePoints()"></polyline>
        </svg>
      </section>

    </div>
    }

  </div>
  <!-- } -->
</div>

```

#### 4-8. udel-devtools.scss
```scss
// src/ulde/devtools/ulde-devtools.scss

.ulde-devtools-root {
  // position: fixed;
  // top: 0;
  // right: 0;
  // // width: 650px;
  // // height: 90vh;
  // background: rgba(20, 20, 20, 0.85); // var(--ulde-background
  // color: #eee;
  // font-family: system-ui, sans-serif;
  // border-radius: 8px 8px 8px 8px;
  display: flex;
  flex-direction: column;
  // padding: 12px;
  // box-shadow: 0 0 20px rgba(0, 0, 0, 0.4);
  // backdrop-filter: blur(6px);
  transition: opacity 0.2s ease;
  // opacity: 1.0;
  // visibility: visible;

  &.hidden {
    // position: relative;
    // display: flex;
    // flex-direction: row;
    right: 0;
    width: 300px;
    height: 5vh;
    background: var(--ulde-background);
    color: rgb(20, 16, 16); //
    // opacity: 0;
    // visibility: hidden;
    // pointer-events: none;
  }

}

header.header {
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  .controls {
    display: flex;
    gap: 8px;
    align-items: center;

    button {
      background: #555;
      border: none;
      padding: 6px 10px;
      border-radius: 4px;
      color: #eee;
      cursor: pointer;

      &:hover {
        background: #666;
      }
    }

    input[type='range'] {
      width: 80px;

      //input
      &.hidden {
        visibility: hidden;
      }
    }

    // control
    &.hidden {
      padding-left: 5px;
      padding-right: 5px;
      width: 100%;
      display: grid;
      flex-direction: column;
      align-items: center;
      grid-template-columns: 0.5fr 0.5fr 0.5fr;
    }

  }

  // header
  &.hidden {
    width: fit-content;
    opacity: 0.3;

    h3 {
      font-size: 12px;
      font-weight: 500;

    }

  }
}


.body {
  // height: 85vh; // max-height: auto;
  visibility: visible;

  // body;
  &.hidden {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
  }

}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;

  .tab {
    border: 1px solid var(--ulde-border);
    background: var(--ulde-bg);
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-size: 0.8rem;
    cursor: pointer;
  }

  .tab.active {
    background: var(--ulde-accent);
    color: #fff;
    border-color: var(--ulde-accent);
  }

}




/* Diagnostics */
.diagnostics-tab {
  // max-height: 120px;
  height: auto;
  overflow-y: auto;
  // margin-bottom: 12px;

}

/* Timeline*/
.timeline-tab {
  height: auto;
  overflow-y: auto;
}

/* Profiler*/
.profiler-tab {
  height: auto;
  overflow-y: auto;
}

/* Heatmap */
.heatmap-tab {
  width: 100%;
  // .plugin-timings {
  display: inline-block;
  // flex: 1;
  // max-height: 140px;
  // overflow-y: auto;
  height: auto;
  // margin-bottom: 12px;

  .header {
    margin: 0 0 6px 0;
    font-size: 18px;
    font-weight: 600;
  }

  .rows {
    display: flex;
    flex-direction: column;
    height: 350px;
    gap: 0.5rem;
    overflow: auto;

    .row {
      padding-left: 5px;
      padding-right: 5px;
      width: 95%;
      // width: fit-content;
      display: grid; //inline-flex;
      flex-direction: row;
      align-items: center;
      border: 1px solid var(--ulde-border);
      grid-template-columns: 0.3fr 0.3fr 0.9fr 0.3fr 0.3fr;
      // padding: 4px 0;
      // border-bottom: 1px solid #f3ebeb;
      cursor: pointer;

      &:hover {
        background: rgba(82, 229, 19, 0.582);
      }

      .phase,
      .kind,
      .plugin,
      .hook,
      .ratio {
        padding-right: 2px;
        text-align: left;
        // font-weight: bold;
      }

      .intensity-container {
        height: 10px;
        width: 60px;

        background: #edeaea;
        ;
        // bottom: 0px;

        .intensity {
          display: flex;
          height: 100%;
          transition: width 0.15s linear;
        }

      }

      .ratio {
        color: rgb(241, 11, 11);
        font-weight: bold;
      }
    }
  }
}

/* Inspector */
.inspector-tab {
  height: auto;
  overflow: hidden;
}

/* Frames */
.frame-history-tab {
  display: flex;
  width: fit-content;
  height: 75vh;
  // overflow-y: auto;

  .frame-history {

    // max-height: auto;
    // display: flex;
    // overflow-y: auto;

    border: 1px solid var(--ulde-border);
    border-radius: 5px;
    ;

    h4 {
      padding-left: 5px;
      ;
      margin: 0 0 6px 0;
      font-size: 14px;
      font-weight: 600;
    }

    .frame-history-container {
      padding-left: 10px;
      // display: flex;
      // flex-direction: column;
      height: 70vh;
      overflow-y: auto;

      .frame-row {
        display: flex;
        flex-direction: column;
        // display: grid;
        // grid-template-columns: 1fr 1fr 0.7fr;
        padding: 4px 0;
        border-bottom: 1px solid #444;
        cursor: pointer;
        // overflow-y: auto;

        &:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .frame-id {
          font-weight: bold;
        }

        .total {
          text-align: left;
        }

        .json-view {
          height: 200px;
          font-family: monospace;
          font-size: 0.8rem;
          background: #1113;
          padding: 0.5rem;
          border-radius: 4px;
          overflow: auto;
        }

      }
    }
  }

}


/* Plugins */
.plugins-tab {
  height: auto;
  overflow: auto;
}


/* Sparkline */
.sparkline-tab {
  height: auto;
  overflow-y: auto;

  .sparkline {
    width: 100px;
    height: 40px;
    background-color: #d2a2a2;
    margin-bottom: 12px;

    .sparkline-line {
      fill: red;
      stroke: #4fc3f7;
      stroke-width: 2;
    }
  }

}

```

#### 4-9. udel-devtools.service.ts
```ts
// src/ulde/devtools/ulde-devtools.service.ts

import { computed, Injectable, signal, Signal } from '@angular/core';
import { ULDEDevtoolsSnapshot, ULDEExecutionContext, ULDEHeatmapCell, ULDEPluginKind, ULDEPluginStatistics, ULDETimelinePoint, ULDETrendSnapshot } from '@ulde/types';
import { ULDEDiagnostic } from '@ulde/types/diagnostics';
import { ULDEFrame } from '@ulde/types/frame';
import { ULDELifecyclePhase, ULDELifecyclePhaseTiming } from '@ulde/types/lifecycle';
import { ULDEPluginTiming } from '@ulde/types/timing';

@Injectable({ providedIn: 'root' })
export class ULDEDevtoolsService {

  // devtools visibility + controls
  $visible = signal(true);
  $pinned = signal(false);
  $opacity = signal(1);

  // Lifecycle state
  $lifecyclePhaseTimings = signal<ULDELifecyclePhaseTiming[]>([]);
  $currentLifecyclePhaseTiming = signal<ULDELifecyclePhaseTiming | null>(null);

  // Plugin timings
  $pluginTimings = signal<ULDEPluginTiming[]>([]);

  // Frames
  $frameHistory = signal<ULDEFrame[]>([]);
  $currentFrame = signal<ULDEFrame | undefined>(undefined);
  // Diagnostics
  $diagnostics = signal<ULDEDiagnostic[]>([]);

  // Analytics
  $timeline = signal<ULDETimelinePoint[]>([]);
  $heatMap = signal<ULDEHeatmapCell[]>([]);

  // Thresholds (tweakable)
  thresholds = {
    phaseWarn: 8,
    phaseError: 16,
  };

  // signal to update computed signal
  // Derived: sparkline points
  $sparklinePoints = computed(() => {
    const history = this.$frameHistory();
    let points: string;

    if (!history.length) {
      points = ''
    } else {
      points = history
        .map((f, i) => {
          const total = f.lifecyclePhaseTimings.reduce((a, p) => a + p.duration, 0);
          return `${i * 10},${40 - Math.min(total, 40)}`;
        })
        .join(' ');
    }

    console.log(`Log: [ULDEDevtoolsService] sparklinePoints`, points);

    return points;
  });
  // Derived: filtered plugin timings by lifecycle phase
  $filteredPluginTimings = computed(() => {
    const lifecyclePhaseTiming = this.$currentLifecyclePhaseTiming();
    const timings = this.$pluginTimings();

    if (!lifecyclePhaseTiming) return timings;
    return timings.filter(t => t.lifecyclePhase === lifecyclePhaseTiming.lifecyclePhase);
  });

  $pluginStats = computed<ULDEPluginStatistics[]>(() => {
    const timings = this.$pluginTimings();

    // sort by pluginKind, then by pluginName
    const tempResult1 = [...timings].sort((a, b) => {
      const pluginKindResult = safeCompare(a.pluginKind, b.pluginKind);
      if (pluginKindResult !== 0) {
        return pluginKindResult;
      }
      return safeCompare(a.pluginName, b.pluginName);
    }).map(t => { return { key: `${t.pluginKind},${t.pluginName}`, duration: t.duration }; }
    );

    // source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/
    const max: Record<string, number[]> = Object.create(null);
    const statsByKey = tempResult1.reduce((acc: Record<string, ULDEPluginStatistics>, curr) => {

      if (!acc[curr.key]) {
        acc[curr.key] = {
          pluginName: curr.key.split(',')[1],
          pluginKind: curr.key.split(',')[0] as ULDEPluginKind,
          executions: 0,
          averageDuration: 0,
          maxDuration: 0,
          totalDuration: 0
        }
        max[curr.key] = [];
      }

      acc[curr.key].pluginName = acc[curr.key].pluginName;
      acc[curr.key].pluginKind = acc[curr.key].pluginKind;
      max[curr.key].push(curr.duration);
      acc[curr.key].executions = acc[curr.key].executions + 1;
      acc[curr.key].totalDuration = acc[curr.key].totalDuration + curr.duration;
      acc[curr.key].averageDuration = (acc[curr.key].executions !== 0) ? acc[curr.key].totalDuration / acc[curr.key].executions : 0;
      acc[curr.key].maxDuration = Math.max(...max[curr.key]);

      return acc;
    },

      Object.create(null)
    );

    return Object.entries(statsByKey).map(([k, v]) => {
      return v;
    })
  });

  $trendSnashot = computed<ULDETrendSnapshot>(() => {

    const pluginInfo = [...this.$pluginTimings()].filter(t => {
      return t.duration !== 0;
    }
    ).sort((a, b) => {
      return safeCompare(a.pluginName, b.pluginName);
    }).map(t => {
      return { pluginname: t.pluginName, duration: t.duration };
    }).reduce((acc: Record<string, { duration: number; executions: number, averageDuration: number }>, curr) => {

      if (!acc[curr.pluginname]) {
        acc[curr.pluginname] = {
          duration: 0,
          executions: 0,
          averageDuration: 0
        }
      }

      acc[curr.pluginname].duration = acc[curr.pluginname].duration + curr.duration;
      acc[curr.pluginname].executions = acc[curr.pluginname].executions + 1;
      acc[curr.pluginname].averageDuration = acc[curr.pluginname].executions !== 0 ? acc[curr.pluginname].duration / acc[curr.pluginname].executions : 0;

      return acc;
    },
      Object.create(null)
    );

    const { totalDurations, totalExecutions } = Object.entries(pluginInfo).map(([k, v]) => {
      return v;
    }).reduce((acc: { totalDurations: number; totalExecutions: number }, curr) => {
      const totalDurations = acc.totalDurations ?? 0;
      const totalExecutions = acc.totalExecutions ?? 0;

      acc.totalDurations = totalDurations + curr.duration;
      acc.totalExecutions = totalExecutions + curr.executions;

      return acc;
    },
      Object.create(null)
    );

    const averagePluginDuration = totalExecutions !== 0 ? totalDurations / totalExecutions : 0;

    const slowestPlugin = Object.entries(pluginInfo).map(([k, v]) => {
      return { pluginName: k, averageDuration: v.averageDuration };
    }).sort((a, b) => {
      return b.averageDuration - a.averageDuration;
    })[0];

    const frameInfo = [...this.$frameHistory()].map(f => {
      return {
        id: f.id, frameDuration: f.lifecyclePhaseTimings.map(t => t.duration).reduce((acc, curr) => {
          acc = acc + curr;
          return acc;
        })
      };
    }, 0);

    const worstFrameDuration = [...frameInfo].sort((a, b) => {
      return b.frameDuration - a.frameDuration;
    }).flat()[0].frameDuration;

    const { totalFrameDurations, totalFrameExecutions } = [...frameInfo].reduce((acc: { totalFrameDurations: number, totalFrameExecutions: number }, curr) => {
      const totalDurations = acc.totalFrameDurations ?? 0;
      const totalExecutions = acc.totalFrameExecutions ?? 0;

      acc.totalFrameDurations = totalDurations + curr.frameDuration;
      acc.totalFrameExecutions = totalExecutions + 1;
      return acc;
    },
      Object.create(null)
    )

    const averageFrameDuration = totalFrameDurations !== 0 ? totalFrameDurations / totalFrameExecutions : 0;

    return {
      averageFrameDuration: averageFrameDuration,
      worstFrameDuration: worstFrameDuration,
      averagePluginDuration: averagePluginDuration,
      slowestPlugin: slowestPlugin,
      regressionDetected: false // TO BE CLARIFIED: MEANING
    };

  });




  $generateDevtoolsSnapshot(executionContext: ULDEExecutionContext): Signal<ULDEDevtoolsSnapshot> {

    executionContext.artifacts.diagnostics = this.$diagnostics();
    executionContext.artifacts.frame = this.$currentFrame();

    return computed(() => {
      return {
        executionContext: executionContext,
        frameHistory: this.$frameHistory(),
        analytics: {
          timeline: this.$timeline(),
          heatMap: this.$heatMap(),
          trends: this.$trendSnashot(),
          pluginStats: this.$pluginStats(),
        }
      }
    });
  }


  constructor() { }

  // Frame lifecycle
  startPhase(lifecyclePhase: ULDELifecyclePhase) {
    this.$currentLifecyclePhaseTiming.set({
      lifecyclePhase,
      startTime: performance.now(),
      endTime: 0,
      duration: 0,
    });
  }
  endPhase(lifecyclePhase: ULDELifecyclePhase) {
    const phase = this.$currentLifecyclePhaseTiming();
    if (!phase || phase.lifecyclePhase !== lifecyclePhase) return;

    const end = performance.now();
    const duration = end - phase.startTime;

    const updatedPhase: ULDELifecyclePhaseTiming = {
      ...phase,
      endTime: end,
      duration,
    };

    this.$lifecyclePhaseTimings.update(list => [...list, updatedPhase]);
    this.$currentLifecyclePhaseTiming.set(null);
  }
  finalizeFrame() {
    const frame: ULDEFrame = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      lifecyclePhaseTimings: this.$lifecyclePhaseTimings(),
      pluginTimings: this.$pluginTimings()
    };

    this.$frameHistory.update(list => [...list.slice(-50), frame]); // keep last 50 frames

    this.$heatMap.set(this.buildHeatmap());
    this.$timeline.set(this.buildTimeline());
    this.generateWarnings();
    this.$currentFrame.set(frame);

    // reset for next frame
    this.$lifecyclePhaseTimings.set([]);
    // this.$pluginTimings.set([]);
  }

  // Diagnostics
  addDiagnostic(diag: ULDEDiagnostic) {
    this.$diagnostics.update(list => [...list, diag]);
  }
  /**
   * Generate warnings based on patterns in frame history.
   */
  generateWarnings() {
    const frameHistory = this.$frameHistory();
    if (frameHistory.length < 3) return;

    const lastThree = frameHistory.slice(-3);
    const durations = lastThree.map(f =>
      f.lifecyclePhaseTimings.reduce((sum, p) => sum + p.duration, 0)
    );

    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const last = durations[durations.length - 1];

    // Sudden spike detection
    if (last > avg * 1.5) {
      this.addDiagnostic({
        level: 'warn',
        message: `Frame duration spike detected: ${last.toFixed(1)}ms (avg ${avg.toFixed(1)}ms)`
      });
    }

    // Consistent slowdown detection
    if (durations.every(d => d > avg)) {
      this.addDiagnostic({
        level: 'warn',
        message: `Consistent slowdown across last 3 frames`
      });
    }
  }

  // Analytics
  /**
   * Plugin timing recording
   * @param timing
   */
  recordPluginTiming(timing: ULDEPluginTiming) {
    this.$pluginTimings.update(list => [...list, timing]);
  }
  /**
     * Build a timeline of frames with total durations.
     */
  buildTimeline(): ULDETimelinePoint[] {
    return this.$frameHistory().map(frame => {
      const total = frame.lifecyclePhaseTimings.reduce((sum, p) => sum + p.duration, 0);

      return {
        frameId: frame.id,
        timeStamp: frame.timestamp,
        totalDuration: total,
        phases: frame.lifecyclePhaseTimings.map(p => ({
          lifecyclePhase: p.lifecyclePhase,
          duration: p.duration
        }))
      };
    });
  }
  /**
   * Generate a heatmap of plugin performance.
   * Normalizes plugin durations across all frames.
   */
  buildHeatmap(): ULDEHeatmapCell[] {
    const frameHistory = this.$frameHistory();
    const timings = frameHistory.flatMap(f => f.pluginTimings);

    if (!timings.length) return [];

    const max = Math.max(...timings.map(t => t.duration));

    return timings.map(t => ({
      pluginKind: t.pluginKind,
      pluginName: t.pluginName,
      hookName: t.hookName,
      lifecyclePhase: t.lifecyclePhase,
      intensity: t.duration / max // normalized 0–1
    }));
  }

  // UI - control methods
  toggle() {
    this.$visible.update(v => !v);
    console.log(`Log: [UldeDevtoolsService] toggle90 => $visible()=`, this.$visible());
  }
  pin() {
    this.$pinned.update(p => !p);
  }
  setOpacity(value: number) {
    this.$opacity.set(value);
  }

}

// Safe string comparison function
function safeCompare(a: string | null, b: string | null): number {
  const strA = a ?? ""; // Treat null/undefined as empty string
  const strB = b ?? "";
  return strA.localeCompare(strB, undefined, { sensitivity: "base" });
}

```


#### 4-10. udel-devtools.ts
```ts
// src/ulde/devtools/ulde-devtools.ts

import { DatePipe, DecimalPipe, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { ULDERendererState } from '@ulde/types';
import { ULDEDevToolsTab } from '@ulde/types/devtools';
import { ULDEDiagnostic } from '@ulde/types/diagnostics';
import { ULDEFrame } from '@ulde/types/frame';
import { ULDELifecyclePhaseTiming } from '@ulde/types/lifecycle';
import { UldeDevToolsDiagnosticsPanel, UldeDevtoolsFrameTimelinePanel, UldeDevtoolsPluginTimelinePanel, UldeDevtoolsRuntimeInspectorPanel, ULDEDevtoolsService } from '.';

@Component({
  selector: 'ulde-devtools',
  standalone: true,
  imports: [
    DecimalPipe, DatePipe, JsonPipe,
    UldeDevToolsDiagnosticsPanel,
    UldeDevtoolsFrameTimelinePanel,
    UldeDevtoolsRuntimeInspectorPanel,
    UldeDevtoolsPluginTimelinePanel,

  ],
  templateUrl: './ulde-devtools.html',
  styleUrl: './ulde-devtools.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ULDEDevtools {

  $rendererState = input<ULDERendererState>()

  $highlight = output<string>();

  // Declare signals
  $snapshot = computed(() => this.$rendererState()?.devtoolsSnapshot);
  $sparklinePoints!: typeof this.devtoolsService.$sparklinePoints;

  $visible!: typeof this.devtoolsService.$visible;
  $pinned!: typeof this.devtoolsService.$pinned;
  $opacity!: typeof this.devtoolsService.$opacity;

  thresholds!: typeof this.devtoolsService.thresholds;

  $activeTab = signal<ULDEDevToolsTab>('diagnostics');

  selectTab(tab: ULDEDevToolsTab) {
    this.$activeTab.set(tab);
  }

  constructor(
    private devtoolsService: ULDEDevtoolsService,
  ) {

    this.$sparklinePoints = devtoolsService.$sparklinePoints;

    this.$visible = devtoolsService.$visible;
    this.$pinned = devtoolsService.$pinned;
    this.$opacity = devtoolsService.$opacity;

    this.thresholds = devtoolsService.thresholds;

    // effect(() => {
    //   // for debug
    //   if (!this.$rendererState()) return;
    //   console.log(`Log: [UldeDevTools] effect() $rendererState:\n`, this.$rendererState());

    // })

  }

  // UI actions
  toggleDevTools() {
    this.devtoolsService.toggle();
  }

  pinDevTools() {
    this.devtoolsService.pin();
  }

  setDevToolsOpacity(value: number) {
    this.devtoolsService.setOpacity(value);
  }

  // Phase selection (for filtering plugin timings)
  selectPhase(phase: ULDELifecyclePhaseTiming) {
    this.devtoolsService.$currentLifecyclePhaseTiming.set(phase);
  }

  clearPhaseSelection() {
    this.devtoolsService.$currentLifecyclePhaseTiming.set(null);
  }

  // Frame selection (for timeline/sparkline)
  selectFrame(frame: ULDEFrame) {
    this.devtoolsService.$currentFrame.set(frame);
  }


  trackDiag(i: number, d: ULDEDiagnostic) {
    return `${d.level}-${d.message}-${i}`;
  }

  onHighlight(msg: string) {
    this.$highlight.emit(msg);
  }
}

```

### 5. src/ulde/engine/

#### 5-1. index.ts
```ts
// src/ulde/engine/index.ts

export * from "./ulde-ast-builder.engine";
export * from "./ulde-ast-renderer.engine";
export * from "./ulde-ast-visitor.engine";
export * from "./ulde-content.engine.service";
export * from "./ulde-interactive.engine.service";
export * from "./ulde-layout.engine.service";
export * from "./ulde-render-context-builder.engine.service";

```

#### 5-2. ulde-ast-builder.engine.ts
```ts
// src/ulde/engine/ulde-ast-builder.engine.ts

import Token from 'markdown-it/lib/token.mjs';
import { ULDEAstNode, ULDEExternalLinkNode } from '@ulde/types/context';

export function buildUldeAst(tokens: Token[]): ULDEAstNode[] {
  const root: ULDEAstNode[] = [];
  const stack: ULDEAstNode[][] = [root];

  const push = (node: ULDEAstNode) => {
    stack[stack.length - 1].push(node);
  };

  const open = (node: ULDEAstNode) => {
    push(node);
    stack.push(node.children = []);
  };

  const close = () => {
    stack.pop();
  };

  for (const t of tokens) {
    switch (t.type) {

      // Headings
      case 'heading_open':
        open({
          type: 'heading',
          depth: Number(t.tag.substring(1)),
        });
        break;

      case 'heading_close':
        close();
        break;

      // Paragraphs
      case 'paragraph_open':
        open({ type: 'paragraph' });
        break;

      case 'paragraph_close':
        close();
        break;

      // Lists
      case 'bullet_list_open':
        open({ type: 'list', ordered: false });
        break;

      case 'ordered_list_open':
        open({ type: 'list', ordered: true });
        break;

      case 'bullet_list_close':
      case 'ordered_list_close':
        close();
        break;

      case 'list_item_open':
        open({ type: 'listItem' });
        break;

      case 'list_item_close':
        close();
        break;

      // Blockquote
      case 'blockquote_open':
        open({ type: 'blockquote' });
        break;

      case 'blockquote_close':
        close();
        break;

      // Thematic break (horizontal rule)
      case 'hr':
        push({ type: 'thematicBreak' });
        break;

      // Images
      case 'image':
        push({
          type: 'image',
          src: t.attrGet('src') || '',
          alt: t.attrGet('alt') || undefined,
          title: t.attrGet('title') || undefined,
        });
        break;

      // Tables
      case 'table_open':
        open({ type: 'table' });
        break;

      case 'table_close':
        close();
        break;

      // case 'thead_open':
      // case 'tbody_open':
      //   // treat as section-like containers if needed
      //   open({ type: 'section', id: t.type });
      //   open({ type: 'section', id: t.type });
      //   break;

      // case 'thead_close':
      // case 'tbody_close':
      //   close();
      //   break;

      case 'tr_open':
        open({ type: 'tableRow' });
        break;

      case 'tr_close':
        close();
        break;

      case 'th_open':
      case 'td_open':
        open({ type: 'tableCell' });
        break;

      case 'th_close':
      case 'td_close':
        close();
        break;

      // // table -revised

      // case 'table':
      //   for (const child of t.children ||[]){

      //   }
      //   break;

      // Code blocks (fence)
      case 'fence':
        push({
          type: 'code',
          lang: t.info || undefined,
          value: t.content,
        });
        break;

      // Inline tokens
      case 'inline':

        for (const child of t.children || []) {

          switch (child.type) {
            case 'text': {

              const value =
                child.content.replace(
                  /^external:/,
                  ''
                );

              push({
                type: 'text',
                value
              });

              console.log(`Log: [buildUldeAst] inline -> text type \nvalue=`, value);

              // push({ type: 'text', value: child.content });

              break;
            }

            case 'html_inline':
              // reserved for future ULDEHtmlNode
              break;

            case 'strong_open':
              open({ type: 'strong' });
              break;

            case 'strong_close':
              close();
              break;

            case 'em_open':
              open({ type: 'emphasis' });
              break;

            case 'em_close':
              close();
              break;

            case 'link_open': {

              const href = child.attrGet('href') || '';
              const title = child.attrGet('title') || '';

              if (isExternalLink(t)) {

                open({
                  type: 'externalLink',
                  href,
                  title
                })

              } else {

                open({
                  type: 'internalLink',
                  href,
                  title
                });

              }

              break;
            }

            case 'link_close':
              close();
              break;

            case 'code_inline':
              push({
                type: 'inlineCode',
                value: child.content,
              });
              break;

            case 'softbreak':
            case 'hardbreak':
              push({ type: 'break' });
              break;
          }
        }
        break;

      // Default: ignore or log
      default:
        // you can optionally push a meta node for unknown tokens
        push({ type: 'meta', meta: { tokenType: t.type } });
        break;
    }
  }

  return root;
}

// helper for external link
function isExternalLink(
  inlineToken: Token
): boolean {

  return (
    inlineToken.children?.some(
      child =>
        child.type === 'text' &&
        child.content.startsWith(
          'external:'
        )
    ) ?? false
  );
}


//-----------------------------------------
// NOTE:
// If addinng custom tokens (for frontmatter, demos, ULDE blocks) later, can extend this switch with those types and map them to ULDEFrontmatterNode, ULDEDemoNode, ULDEUldeBlockNode, etc.
//-------------------------------------

```

#### 5-3. ulde-ast-renderer.engine.ts
```ts
// src/ulde/engine/ulde-ast-renderer.engine.ts

import { ULDEAstNode } from '@ulde/types/context';

export function renderUldeAstToHtml(nodes: ULDEAstNode[]): string {
  const buf: string[] = [];

  const renderNode = (node: ULDEAstNode) => {
    switch (node.type) {

      // ---------------------------------------------------------
      // Block nodes
      // ---------------------------------------------------------
      case 'heading': {

        buf.push(`<h${node.depth}>`);
        node.children?.forEach(renderNode);
        buf.push(`</h${node.depth}>`);
        break;
      }

      case 'paragraph': {
        buf.push('<p>');
        node.children?.forEach(renderNode);
        buf.push('</p>');
        break;
      }

      case 'blockquote': {
        buf.push('<blockquote>');
        node.children?.forEach(renderNode);
        buf.push('</blockquote>');
        break;
      }

      case 'list': {
        const ordered = node.ordered === true;
        buf.push(ordered ? '<ol>' : '<ul>');
        node.children?.forEach(renderNode);
        buf.push(ordered ? '</ol>' : '</ul>');
        break;
      }

      case 'listItem': {
        buf.push('<li>');
        node.children?.forEach(renderNode);
        buf.push('</li>');
        break;
      }

      case 'thematicBreak': {
        buf.push('<hr />');
        break;
      }

      // ---------------------------------------------------------
      // Inline nodes
      // ---------------------------------------------------------
      case 'text': {
        buf.push(escapeHtml(node.value ?? ''));
        break;
      }

      case 'strong': {
        buf.push('<strong>');
        node.children?.forEach(renderNode);
        buf.push('</strong>');
        break;
      }

      case 'emphasis': {
        buf.push('<em>');
        node.children?.forEach(renderNode);
        buf.push('</em>');
        break;
      }

      case 'inlineCode': {
        buf.push('<code>');
        buf.push(escapeHtml(node.value ?? ''));
        buf.push('</code>');
        break;
      }

      case 'break': {
        buf.push('<br />');
        break;
      }

      case 'internalLink': {

        const href = escapeHtml(node.href ?? '');

        const title = node.title
          ? ` title="${escapeHtml(node.title)}"`
          : '';

        buf.push(`<a href="${href}"${title}>`);

        node.children?.forEach(renderNode);

        buf.push('</a>');

        break;
      }

      case 'externalLink': {

        const href =
          escapeHtml(node.href);

        const title =
          node.title
            ? ` title="${escapeHtml(node.title)}"`
            : ` title="External Site (opens in a new tab)"`;

        buf.push(
          `<a href="${href}"
       target="_blank"
       rel="noopener noreferrer"
       ${title}>`
        );

        node.children?.forEach(
          renderNode
        );

        buf.push(`</a>`);

        break;
      }

      // case 'externalLink': {
      //   // console.log(`Log: [AstRenderer] externalLink \nnode=`, node);

      //   const href = escapeHtml(node.href);
      //   const title = node.title
      //     ? ` title="${escapeHtml(node.title)}"`
      //     : ` title="External Sit On New Tab"`;

      //   // force new tab
      //   const target = ' target="_blank"';
      //   // const target = node.target
      //   //   ? ` target="${escapeHtml(node.target)}"`
      //   //   : ' target="_blank"';

      //   // for the security to force "nonopener nonreferrer"'
      //   const rel = ' rel="noopener noreferrer"';
      //   // const rel = node.rel
      //   //   ? ` rel="${escapeHtml(node.rel)}"`
      //   //   : ' rel="nonopener nonreferrer"'

      //   buf.push(`<a href="${href}"${title}${target}${rel}>`);
      //   node.children?.forEach(renderNode);
      //   // buf.push(escapeHtml(node.text));
      //   buf.push(`</a>`);

      //   break;
      // }

      case 'image': {
        const src = escapeHtml(node.src ?? '');
        const alt = escapeHtml(node.alt ?? '');
        const title = node.title
          ? ` title="${escapeHtml(node.title)}"`
          : '';
        buf.push(`<img src="${src}" alt="${alt}"${title} />`);
        break;
      }

      // ---------------------------------------------------------
      // Code & math
      // ---------------------------------------------------------
      case 'code': {
        const langClass = node.lang ? ` class="language-${escapeHtml(node.lang)}"` : '';
        buf.push(`<pre><code${langClass}>`);
        buf.push(escapeHtml(node.value ?? ''));
        buf.push('</code></pre>');
        break;
      }

      case 'math': {
        buf.push(`<div class="ulde-math">`);
        buf.push(escapeHtml(node.value ?? ''));
        buf.push('</div>');
        break;
      }

      case 'inlineMath': {
        buf.push(`<span class="ulde-math-inline">`);
        buf.push(escapeHtml(node.value ?? ''));
        buf.push('</span>');
        break;
      }

      // ---------------------------------------------------------
      // ULDE custom nodes (minimal handling)
      // ---------------------------------------------------------
      case 'admonition': {
        const kind = node.kind ?? 'info';
        const title = node.title ?? '';
        buf.push(`<div class="ulde-admonition ulde-admonition-${escapeHtml(kind)}">`);
        if (title) {
          buf.push(`<div class="ulde-admonition-title">${escapeHtml(title)}</div>`);
        }
        buf.push('<div class="ulde-admonition-body">');
        node.children?.forEach(renderNode);
        buf.push('</div></div>');
        break;
      }

      case 'uldeBlock': {
        const name = node.name ?? 'block';
        buf.push(`<div class="ulde-block ulde-block-${escapeHtml(name)}">`);
        node.children?.forEach(renderNode);
        buf.push('</div>');
        break;
      }

      case 'demo': {
        const id = node.id ?? '';
        buf.push(`
          <div class="ulde-demo"
          data-demo-id="${escapeHtml(id)}"
          data-demo-code="${escapeHtml(node.code)}">
          <pre>${escapeHtml(node.code)}</pre>
          `);
        // buf.push(`
        //   <div class="ulde-demo" data-demo-id="${escapeHtml(id)}">
        //   `);
        node.children?.forEach(renderNode);
        buf.push('</div>');
        break;
      }

      case 'toc': {
        buf.push('<div class="ulde-toc"></div>');
        break;
      }

      case 'anchor': {
        const id = node.id ?? '';
        buf.push(`<a id="${escapeHtml(id)}" data-ulde-anchor="${escapeHtml(id)}"></a>`);

        // console.log(`Log: [ulde-ast-renderer.engine.ts renderUldeAstToHtml()]  \nnode type=anchor`, id);
        // buf.push(`<a id="${escapeHtml(id)}"></a>`);
        break;
      }

      case 'section': {
        buf.push('<section>');
        node.children?.forEach(renderNode);
        buf.push('</section>');
        break;
      }

      case 'diagnostic': {
        const level = node.level ?? 'info';
        const message = escapeHtml(node.message ?? '');
        const phase = node.lifecyclePhase;
        const plugin = node.pluginName;

        buf.push(`<div class="ulde-diagnostic ulde-diagnostic-${level}">`);
        buf.push(`<strong>${level.toUpperCase()}</strong>: ${message}`);

        if (phase) {
          buf.push(`<span class="meta"> (phase: ${escapeHtml(phase)})</span>`);
        }

        if (plugin) {
          buf.push(`<span class="meta"> (plugin: ${escapeHtml(plugin)})</span>`);
        }

        buf.push(`</div>`);
        break;
      }

      case 'table': {
        buf.push('<table class="markdown-table">')
        node.children?.forEach(renderNode);
        buf.push('</table>')
        break;
      }

      case 'tableRow': {
        buf.push('<tr>')
        node.children?.forEach(renderNode);
        buf.push('</tr>')
        break;
      }

      case 'tableCell': {
        buf.push('<td>')
        node.children?.forEach(renderNode);
        buf.push('</td>')
        break;
      }

      // ---------------------------------------------------------
      // Fallback: render children only
      // ---------------------------------------------------------
      default: {
        node.children?.forEach(renderNode);
        break;
      }
    }
  };

  nodes.forEach(renderNode);


  // return buf.join('');

  const html = buf.join('');

  return html;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

```

#### 5-4. ulde-ast-visitor.engine.ts
```ts
// src/ulde/engine/ulde-ast-visitor.engine.ts

import { ULDEAstNode } from '@ulde/types/context';

export type ULDEAstVisitorFn = (
  node: ULDEAstNode,
  parent: ULDEAstNode | null
) => void | ULDEAstNode | null;

export interface ULDEAstVisitorOptions {
  pre?: ULDEAstVisitorFn;
  post?: ULDEAstVisitorFn;
}

/**
 * ULDE AST Visitor
 * Walks the AST tree and allows mutation, replacement, or removal of nodes.
 */
export function visitUldeAst(
  nodes: ULDEAstNode[],
  options: ULDEAstVisitorOptions
): ULDEAstNode[] {

  const { pre, post } = options;

  const walk = (node: ULDEAstNode, parent: ULDEAstNode | null): ULDEAstNode | null => {

    // PRE-VISIT (before children)
    if (pre) {
      const result = pre(node, parent);

      if (result === null) {
        return null; // remove node
      }

      if (result && result !== node) {
        node = result; // replace node
      }
    }

    // Visit children
    if (node.children && node.children.length > 0) {
      const newChildren: ULDEAstNode[] = [];

      for (const child of node.children) {
        const visited = walk(child, node);
        if (visited !== null) {
          newChildren.push(visited);
        }
      }

      node.children = newChildren;
    }

    // POST-VISIT (after children)
    if (post) {
      const result = post(node, parent);

      if (result === null) {
        return null; // remove node
      }

      if (result && result !== node) {
        node = result; // replace node
      }
    }

    return node;
  };

  // Walk root array
  const result: ULDEAstNode[] = [];

  for (const node of nodes) {
    const visited = walk(node, null);
    if (visited !== null) {
      result.push(visited);
    }
  }

  return result;
}

```

#### 5-5. ulde-content.engine.service.ts
```ts
// src/ulde/engine/ulde-content.engine.service.ts

import { inject, Injectable } from '@angular/core';

import { navigate } from '../../app/global.utils/global.utils';
import { Router } from '@angular/router';


import MarkdownIt from 'markdown-it';

import Token from 'markdown-it/lib/token.mjs';


@Injectable({
  providedIn: 'root',
})
export class ContentEngineService {

  title = "ContentEngineService";

  async load(pageId: string): Promise<string | undefined> {
    /* existing loader */


    const url = `assets/${pageId}.md`;

    try {
      const response = await fetch(url);

      if (response.redirected) {
        const router = inject(Router);
        navigate(router, ['PageNotFound']);
        throw new Error(`Invalid URL: ${url}`);
      }

      const raw = await response.text();

      // console.log(`Log: ${this.title} load \npageId=`, pageId, `\nmarkdwon raw=\n`, raw);

      return raw;

    } catch (err) {
      console.error(`${this.title} load() pageId=${pageId} error:`, err);
      return undefined;
    }

  }
  async transform(raw: string): Promise<Token[]> {
    /* existing parser */

    const md = new MarkdownIt({
      html: true
    });
    // const md = new MarkdownIt();
    const tokens = md.parse(raw, {});

    // console.log(`Log: [${this.title}] tokens=\n`, tokens);

    return tokens;

  }
}

```

#### 5-6. ulde-interactive.engine.service.ts
```ts
// src/ulde/engine/ulde-interactive.engine.service.ts

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class InteractiveEngineService {

  hydrate(pageId: string) {
    // find demo placeholders, bootstrap Angular components, etc.
  }

}

```

#### 5-7. ulde-layout.engine.service.ts
```ts
// src/ulde/engine/ulde-layout.engine.service.ts

import { Injectable } from '@angular/core';
import { ULDEAstNode, ULDESectionNode, ULDEHeadingNode } from '@ulde/types/context';

@Injectable({ providedIn: 'root' })
export class ULDELayoutEngineService {

  buildSections(ast: ULDEAstNode[]): ULDEAstNode[] {
    const result: ULDEAstNode[] = [];
    let currentSection: ULDESectionNode | null = null;

    for (const node of ast) {
      if (node.type === 'heading') {
        // start a new section
        const section: ULDESectionNode = {
          type: 'section',
          id: slugify(collectHeadingText(node)),
          depth: (node as ULDEHeadingNode).depth,
          children: [node]
        };

        result.push(section);
        currentSection = section;
      } else if (currentSection) {
        // attach node to current section
        currentSection.children!.push(node);
      } else {
        // content before first heading stays at root
        result.push(node);
      }
    }

    return result;
  }
}

function collectHeadingText(node: ULDEAstNode): string {
  return (node.children || [])
    .filter(c => c.type === 'text')
    .map(c => c.value ?? '')
    .join('');
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

```


#### 5-8. ulde-render-context-builder.engine.service.ts
```ts
// src/ulde/engine/ulde-render-context-builder.engine.service.ts

import { Injectable } from '@angular/core';
import { ULDEExecutionContext } from '@ulde/types/context';
import { buildUldeAst } from './ulde-ast-builder.engine';
import { renderUldeAstToHtml } from './ulde-ast-renderer.engine';
import { ULDELayoutEngineService } from './ulde-layout.engine.service';

import { ULDEDevtoolsService } from '../devtools';


@Injectable({ providedIn: 'root' })
export class ULDERenderContextBuilderService {


  constructor(
    private layoutEngine: ULDELayoutEngineService,
    private devtoolsService: ULDEDevtoolsService,
  ) { }

  /**
    * Build the initial AST from page tokens.
    * This is called before the render phase plugins.
    */
  buildInitialAst(executionCtx: ULDEExecutionContext) {
    const page = executionCtx.page;
    const ast = buildUldeAst(page.source.tokens);

    // console.log(`Log: [ULDERenderContextBuilderService - buildInitialAst]\ntokens=`, page.source.tokens, `\nast=`, ast);

    return ast;
  }


  /**
     * Build the final render context AFTER layout plugins have
     * mutated the AST (sections, anchors, TOC, etc.).
     *
     * This is called AFTER the 'render' lifecycle phase.
     */


  buildFinalContext(executionCtx: ULDEExecutionContext) {
    // 1. Layout: sections (now that plugins have mutated AST)
    if (!executionCtx.render) return;
    const ast = executionCtx.render.ast;
    if (!ast) return;
    const sectionAst = this.layoutEngine.buildSections(ast);

    
    const diagnostics = this.devtoolsService.$diagnostics();
  
    const finalAst = sectionAst;

    // 3. Render HTML from final AST
    const html = renderUldeAstToHtml(finalAst);

    // 4. Assemble

    executionCtx.render.ast = finalAst;
    executionCtx.render.html = html;
    executionCtx.render.layout = {
      id: 'technical-docs',
      type: 'book'
    };
    executionCtx.artifacts.diagnostics = diagnostics;

    const currentFrame = this.devtoolsService.$currentFrame() ?? undefined;
    executionCtx.artifacts.frame = currentFrame;
  }

}

}


```

### 6. src/ulde/plugins/

#### 6-1. adaptors/ // Depricated

##### 6-1-1. index.ts ***DELETED***
```ts
// src/ulde/plugins/adaptors/index.ts

export * from './ulde-plugin-hook-adaptor';

```

##### 6-1-2. ulde-plugin-hook-adaptor.ts  ***DELETED***
```ts
// src/ulde/plugins/adaptors/ulde-plugin-hook-adaptor.ts

import { ULDEPluginInstance, ULDEPluginKind, ULDEPlugin } from "@ulde/types";

export class ULDEPluginHookAdapter implements ULDEPluginInstance {
  pluginKind: ULDEPluginKind;
  pluginName: string;
  enabled?: boolean;

  constructor(private legacy: ULDEPlugin) {
    this.pluginKind = legacy.pluginKind;
    this.pluginName = legacy.pluginName;
    this.enabled = legacy.enabled;
  }

  async run(ctx: any) {
    const phase = ctx.lifecyclePhase;

    switch (phase) {
      case 'init':
        return this.legacy.hooks.onInit?.();
      case 'load':
        return this.legacy.hooks.onPageLoad?.(ctx);
      case 'render':
        return this.legacy.hooks.onBeforeRender?.(ctx);
      case 'hydrate':
        return this.legacy.hooks.onAfterRender?.(ctx);
      case 'afterRender':
        return this.legacy.hooks.onDestroy?.();
    }
  }

  async destroy() {
    return this.legacy.hooks.onDestroy?.();
  }
}

```

#### 6-2. contributor/

Maybe for the future

#### 6-3. registry/

##### 6-3-1. index.ts
```ts
// src/ulde/plugins/registry/index.ts

export * from './ulde-plugin-registry';

```

##### 6-3-2. ulde-plugin-registry.ts
```ts
// src/ulde/plugins/registry/ulde-plugin-registry.ts

import {
  ULDECodeblockPlugin, ULDEFrontmatterNormalizerPlugin
} from '@ulde/plugins/system/content';

import {
  ULDEDemoPlugin, ULDEPlaygroundInjectorPlugin
} from '@ulde/plugins/system/demo';

import { ULDEDummyTestPlugin, UldeMermaidPlugin, UldeKatexPlugin } from '@ulde/plugins/system/interactive';

import {
  ULDEAnchorPlugin, ULDETocPlugin
} from '@ulde/plugins/system/layout';

import {
  ULDENavigationBreadcrumbsPlugin, UldeInternalLinkPlugin,
  ULDEExternalLinkPlugin
} from '@ulde/plugins/system/navigation';

import {
  ULDEOverlayCustomPanelPlugin, ULDESlowPluginDetectorPlugin, ULDETimelineProfilerPlugin
} from '@ulde/plugins/system/ulde';

import { ULDEPluginRegistryMap } from '@ulde/types/plugin';



/** ULDE Plugin Registry (factory-based)
 * Phase‑aware, deterministic ULDE plugin registry.
 * This is the single source of truth for plugin ordering.
 */
export const ULDE_PLUGIN_REGISTRY: ULDEPluginRegistryMap = {
  // Reserved for future init‑only plugins
  init: [],

  // Content + navigation: operate on page context / tokens / early AST
  load: [
    () => new ULDEExternalLinkPlugin(),
    () => new ULDEFrontmatterNormalizerPlugin(),
    () => new ULDECodeblockPlugin(),
    () => new ULDEDemoPlugin(),
    () => new ULDEDummyTestPlugin(),
    () => new ULDENavigationBreadcrumbsPlugin(),
  ],

  // Layout: operate on AST structure (sections, anchors, TOC)
  render: [
    () => new ULDEAnchorPlugin(),
    () => new ULDETocPlugin(),
  ],

  // Interactive: operate on rendered HTML / DOM
  hydrate: [
    () => new UldeInternalLinkPlugin(),
    () => new ULDEPlaygroundInjectorPlugin(),
    () => new UldeMermaidPlugin(),
    () => new UldeKatexPlugin(),
  ],

  // ULDE system: diagnostics, overlay, performance analysis
  afterRender: [

    // () => new UldeMermaidPlugin(),
    () => new ULDEOverlayCustomPanelPlugin(),
    () => new ULDETimelineProfilerPlugin(),
    () => new ULDESlowPluginDetectorPlugin(),

  ],
};

```

#### 6-4. system/

##### 6-4-1. content/

###### 6-4-1-1. index.ts
```ts
// src/ulde/plugins/system/content/index.ts

export * from "./ulde-codeblock.plugin";
export * from "./ulde-frontmatter-normalizer.plugin";

```

###### 6-4-1-2. ulde-codeblock.plugin.ts
```ts
// src/ulde/plugins/system/content/ulde-codeblock.plugin.ts

import { ULDEExecutionContext } from "@ulde/types";
import {ULDEPluginInstance, ULDEPluginKind } from "@ulde/types/plugin";

export class ULDECodeblockPlugin implements ULDEPluginInstance {
  pluginKind: ULDEPluginKind = 'content';
  pluginName = "CodeblockEnhancer";
  description = "Markdown Code Block Enhancer: Enhances fenced code blocks with metadata";
  enabled = true;

  async run(ctx: ULDEExecutionContext) {
    if (ctx.lifecyclePhase !== 'load') return;
    if (ctx.page.source.raw === undefined) return;


    console.log('Log: [ULDECodeblockPlugin] run');

    ctx.page.source.raw = ctx.page.source.raw.replace(/```(\w+)/g, ((m: any, lang: any) => {
      return `\`\`\`${lang} data-lang="${lang}"`;
    }));

    console.log('Log: [ULDECodeblockPlugin] finished');
  }

}

```

###### 6-4-1-3. ulde-frontmatter-normalizer.plugin.ts
```ts
// src/ulde/plugins/system/content/ulde-frontmatter-normalizer.plugin.ts

import { ULDEExecutionContext } from '@ulde/types';
import { ULDEPluginInstance, ULDEPluginKind } from '@ulde/types/plugin';

export class ULDEFrontmatterNormalizerPlugin implements ULDEPluginInstance {
  pluginKind: ULDEPluginKind = 'content';
  pluginName = "ULDEFrontmatterNormalizerPlugin";
  description = "Normalizes frontmatter fields";
  enabled = true;
  async run(ctx: ULDEExecutionContext) {

    if (ctx.lifecyclePhase !== 'load') return;

    console.log('Log: [ULDEFrontmatterNormalizerPlugin] run');

    // How and what to be Coded???
    // ctx.meta['title'] ??= "Untitled";
    // ctx.meta['tags'] ??= [];
    // ctx.meta['updated'] ??= new Date().toISOString();


    const frontmatter = { title: "Untitled", 'tags': [], updated: new Date().toISOString() };

    ctx.artifacts.pluginData['frontmatter'] = frontmatter;

    console.log('Log: [ULDEFrontmatterNormalizerPlugin] finished');


  }
}


```

##### 6-4-2. demo/

###### 6-4-2-1. index.ts
```ts
// src/ulde/plugins/system/demo/index.ts

export * from "./ulde-demo.plugin";
export * from "./ulde-playground-injector.plugin";

```

###### 6-4-2-2. ulde-demo.plugin.ts
```ts
// src/ulde/plugins/system/demo/ulde-demo.plugin.ts

import { ULDEPluginInstance, ULDEPluginKind } from '@ulde/types/plugin';
import { visitUldeAst } from '@ulde/engine';
import { ULDEExecutionContext } from '@ulde/types';

export class ULDEDemoPlugin implements ULDEPluginInstance {
  pluginKind: ULDEPluginKind = 'demo';
  pluginName = 'demo-block';
  description = 'Convert fenced code blocks with demo info into ULDE demo nodes.';
  enabled = true;
  async run(ctx: ULDEExecutionContext) {

    if (ctx.lifecyclePhase !== 'load') return;
    if (!ctx.render) return;

    visitUldeAst(ctx.render.ast, {
      pre(node) {
        if (node.type === 'code' && node.lang?.startsWith('demo')) {
          const parts = node.lang.split(/\s+/);
          const idPart = parts.find(p => p.startsWith('id='));
          const id = idPart ? idPart.split('=')[1] : 'demo';

          return {
            type: 'demo',
            id: id,
            code: node.value,
            language: 'javascript',
            children: []
          };
        } else {
          return undefined;
        }

      }
    });
  }
}

```

###### 6-4-2-3. ulde-playground-injector.plugin.ts
```ts
// src/ulde/plugins/system/demo/ulde-playground-injector.plugin.ts

import { ULDEPluginInstance, ULDEPluginKind } from "@ulde/types/plugin";

import { createComponent, EnvironmentInjector } from "@angular/core";
import { Example01 } from "../../../../app/demo/example01/example01"; // TBD
import { ULDEExecutionContext } from "@ulde/types";

export class ULDEPlaygroundInjectorPlugin implements ULDEPluginInstance {
  pluginKind: ULDEPluginKind = 'demo';
  pluginName = "ULDEPlaygroundInjectorPlugin";
  description = "Hydrates <demo-playground> blocks into live Angular components";
  enabled = true;
  async run(ctx: ULDEExecutionContext) {

    if (ctx.lifecyclePhase !== 'hydrate') return;
    if (!ctx.render) return;

    const placeholders = document.querySelectorAll("demo-playground");
    // You must provide the Angular environment injector
    const injector = (window as any).ngEnvironment as EnvironmentInjector;

    for (const el of placeholders) {
      const cmpRef = createComponent(Example01, {
        hostElement: el,
        environmentInjector: injector
      });

      cmpRef.changeDetectorRef.detectChanges();
    }
  }
}


```

##### 6-4-3. interactive/

###### 6-4-3-1. index.ts
```ts
// src/ulde/plugins/system/interactive/index.ts

export * from "./ulde-dummy-test.plugin";
export * from "./ulde-katex.plugin";
export * from "./ulde-mermaid.plugin";

```

###### 6-4-3-2. ulde-dummy-test.plugin.ts
```ts
// src/ulde/plugins/system/interactive/ulde-dummy-test.plugin.ts

import { ULDEExecutionContext } from '@ulde/types/context';
import { ULDEPluginInstance, ULDEPluginKind } from '@ulde/types/plugin';

export class ULDEDummyTestPlugin implements ULDEPluginInstance {
  pluginKind: ULDEPluginKind = 'content';
  pluginName = 'ULDEDummyTestPlugin';
  version = '0.0.1';
  description = 'create dummy test plugin';
  enabled = true;
  async run(ctx: ULDEExecutionContext) {
    if (ctx.lifecyclePhase !== 'load') return;
    if (!ctx.artifacts) return;

    const { artifacts } = ctx;

    /**
     * To be coded
     */


  };

}

```

###### 6-4-3-3. ulde-katex.plugin.ts
```ts
// ulde/plugins/interactive/ulde-katex.plugin.ts

import { ULDEPluginInstance, ULDEPluginKind } from "@ulde/types/plugin";

import { ULDEExecutionContext } from "@ulde/types";
import { isBrowser } from "../../../../app/global.utils/global.utils";

import renderMathInElement from 'katex/contrib/auto-render';


export class UldeKatexPlugin implements ULDEPluginInstance {
  pluginKind: ULDEPluginKind = 'interactive';
  pluginName = "UldeKatexPlugin";
  description = "render Latex";
  enabled = true;

  async run(ctx: ULDEExecutionContext): Promise<void> {

    if (!isBrowser()) return;

    console.log(`Log: [UldeKatexPlugin] run() Start`);

    const { diagnostics } = ctx.artifacts;

    const container = document.querySelector<HTMLElement>('.markdown-host');

    if (!container) {
      diagnostics.push({
        level: "error",
        lifecyclePhase: ctx.lifecyclePhase,
        message: `selector class='markdown-host' not found`,
        pluginKind: this.pluginKind,
        pluginName: this.pluginName
      });
      return;
    }

    requestAnimationFrame(() => {
      renderMathInElement(container, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\begin{equation}", right: "\\end{equation}", display: true },
          { left: "\\begin{align}", right: "\\end{align}", display: true },
          { left: "\\begin{alignat}", right: "\\end{alignat}", display: true },
          { left: "\\begin{gather}", right: "\\end{gather}", display: true },
          { left: "\\begin{CD}", right: "\\end{CD}", display: true },
          { left: "\\[", right: "\\]", display: true }
        ],
        errorCallback: (err) => {
          diagnostics.push({
            level: "error",
            lifecyclePhase: ctx.lifecyclePhase,
            message: `Error in renderMathInElement, ${JSON.stringify(err)}`,
            pluginKind: this.pluginKind,
            pluginName: this.pluginName
          });

          // console.error('Error in katex-render.service renderMathInElement', JSON.stringify(`${err}`));
        },
        throwOnError: false,
        errorColor: "#ff0000",
        output: "mathml",
      });
    });

    console.log(`Log: [UldeKatexPlugin] run() Finish`);


  }
}

```

###### 6-4-3-4. ulde-mermaid.plugin.ts
```ts
// ulde/plugins/interactive/ulde-mermaid.plugin.ts

import { ULDEPluginInstance, ULDEPluginKind } from "@ulde/types/plugin";

import { ULDEExecutionContext } from "@ulde/types";
import { isBrowser } from "../../../../app/global.utils/global.utils";

import mermaid from 'mermaid';
import type { MermaidConfig } from 'mermaid';
import Panzoom from '@panzoom/panzoom'
import { readSessionState } from '@ulde/configurator';


/* ---------------------------------------------------------
   Mermaid Theme Configs
--------------------------------------------------------- */

const mermaidConfigDarkTheme: MermaidConfig = {
  startOnLoad: false,
  securityLevel: 'strict',
  theme: 'dark',
  themeVariables: {
    fontSize: '18px',
    fontFamily: 'Trebuchet MS, Verdana, Arial, Sans-Serif',
    primaryColor: '#2d3748',
    primaryTextColor: '#e2e8f0',
    primaryBorderColor: '#63b3ed',
    secondaryColor: '#4a5568',
    tertiaryColor: '#2c5282',
    lineColor: '#63b3ed',
    nodeTextSize: '20px',
    edgeLabelFontSize: '14px',
    labelTextSize: '16px',
    background: '#1e1e1e',
    clusterBkg: '#2d3748',
    clusterBorder: '#63b3ed'
  },
  flowchart: { htmlLabels: true, curve: 'linear' },
  state: { radius: 10 },
  sequence: { noteFontSize: '20px' }
};

const mermaidConfigLightTheme: MermaidConfig = {
  startOnLoad: false,
  securityLevel: 'strict',
  theme: 'default',
  themeVariables: {
    fontSize: '16px',
    fontFamily: 'Trebuchet MS, Verdana, Arial, Sans-Serif',
    primaryColor: '#f0f9ff',
    primaryTextColor: '#1a202c',
    primaryBorderColor: '#3182ce',
    secondaryColor: '#bee3f8',
    tertiaryColor: '#90cdf4',
    lineColor: '#3182ce',
    nodeTextSize: '18px',
    edgeLabelFontSize: '14px',
    labelTextSize: '16px',
    background: '#ffffff',
    clusterBkg: '#edf2f7',
    clusterBorder: '#3182ce'
  },
  flowchart: { htmlLabels: true, curve: 'basis' }
};

/* ---------------------------------------------------------
   Panzoom Handler Storage
--------------------------------------------------------- */

let zoomInHandlers: Array<{ button: HTMLButtonElement; handler: (e: Event) => void }> = [];
let zoomOutHandlers: Array<{ button: HTMLButtonElement; handler: (e: Event) => void }> = [];
let resetHandlers: Array<{ button: HTMLButtonElement; handler: (e: Event) => void }> = [];

let handleEventError: (e: any) => void;
let handleEventUnhandle: (e: any) => void;
let counter: number = 0;

export class UldeMermaidPlugin implements ULDEPluginInstance {
  pluginKind: ULDEPluginKind = 'interactive';
  pluginName = "UldeMermaidPlugin";
  description = "render mermaid graph";
  enabled = true;

  // async run(ctx: ULDEExecutionContext){
  async run(ctx: ULDEExecutionContext): Promise<() => void | undefined> {

    if (ctx.lifecyclePhase !== 'hydrate') return new Promise(() => undefined);
    if (!ctx.render) return new Promise(() => undefined);
    if (!isBrowser()) return new Promise(() => undefined);


    console.log(`Log: [UldeMermaidPlugin] run() Start`);


    const { diagnostics } = ctx.artifacts;
    // clear the contents as initializing to prevent duplication in case of re-run;
    // const panel = document.querySelector('.dv-mermaid-debug-panel-content') as HTMLDivElement;
    // panel.innerHTML = '';

    // console.log(`Log: [UldeMermaidBrowserPlugin] init, \ncounter(called)=`, counter++, `\ncontainer=`, container, `\npanel=`, panel);

    const { docTheme } = readSessionState(isBrowser());



    let container!: HTMLElement | null;
    let mermaidNodes!: NodeListOf<HTMLElement>;

    // requestAnimationFrame(() => {

    container = document.querySelector<HTMLElement>('.markdown-host');

    // requestAnimationFrame(() => {
    //   requestAnimationFrame(() => {
    if (!container) {
      diagnostics.push({
        level: "error",
        lifecyclePhase: ctx.lifecyclePhase,
        message: `selector class='markdown-host' not found`,
        pluginKind: this.pluginKind,
        pluginName: this.pluginName
      });
      return new Promise(() => undefined);
    }


    const postRenderCB = genPostRenderCB(container);

    // console.log(`Log: [UldeMermaidPlugin] container`, container);


    requestAnimationFrame(() => {

      mermaidNodes = container.querySelectorAll<HTMLElement>('pre code.language-mermaid');
      if (mermaidNodes.length < 1) {
        diagnostics.push({
          level: "info",
          lifecyclePhase: ctx.lifecyclePhase,
          message: `selector 'code.language-mermaid' not found in 'markdown-host'`,
          pluginKind: this.pluginKind,
          pluginName: this.pluginName
        });
      };


      // console.log(`Log: [UldeMermaidPlugin] mermaidNodes=`, mermaidNodes);

      // const logMermaidDebug = (message: string) => {
      //   const entry = document.createElement('li');
      //   entry.textContent = message;
      //   entry.style.marginBottom = '6px';

      //   panel.appendChild(entry);
      //   // console.log(`Log: [UldeMermaidBrowserPlugin] ogMermaidDebug, entry=`, panel, entry.textContent);
      // }


      try {
        // Patch Mermaid internal async error handler → log to debug panel
        mermaid.parseError = (err: any, hash: any) => {

          diagnostics.push({
            level: "error",
            lifecyclePhase: ctx.lifecyclePhase,
            message: `[Mermaid internal error]\n${err?.message || err}\nHash: ${hash ?? 'n/a'}`,
            pluginKind: this.pluginKind,
            pluginName: this.pluginName
          });
          // logMermaidDebug(`[Mermaid internal error]\n${err?.message || err}\nHash: ${hash ?? 'n/a'}`);
        };

        // Also catch global Mermaid-related errors
        handleEventError = (event: any) => {
          const error = event.error;
          if (error && typeof error.stack === 'string' && error.stack.includes('mermaid')) {
            diagnostics.push({
              level: "error",
              lifecyclePhase: ctx.lifecyclePhase,
              message: `[Window error]\n${error.message}`,
              pluginKind: this.pluginKind,
              pluginName: this.pluginName
            });
            // logMermaidDebug(`[Window error]\n${error.message}`);
            // Do not preventDefault globally; just log
          }
        };
        window.addEventListener('error', handleEventError);

        handleEventUnhandle = (event: any) => {
          const reason: any = event.reason;
          if (reason && typeof reason.stack === 'string' && reason.stack.includes('mermaid')) {

            diagnostics.push({
              level: "error",
              lifecyclePhase: ctx.lifecyclePhase,
              message: `[Unhandled Promise Rejection]\n${reason.message}`,
              pluginKind: this.pluginKind,
              pluginName: this.pluginName
            });
            // logMermaidDebug(`[Unhandled Promise Rejection]\n${reason.message}`);
          }
        };
        window.addEventListener('unhandledrejection', handleEventUnhandle);

        // Initialize Mermaid AFTER nodes exist

        mermaid.initialize({
          ...(docTheme === 'dark' ? mermaidConfigDarkTheme : mermaidConfigLightTheme),

        });

        // Run Mermaid
        mermaid.run({
          // await mermaid.run({
          nodes: mermaidNodes,
          postRenderCallback: postRenderCB
        });

        // if (panel.innerHTML == '') {
        //   panel.append('No Debug Entries Found');
        // }

        console.log(`Log: [UldeMermaidPlugin] run() Finished`);


      } catch (err: any) {
        // Only log to debug panel, not console

        diagnostics.push({
          level: "error",
          lifecyclePhase: ctx.lifecyclePhase,
          message: `[ULDE Mermaid Browser Plugin caught error]\n${err?.message || String(err)}`,
          pluginKind: this.pluginKind,
          pluginName: this.pluginName
        });
        // logMermaidDebug(`[ULDE Mermaid Browser Plugin caught error]\n${err?.message || String(err)}`
        // );
      }

    });
    // });
    return () => {
      // tear down process
      zoomInHandlers.forEach(zoomIn => zoomIn.button.removeEventListener('click', zoomIn.handler));
      zoomOutHandlers.forEach(zoomOut => zoomOut.button.removeEventListener('click', zoomOut.handler));
      resetHandlers.forEach(reset => reset.button.removeEventListener('click', reset.handler));

      window.removeEventListener('error', handleEventError);
      window.removeEventListener('unhandledrejection', handleEventUnhandle);
    };

  };

  async destroy() {

    console.log(`Log: [UldeMermaidPlugin] destroy() start`);
    //     return () => {
    //       zoomInHandlers.forEach(zoomIn => zoomIn.button.removeEventListener('click', zoomIn.handler));
    //       zoomOutHandlers.forEach(zoomOut => zoomOut.button.removeEventListener('click', zoomOut.handler));
    //       resetHandlers.forEach(reset => reset.button.removeEventListener('click', reset.handler));

    //       window.removeEventListener('error', handleEventError);
    //       window.removeEventListener('unhandledrejection', handleEventUnhandle);
    //     }
    //   }

    console.log(`Log: [UldeMermaidPlugin] destroy() start`);

  }

}


/*
    Source - https://stackoverflow.com/a/79199554
    Posted by grappler
    Retrieved 2026-04-23, License - CC BY-SA 4.0
    */

// mermaid code block <pre><code class="language-container">...</code></pre> by mardown-it
/**
 * A callback to call after each diagram is rendered.
 * mermaid code block: <pre><code class="language-mermaid">'mermaid source'</code></pre>, generated by "markdown-it"
 * this callback changes <pre><code class="language-mermaid"><svg>...</svg></code></pre>to to
 * <pre class="mermaid-container"><div class="mermaid-button-container"><code class="language-mermaid"><svg>...</svg></code></pre>, also to implement zoomIn, zoomOut, reset evens.
 * @param svgId
 * @returns
 */
function genPostRenderCB(container: HTMLElement): (id: any) => void {
  return (svgId: any) => {
    const selectorId = "#" + svgId;
    const svg = container.querySelector(selectorId) as SVGElement;
    // console.log(`Log: [UldeMermaidBrowserPlugin] svg=`, svg);
    if (!svg) return;

    // Initialize Panzoom
    const panzoom = Panzoom(svg as SVGElement, {
      maxScale: 5,
      minScale: 0.5,
      step: 0.1,
    });

    // code node
    const codeNode = svg.parentNode;
    // pre node
    const pre = codeNode?.parentElement;
    if (!pre || !codeNode) return;

    pre.className = "mermaid-container";

    const buttonContainer = document.createElement('div');
    buttonContainer.className = "mermaid-button-container";
    // zoomin
    const zoomIn = document.createElement('button');
    zoomIn.className = "mermaid-zoomin-button";
    zoomIn.innerText = "+";
    const handlerIn = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      panzoom.zoomIn({ animate: true });
    };
    zoomIn.addEventListener('click', handlerIn);
    zoomInHandlers.push({ button: zoomIn, handler: handlerIn });
    // zoomout
    const zoomOut = document.createElement('button');
    zoomOut.className = "mermaid-zoomout-button";
    zoomOut.innerText = "-";
    const handlerOut = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      panzoom.zoomOut({ animate: true });
    };
    zoomOut.addEventListener('click', handlerOut);
    zoomOutHandlers.push({ button: zoomOut, handler: handlerOut });
    // rset
    const reset = document.createElement('button');
    reset.className = "mermaid-reset-button";
    reset.innerText = "reset";
    const handlerReset = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      panzoom.reset({ animate: false });
    };
    reset.addEventListener('click', handlerReset);
    resetHandlers.push({ button: reset, handler: handlerReset });

    buttonContainer.appendChild(zoomIn);
    buttonContainer.appendChild(zoomOut);
    buttonContainer.appendChild(reset);

    pre.insertBefore(buttonContainer, codeNode);

    // console.log(`Log: [UldeMermaidBrowserPlugin] final pr=`, pre);

  };
};

```

##### 6-4-4. layout/

###### 6-4-4-1. index.ts
```ts
// src/ulde/plugins/system/layout/index.ts

export * from "./ulde-anchor.plugin";
export * from "./ulde-toc.plugin";

```

###### 6-4-4-2. ulde-anchor.plugin.ts
```ts
// src/ulde/plugins/system/layout/ulde-anchor.plugin.ts

import { visitUldeAst } from '@ulde/engine';
import { ULDEAnchorEntry, ULDEExecutionContext } from '@ulde/types';
import { ULDEPluginInstance, ULDEPluginKind } from '@ulde/types/plugin';

export class ULDEAnchorPlugin implements ULDEPluginInstance {
  pluginKind: ULDEPluginKind = 'layout';
  pluginName = 'ULDEAnchorPlugin';
  description = 'Add <a id="slug"></a> before each heading.';
  enabled = true;

  async run(ctx: ULDEExecutionContext) {
    if (ctx.lifecyclePhase !== 'render') return;
    if (!ctx.render) return;

    console.log(`Log: [ULDEAnchorPlugin] run`);

    const headings: { id: string; text: string; depth: number;  }[] = [];

    visitUldeAst(ctx.render.ast, {
      pre(node) {
        if (node.type === 'heading') {
          const text = node.children
            ?.filter(c => c.type === 'text')
            .map(c => c.value)
            .join('') ?? '';
          const id = slugify(text);
          headings.push({ id, text: text ,depth: node.depth!});

          // Inject anchor node at the beginning of heading children
          node.children?.unshift({
            type: 'anchor',
            id: id
          });
        }
      }
    });

    const anchorEntries: ULDEAnchorEntry[] = headings.map(h => ({
      id: `${slugify(h.text)}`,
      text: h.text,
      depth: h.depth
    }));

    ctx.artifacts.anchors = anchorEntries;


    console.log('Log: [ULDEAnchorPlugin] \nArtifacts ANCHORS Finished');

  }

}


function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

```

###### 6-4-4-3. ulde-toc.plugin.ts
```ts
// src/ulde/plugins/system/layout/ulde-toc.plugin.ts

import { ULDEPluginInstance, ULDEPluginKind } from '@ulde/types/plugin';
import { ULDEExecutionContext, ULDETocEntry, ULDETocNode } from '@ulde/types/context';
import { visitUldeAst } from '@ulde/engine';

export class ULDETocPlugin implements ULDEPluginInstance {
  pluginKind: ULDEPluginKind = 'layout';
  pluginName = 'ULDETocPlugin';
  enabled = true;

  async run(ctx: ULDEExecutionContext) {

    if (ctx.lifecyclePhase !== 'render') return;
    if (!ctx.render) return;

    console.log('Log: [ULDETocPlugin] run');

    const headings: { depth: number; text: string }[] = [];

    // Collect headings
    visitUldeAst(ctx.render.ast, {
      pre(node) {
        if (node.type === 'heading') {
          const text = node.children
            ?.filter(c => c.type === 'text')
            .map(c => c.value)
            .join('') ?? '';
          headings.push({ depth: node.depth!, text });
        }
      }
    });

    // Build TOC AST node
    const tocNode: ULDETocNode = {
      type: 'toc',
      children: headings.map(h => ({
        type: 'internalLink',
        href: `#${slugify(h.text)}`,
        title: h.text,
        children: [{ type: 'text', value: h.text}]
      }))
    };
    // console.log('Log: [ULDETocPlugin] \nBuildTOC AST node Finished');

    // Inject TOC at top
    ctx.render.ast.unshift(tocNode);
    // console.log('Log: [ULDETocPlugin] \nInject TOC at top Finished');

    const tocEntries: ULDETocEntry[] = headings.map(h => ({
      id: `${slugify(h.text)}`,
      text: h.text,
      depth: h.depth
    }));

    ctx.artifacts.toc = tocEntries; // ERROR happens here!!

    console.log('Log: [ULDETocPlugin] \nArtifacts TOC Finished');


  }

  destroy() {
    // No teardown needed
  }
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

```

##### 6-4-5. navigation/

###### 6-4-5-1. index.ts
```ts
/// src/ulde/plugins/system/navigation/index.ts

export * from "./ulde-external-link.plugin";
export * from "./ulde-inetrnal-link.plugin";
export * from "./ulde-navigation-breadcrumbs.plugin";

```

###### 6-4-5-2. ulde-external-link.plugin.ts
```ts
// src/ulde/plugins/system/navigation/ulde-externallink.plugin.ts

import { ULDEExecutionContext } from "@ulde/types";
import { ULDEPluginInstance, ULDEPluginKind } from "@ulde/types/plugin";

export class ULDEExternalLinkPlugin
  implements ULDEPluginInstance {

  readonly pluginName =
    'ULDEExternalLinkPlugin';

  readonly pluginKind: ULDEPluginKind =
    'navigation';

  readonly lifecyclePhase =
    'load';

  run(
    ctx: ULDEExecutionContext
  ): void {

    ctx.page.source.raw =
      this.normalizeExternalLinks(
        ctx.page.source.raw
      );

    // console.log(`Log: [ULDExternalLinkPlugin]  run normalized raw=\n`, ctx.page.source.raw);

  }

  destroy(): void { }

  private normalizeExternalLinks(
    raw: string
  ): string {

    // const pattern = /<a\s+href="([^"]+)"[^&]*\s+title="([^"]+)"[^&]*>([^<]+)<\/a>/gi;

    // Regex to capture href, optional title, and inner text
    // Group 1: href
    // Group 2: title (optional)
    // Group 3: inner text
    const pattern = /<a\s+href="([^"]+)"(?:\s+title="([^"]*)")?>(.*?)<\/a>/gi;

    const normalized = raw.replace(
      pattern,
      (_, href, title, text) => {

        const safeHref = (href || '').trim();
        const safeTitle = (title || '').trim();
        const safeText = (text || '').trim();

        // If title exists, include it in markdown
        return safeTitle
          ? `[external:${safeText}](${safeHref} "${safeTitle}")`
          : `[external:${safeText}](${safeHref})`;
      }
    );

    // console.log(`Log: [ULDEExternalLinkPlugin] \nnormalized raw=\n`, normalized);

    return normalized;

  }
}

```


###### 6-4-4-3. ulde-internal-link.plugin.ts
```ts
// src/ulde/plugins/system/navigation/ulde-internal-link.plugin.ts

import { ULDEPluginInstance, ULDEPluginKind } from "@ulde/types/plugin";

import { createComponent, EnvironmentInjector } from "@angular/core";
import { Example01 } from "../../../../app/demo/example01/example01"; // TBD
import { ULDEExecutionContext } from "@ulde/types";
import { isBrowser } from "../../../../app/global.utils/global.utils";

export class UldeInternalLinkPlugin implements ULDEPluginInstance {
  pluginKind: ULDEPluginKind = 'navigation';
  pluginName = "UldeInternalLinkPlugin";
  description = "register internal link as event lisner to load a new document or angular component";
  enabled = true;
  async run(ctx: ULDEExecutionContext) {

    if (ctx.lifecyclePhase !== 'hydrate') return;
    if (!ctx.render) return;
    if (!isBrowser()) return;

    const markdownHost = document.querySelector('.markdown-host');
    if (!markdownHost) {
      ctx.artifacts.diagnostics.push({
        level: "error",
        message: `'Can't find the htmlelement with class "markdown-host"`,
        lifecyclePhase: ctx.lifecyclePhase,
        pluginKind: this.pluginKind,
        pluginName: this.pluginName
      });
      return;
    }

    requestAnimationFrame(() => {
      const internalLinks = markdownHost.querySelectorAll(`a[href^="#pageId:docs/"]`);

      // console.log(`Log: [UldeInternalLinkPlugin] Internal Doc Routing \ninternalLinks=`, internalLinks, `\nmarkdownContainer=`, markdownHost);

      internalLinks.forEach(a => {
        a.addEventListener('click', (e: any) => {
          e.preventDefault();

          const href = a.getAttribute('href')!;
          const pageId = href.replace('#pageId:', '');

          const rect = a.getBoundingClientRect();
          const containerRect = markdownHost.getBoundingClientRect();
          const anchorPos = Number((rect.top - containerRect.top).toFixed(2));; // anchor position

          // console.log(`Log: [UldeInternalLinkPlugin] Internal Doc Routing pageId=`, pageId);

          markdownHost.dispatchEvent(new CustomEvent('ulde:navigate', {
            detail: {
              pageId: pageId,
              // scrollTop: e.clientY
            },
            bubbles: true
          }));
        });
      });
    });


  }

}

```
###### 6-4-5-4. ulde-navigation-breadcrumbs.plugin.ts
```ts
// src/ulde/plugins/system/navigation/ulde-navigation-breadcrumbs.plugin.ts

import { ULDEExecutionContext } from "@ulde/types";
import { ULDEPluginInstance, ULDEPluginKind } from "@ulde/types/plugin";

export class ULDENavigationBreadcrumbsPlugin implements ULDEPluginInstance {
  pluginKind: ULDEPluginKind = 'navigation';
  pluginName = "ULDENavigationBreadcrumbsPlugin";
  description = "Generates breadcrumb navigationfrom route";
  enabled = true;
  async run(ctx: ULDEExecutionContext) {

    if (ctx.lifecyclePhase !== 'load') return;
    if (ctx.page.source.raw === undefined) return;

    console.log('Log: [ULDENavigationBreadcrumbsPlugin] run');

    const parts = ctx.page.source.raw.split("/").filter(Boolean);
    const breadCrumbs = parts.map((p, i) => ({ label: p, href: "/" + parts.slice(0, i + 1).join("/") }));

    ctx.artifacts.pluginData['breadcrumbs'] = breadCrumbs;

    console.log('Log: [ULDENavigationBreadcrumbsPlugin] finished');


  }

}


```

##### 6-4-6. ulde/

###### 6-4-6-1. index.ts
```ts
// src/ulde/plugins/system/ulde/index.ts

export * from "./ulde-devtools-panel.plugin";
export * from "./ulde-overlay-custom-panel.plugin";
export * from './ulde-slow-plugin-detector.plugin'
export * from './ulde-timeline-profiler.plugin'

```

###### 6-4-6-2. ulde-devtools-panel.plugin.ts
```ts
// src/ulde/plugins/system/ulde/ulde-devtools-panel.plugin.ts

import { ULDEExecutionContext } from "@ulde/types";
import { ULDEPluginInstance, ULDEPluginKind } from "@ulde/types/plugin";

export class ULDEDevToolsPanelPlugin implements ULDEPluginInstance {
  pluginKind: ULDEPluginKind = 'ulde';
  pluginName = "ULDEDevToolsPanelPlugin";
  description = "Adds a custom panel to the ULDE Devtools";
  enabled = true;
  // onInit() {
  //   const panel = document.createElement("div");
  //   panel.className = "ulde-custom-panel";
  //   panel.innerHTML = "<strong>Custom ULDE Panel</strong>";
  //   document.body.appendChild(panel);
  // },

  async run(ctx: ULDEExecutionContext) {

    if (ctx.lifecyclePhase !== 'afterRender') return;
    if (!ctx.render) return;


    const panel = document.createElement("div");
    panel.className = "ulde-devtools-panel";
    panel.innerHTML = "<strong>Custom DevTools Panel</strong>";
    const appRoot = document.querySelector('app-root');
    appRoot?.appendChild(panel);

  };

}


```


###### 6-4-6-3. ulde-overlay-custom-panel.plugin.ts
```ts
// src/ulde/plugins/system/ulde/ulde-overlay-custom-panel.plugin.ts

import { ULDEExecutionContext } from "@ulde/types";
import { ULDEPluginInstance, ULDEPluginKind } from "@ulde/types/plugin";

export class ULDEOverlayCustomPanelPlugin implements ULDEPluginInstance {
  pluginKind: ULDEPluginKind = 'ulde';
  pluginName = "ULDEOverlayCustomPanelPlugin";
  description = "Adds a custom panel to the ULDE overlay";
  enabled = true;
  // onInit() {
  //   const panel = document.createElement("div");
  //   panel.className = "ulde-custom-panel";
  //   panel.innerHTML = "<strong>Custom ULDE Panel</strong>";
  //   document.body.appendChild(panel);
  // },

  async run(ctx: ULDEExecutionContext) {

    if (ctx.lifecyclePhase !== 'afterRender') return;
    if (!ctx.render) return;

    const customPanel: string = `
      <div class="ulde-custom-panel">
      <strong>Custom ULDE Panel</strong>
      </div>
      `;

    const html = ctx.render.html;
    ctx.render.html = html + customPanel;


  };

}



```

###### 6-4-6-4. ulde-slow-plugin-detector.plugin.ts
```ts
// src/ulde/plugins/system/ulde/ulde-slow-pluging-detector.plugin.ts

import { ULDEExecutionContext } from "@ulde/types";
import { ULDEPluginInstance, ULDEPluginKind } from "@ulde/types/plugin";
import { ULDEPluginTiming } from "@ulde/types/timing";

export class ULDESlowPluginDetectorPlugin implements ULDEPluginInstance {
  pluginKind: ULDEPluginKind = 'ulde';
  pluginName = "SlowPluginDetector";
  description = "Warns when plugin execution exceeds threshold";
  enabled = true;
  async run(ctx: ULDEExecutionContext) {


    if (ctx.lifecyclePhase !== 'afterRender') return;
    if (ctx.artifacts.frame === undefined) return;

    const timings: ULDEPluginTiming[] = ctx.artifacts.frame.pluginTimings; // ULDE exposes timing store
    // const timings = window.ULDE.timings; // ULDE exposes timing store
    const threshold = 200; // ms

    for (const t of timings) {
      if (t.duration > threshold) {

        ctx.artifacts.diagnostics.push({
          level: "warn",
          message: `[ULDE] Plugin "${t.pluginName}" exceeded ${threshold}ms: ${t.duration}ms`,
          lifecyclePhase: `${ctx.lifecyclePhase}`,
          pluginKind: this.pluginKind,
          pluginName: this.pluginName
        })
        // console.warn(
        //   `[ULDE] Plugin "${t.pluginName}" exceeded ${threshold}ms: ${t.duration}ms`
        // );
      }
    }
  };

}


```

###### 6-4-6-5. ulde-timeline-profiler.plugin.ts
```ts
// src/ulde/plugins/system/ulde/ulde-timeline-profiler.plugin.ts

import { ULDEExecutionContext } from "@ulde/types";
import { ULDEPluginInstance, ULDEPluginKind } from "@ulde/types/plugin";

export class ULDETimelineProfilerPlugin implements ULDEPluginInstance {
  pluginKind: ULDEPluginKind = 'ulde';
  pluginName = "ULDETimelineProfilerPlugin";
  description = "Logs ULDE phase durations to console";
  enabled = true;
  async run(ctx: ULDEExecutionContext) {

    if (ctx.lifecyclePhase !== 'afterRender') return;

    if (!ctx.artifacts) return;

    console.log("[ULDE] Timeline profiler initialized");
  };

}

```

##### 6-4-7. index.ts
```ts
// src/ulde/plugins/system/index.ts

export * from "./content/index";
export * from "./demo/index";
export * from "./interactive/index";
export * from "./layout/index";
export * from "./navigation/index";
export * from "./ulde/index";
```

#### 6-5. index.ts
```ts
// src/ulde/plugins/index.ts

// export * from "./adaptors/index";
export * from "./registry/index";
export * from "./system/index";

```

### 7. src/ulde/tools/

Maybe for the future

### 8. src/ulde/types/

#### 8-1. context/

##### 8-1-1. index.ts

```ts
// src/ulde/types/context/index.ts

export * from "./ulde-context.types";

```

##### 8-1-2. udel-context.types.ts
```ts
// src/ulde/types/context/ulde-context.types.ts

import { ULDEDiagnostic, ULDEDiagnosticLevel } from '@ulde/types/diagnostics';
import { ULDEFrame } from "@ulde/types/frame";
import { ULDELifecyclePhase } from '@ulde/types/lifecycle';
import { ULDEPluginKind } from '@ulde/types/plugin';
import type Token from 'markdown-it/lib/token.mjs';

// ---------------------------------------------------------
// ULDE Context Objects
// ---------------------------------------------------------


// export interface ULDEAstNode {
//   type: string;
//   children?: ULDEAstNodeBase[];
//   value?: string;
//   depth?: number;
//   lang?: string;
//   meta?: Record<string, any>;
// }

export interface ULDEAstNodeBase {
  children?: ULDEAstNode[];
  // children?: ULDEAstNodeBase[];

  extensions?: Record<string, unknown>;
}

export interface ULDEPageSource {
  raw: string;
  tokens: Token[];
}

/**
 * role: input - contains only source document information
 * rule: represent the document before execution
 * plugins may read, or should rarely mutate it
 */
export interface ULDEPageContext {
  pageId: string;

  /**
  * Original document source.
  * Must never be mutated by render plugins.
  */
  source: ULDEPageSource;

  /**
  * Page-level metadata.
  *
  * Examples:
  * - title
  * - description
  * - tags
  * - breadcrumbs
  * - navigation
  */
  meta: Record<string, unknown>;
}

export interface ULDERenderContext {
  pageId: string;

  /**
  * Final AST after all render plugins.
  */
  ast: ULDEAstNode[];

  /**
  * Final generated HTML.
  */
  html: string;

  /**
  * Layout identifier.
  */
  layout?: ULDELayout;
  // layout?: string;

  // /**
  // * @deprecated
  // * Use executionContext.artifacts instead.
  // */
  // artifacts?: ULDEArtifacts;
}

/** runtime truth
 * role: current execution - contains everything necessary for a single lifecycle run
 * rule: one execution, one document and one lifecycle
 * lifetime: created -> executed -> disposed
 */
export interface ULDEExecutionContext {
  lifecyclePhase: ULDELifecyclePhase;
  page: ULDEPageContext;
  render?: ULDERenderContext;
  artifacts: ULDEArtifacts;
}

export interface ULDETocEntry {
  id: string;
  text: string;
  depth: number;
}

export interface ULDEAnchorEntry {
  id: string;
  text: string;
  depth: number;
}

export interface ULDESectionInfo {
  id: string;
  depth: number;
  title: string;
}

// navigation artifact
export interface ULDEInternalLinkInfo {

  /**
   * Example:
   * #pageId:docs/angular-readme
   */
  href: string;

  title?: string;
}

// external resource artifact
export interface ULDEExternalLinkInfo {

  /**
   * Visible label.
   */
  text: string;

  /**
   * External URL.
   */
  href: string;

  title?: string;

  target?: string;

  rel?: string;
}

export interface ULDECodeBlockInfo {
  language?: string;
  content: string;
}

/** runtime outputs
 * role: execution outputs which are just results produced during execution, not analytics, not history
 * rule: everything produced by plugins belongs here, including diagnostics that are outputs, and frame that represents the result of the execution
 */
export interface ULDEArtifacts {
  // Navigation
  toc: ULDETocEntry[];
  anchors: ULDEAnchorEntry[];
  sections: ULDESectionInfo[];

  // links
  internalLinks: ULDEInternalLinkInfo[];
  externalLinks: ULDEExternalLinkInfo[];

  // Content
  codeBlocks: ULDECodeBlockInfo[];

  // Diagnostics
  diagnostics: ULDEDiagnostic[];

  // Runtime
  frame?: ULDEFrame;

  // Plugin Extension Area
  pluginData: Record<string, unknown>;
}


export interface ULDELayout {
  id: string;
  type: string;
  version?: string;
}

// Block Nodes
export interface ULDEHeadingNode extends ULDEAstNodeBase {
  type: 'heading';
  depth: number;
}

export interface ULDEParagraphNode extends ULDEAstNodeBase {
  type: 'paragraph';
}

export interface ULDEBlockquoteNode extends ULDEAstNodeBase {
  type: 'blockquote';
}

export interface ULDEListNode extends ULDEAstNodeBase {
  type: 'list';
  ordered: boolean;
  // meta: {
  //   ordered: boolean;
  // };
}

export interface ULDEListItemNode extends ULDEAstNodeBase {
  type: 'listItem';
}

export interface ULDETableNode extends ULDEAstNodeBase {
  type: 'table';
}

export interface ULDETableRowNode extends ULDEAstNodeBase {
  type: 'tableRow';
}

export interface ULDETableCellNode extends ULDEAstNodeBase {
  type: 'tableCell';
}

export interface ULDEThematicBreakNode extends ULDEAstNodeBase {
  type: 'thematicBreak';
}

// Inline Nodes
export interface ULDETextNode extends ULDEAstNodeBase {
  type: 'text';
  value: string;
}

export interface ULDEEmphasisNode extends ULDEAstNodeBase {
  type: 'emphasis';
}

export interface ULDEStrongNode extends ULDEAstNodeBase {
  type: 'strong';
}

export interface ULDEInlineCodeNode extends ULDEAstNodeBase {
  type: 'inlineCode';
  value: string;
}

export interface ULDEBreakNode extends ULDEAstNodeBase {
  type: 'break';
}

// ULE documentation navigation

export interface ULDELinkNodeBase
  extends ULDEAstNodeBase {
  /**
 * Example:
 * #pageId:docs/angular-readme, or
 * https://github.com/angular/angular-cli
 */
  href: string;
  /**
   * Optional metadata.
   */
  title?: string;
}

export interface ULDEInternalLinkNode
  extends ULDELinkNodeBase {

  type: 'internalLink';
}

// web navigation
export interface ULDEExternalLinkNode
  extends ULDELinkNodeBase {

  type: 'externalLink';

}

export interface ULDEImageNode extends ULDEAstNodeBase {
  type: 'image';
  src: string;
  alt?: string;
  title?: string;
}

// Structural Nodes
export interface ULDERootNode extends ULDEAstNodeBase {
  type: 'root';
}

export interface ULDESectionNode extends ULDEAstNodeBase {
  type: 'section';
  id?: string;
  depth?: number;
}

export interface ULDEFrontmatterNode extends ULDEAstNodeBase {
  type: 'frontmatter';
  meta: Record<string, unknown>;
}

// Code & Media Nodes
export interface ULDECodeNode extends ULDEAstNodeBase {
  type: 'code';
  lang?: string;
  value: string;
}

export interface ULDEFenceNode extends ULDEAstNodeBase {
  type: 'fence';
  lang?: string;
  value: string;
}

export interface ULDEMathNode extends ULDEAstNodeBase {
  type: 'math';
  value: string;
}

export interface ULDEInlineMathNode extends ULDEAstNodeBase {
  type: 'inlineMath';
  value: string;
}

// ULDE Custom Nodes
export interface ULDEUldeBlockNode extends ULDEAstNodeBase {
  type: 'uldeBlock';
  name: string;
  options?: Record<string, unknown>;
  // meta: {
  //   name: string;
  //   options?: Record<string, any>;
  // };
}

export interface ULDEAdmonitionNode extends ULDEAstNodeBase {
  type: 'admonition';
  kind:
  | 'info'
  | 'warning'
  | 'danger'
  | 'success';
  title?: string;
  // meta: {
  //   kind: 'info' | 'warning' | 'danger' | 'success';
  //   title?: string;
  // };
}

export interface ULDEDemoNode extends ULDEAstNodeBase {
  type: 'demo';
  id: string;
  code: string;
  language?: string;
  // meta: {
  //   id: string;
  //   code: string;
  //   lang?: string;
  // };
}

export interface ULDEComponentNode extends ULDEAstNodeBase {
  type: 'component';
  name: string;
  properties?: Record<string, unknown>;
  // meta: {
  //   name: string;
  //   props?: Record<string, any>;
  // };
}

export interface ULDETocNode extends ULDEAstNodeBase {
  type: 'toc';
}

export interface ULDEAnchorNode extends ULDEAstNodeBase {
  type: 'anchor';
  id: string;
  // meta: {
  //   id: string;
  // };
}

// Meta Nodes
export interface ULDEPositionNode extends ULDEAstNodeBase {
  type: 'position';
  start: { line: number; column: number };
  end: { line: number; column: number };
  // meta: {
  //   start: { line: number; column: number };
  //   end: { line: number; column: number };
  // };
}

export interface ULDEMetaNode extends ULDEAstNodeBase {
  type: 'meta';
  meta: Record<string, any>;
}

export interface ULDEDiagnosticNode extends ULDEAstNodeBase {
  type: 'diagnostic';
  level: ULDEDiagnosticLevel;
  message: string;
  code?: string;
  pluginName?: string;
  pluginKind?: ULDEPluginKind;
  lifecyclePhase?: ULDELifecyclePhase;
  // meta: {
  //   level: ULDEDiagnosticLevel;
  //   message: string;
  //   code?: string;
  //   lifecyclePhase?: ULDELifecyclePhase;
  //   pluginName?: string;
  //   pluginKind?: ULDEPluginKind;
  // };
}

// Full ULDE AST Node Type Union
export type ULDEAstNode =
  | ULDEHeadingNode
  | ULDEParagraphNode
  | ULDEBlockquoteNode
  | ULDEListNode
  | ULDEListItemNode
  | ULDETableNode
  | ULDETableRowNode
  | ULDETableCellNode
  | ULDEThematicBreakNode
  | ULDETextNode
  | ULDEEmphasisNode
  | ULDEStrongNode
  | ULDEInlineCodeNode
  | ULDEBreakNode
  | ULDEInternalLinkNode
  | ULDEImageNode
  | ULDERootNode
  | ULDESectionNode
  | ULDEFrontmatterNode
  | ULDECodeNode
  | ULDEExternalLinkNode
  | ULDEFenceNode
  | ULDEMathNode
  | ULDEInlineMathNode
  | ULDEUldeBlockNode
  | ULDEAdmonitionNode
  | ULDEDemoNode
  | ULDEComponentNode
  | ULDETocNode
  | ULDEAnchorNode
  | ULDEPositionNode
  | ULDEMetaNode
  | ULDEDiagnosticNode;

```

#### 8-2. devtools/

##### 8-2-1. index.ts
```ts
// src/ulde/types/devtools/index.ts

export * from "./ulde-devtools.types";

```

##### 8-2-2. ulde-devtools.types.ts
```ts
// src/ulde/types/devtools/ulde-devtools.types.ts

import { ULDEExecutionContext } from "@ulde/types/context";
import { ULDELifecyclePhase } from "../lifecycle/ulde-lifecycle.types";

import { ULDEPluginKind, ULDEPluginExecutionHook } from "../plugin/ulde-plugin.types";
import { ULDEFrame } from "@ulde/types/frame";
import { ULDEPluginTiming } from "@ulde/types/timing";
import { ULDEDiagnostic } from "@ulde/types/diagnostics";

// ---------------------------------------------------------
// ULDE DevTools Types
// ---------------------------------------------------------

export interface ULDETimelinePoint {
  frameId: string;
  timeStamp: number;
  totalDuration: number;
  phases: {
    lifecyclePhase: ULDELifecyclePhase;
    duration: number;
  }[];
}

export interface ULDEHeatmapCell {
  pluginName: string;
  pluginKind: ULDEPluginKind;
  hookName: ULDEPluginExecutionHook//keyof ULDEPluginHooks;
  lifecyclePhase: ULDELifecyclePhase;
  intensity: number; // normalized 0–1
}

export type ULDEDevToolsTab =
  | 'diagnostics'
  | 'timeline'
  | 'profiler'
  | 'heatmap'
  | 'inspector'
  | 'frames'
  | 'plugins'
  | 'sparkline';

export type ULDEDevtoolsInspectorTab =
  | 'ast'
  | 'layout'
  | 'sections'
  | 'toc'
  | 'anchors'
// | 'frame'

/** Devtools Projection
 * role: developer projection, that is, not execution ownership, not artifacts ownership, not source of truth
 * rule: snapshot never duplicates execution-owned objects
 *
 */
export interface ULDEDevtoolsSnapshot {
  executionContext: ULDEExecutionContext;
  frameHistory: ULDEFrame[];
  analytics: ULDEAnalyticsSnapshot;
}

/**
 * Cross-execution analytics
 */
export interface ULDEAnalyticsSnapshot {
  timeline: ULDETimelinePoint[]; // visual analytics
  heatMap: ULDEHeatmapCell[]; // performance anlytics
  trends: ULDETrendSnapshot; // trend anaytics
  pluginStats: ULDEPluginStatistics[]; // aggregation analytics
}

export interface ULDETrendSnapshot {
  averageFrameDuration: number;
  worstFrameDuration: number;
  averagePluginDuration: number;
  slowestPlugin?: {
    pluginName: string;
    averageDuration: number;
  };
  regressionDetected: boolean;
}

/**
 * Plugin statistics - for future devtools tab
 */
export interface ULDEPluginStatistics {
  pluginName: string;
  pluginKind: ULDEPluginKind;
  executions: number;
  averageDuration: number;
  maxDuration: number;
  totalDuration: number;
}

```

#### 8-3. diagnostic/

##### 8-3-1. index.ts
```ts
// src/ulde/types/diagnostic/index.ts

export * from "./ulde-diagnostic.types";

```

##### 8-3-2. ulde-diagnostic.types.ts
```ts
// src/ulde/types/diagnostic/ulde-diagnostic.types.ts

import { ULDEPluginKind } from "@ulde/types/plugin";
import { ULDELifecyclePhase } from "../lifecycle/ulde-lifecycle.types";


// ULDE Diagnostics
export type ULDEDiagnosticLevel = 'info' | 'warn' | 'error';

export interface ULDEDiagnostic {
  level: ULDEDiagnosticLevel;
  message: string;
  lifecyclePhase?: ULDELifecyclePhase;
  pluginName?: string;
  pluginKind?: ULDEPluginKind;
}

```

#### 8-4. frame/

##### 8-4-1. index.ts
```ts
// src/ulde/types/frame/index.ts

export * from "./ulde-frame.types";

```

##### 8-4-2. ulde-frame.types.ts
```ts
// src/ulde/types/frame/ulde-frame.types.ts

import { ULDELifecyclePhaseTiming } from "@ulde/types/lifecycle";
import { ULDEPluginTiming } from "@ulde/types/timing";

/** runtime measurements
 * role: execution run record, and a frame is not analytics, so a frame is one exxecution measurement
 * rule: one frame = one execution
 */
export interface ULDEFrame {
  id: string;
  timestamp: number;
  lifecyclePhaseTimings: ULDELifecyclePhaseTiming[];
  pluginTimings: ULDEPluginTiming[];
  // diagnostics: ULDEDiagnostic[] //warning or error generated by ULDE
}

```

#### 8-5. lifecycle/

##### 8-5-1. index.ts
```ts
// src/ulde/types/lifecycle/index.ts

export * from "./ulde-lifecycle.types";

```

##### 8-5-2. ulde-lifecycle.types.ts
```ts
// src/ulde/types/lifecycle/ulde-lifecycle.types.ts

//---------------------------------------------------------
// ULDE Lifecycle Phases
// a single execution of one lifecycle phase:---------------------------------------------------------

export type ULDELifecyclePhase =
  | 'init'
  | 'load'
  | 'render'
  | 'hydrate'
  | 'afterRender';

export interface ULDELifecyclePhaseTiming {
  lifecyclePhase: ULDELifecyclePhase;
  startTime: number;
  endTime: number;
  duration: number;
}

```

#### 8-6. plugin/

##### 8-6-1. index.ts
```ts
// src/ulde/types/plugin/index.ts

export * from "./ulde-plugin.types";

```

##### 8-6-2. ulde-plugin.types.ts
```ts
// src/ulde/types/plugin/ulde-plugin.types.ts

import { ULDEExecutionContext, ULDEPageContext, ULDERenderContext } from "@ulde/types/context";
import { ULDELifecyclePhase } from "@ulde/types/lifecycle";

// ---------------------------------------------------------
// ULDE Plugin Kinds
// ---------------------------------------------------------

export type ULDEPluginKind =
  | 'content'
  | 'layout'
  | 'interactive'
  | 'navigation'
  | 'demo'
  | 'ulde';

// ---------------------------------------------------------
// ULDE Plugin Definition - Legacy
// ---------------------------------------------------------

// export interface ULDEPlugin {
//   pluginKind: ULDEPluginKind;
//   pluginName: string;
//   version?: string;
//   description?: string;
//   enabled?: boolean;
//   hooks: ULDEPluginHooks;
// }

// ---------------------------------------------------------
// ULDE Plugin Hooks - Legacy
// ---------------------------------------------------------

// export interface ULDEPluginHooks {
//   onInit?(): void | Promise<void>;
//   onPageLoad?(ctx: ULDEPageContext): void | Promise<void>;
//   onBeforeRender?(ctx: ULDERenderContext): void | Promise<void>;
//   onAfterRender?(ctx: ULDERenderContext): void | Promise<void>;
//   onDestroy?(): void | Promise<void>;
// }

/**
 * ULDE Plugin Instance - Unified Runtime Plugin
 * Every plugin ULDE executes will be an instance of this type.
 */
export interface ULDEPluginInstance {
  pluginKind: ULDEPluginKind;
  pluginName: string;
  enabled?: boolean;

  /**
   * Unified execution entry point.
   * The registry decides which lifecycle phase is being executed.
   */
  run(ctx: ULDEExecutionContext): void | Promise<void> | Promise<() => void |undefined>;

  /**
   * Optional teardown hook.
   */
  destroy?(): void | Promise<void> | Promise<() => void |undefined>;
}

/**
 * ULDE Plugin Classs
 * This is the type stored in the registry
 * This ensures:
 *  registry stores classes
*   registry instantiates instances
*   lifecycle executes run()
 */
export type ULDEPluginClass = {
  new (...args: any[]): ULDEPluginInstance;
};


/**
 * Factory type:
 * Returns either:
 *  - a legacy ULDEPlugin (object)
 *  - a new ULDEPluginInstance (class instance)
 */
export type ULDEPluginFactory = () => ULDEPluginInstance;
// export type ULDEPluginFactory = () => ULDEPlugin | ULDEPluginInstance;

/**
 * Phase-aware plugin registry using factories.
 */
export type ULDEPluginRegistryMap = {
  [P in ULDELifecyclePhase]?: ULDEPluginFactory[];
};


export type ULDEPluginExecutionHook =
  | 'run'
  | 'destroy'
  // | keyof ULDEPluginHooks;

```

#### 8-7. renderer/

##### 8-7-1. index.ts
```ts
// src/ulde/types/renderer/index.ts

export * from "./ulde-renderer.types";

```

##### 8-7-2. ulde-renderer.types.ts
```ts
// src/ulde/types/renderer/ulde-renderer.types.ts

import { ULDEExecutionContext } from "@ulde/types/context";
import { ULDEDevtoolsSnapshot } from "@ulde/types/devtools";

export interface ULDERendererConfig {
  container: HTMLElement;
  width: number;
  height: number;
  backgroundColor?: string;
}

export interface ULDERendererState {
  modelId?: string;
  variantId?: string;
  zoom?: number;
  rotation?: { x: number; y: number; z: number };

  // ULDE docs rendering
  executionContext?: ULDEExecutionContext;
  // renderContext?: ULDERenderContext;
  // currentLifecyclePhase?: ULDELifecyclePhase;
  // diagnostics?: ULDEDiagnostic[];
  // frame?: ULDEFrame;

  devtoolsSnapshot?: ULDEDevtoolsSnapshot;
}

export interface ULDERendererEvents {
  onReady?: () => void;
  onError?: (error: Error) => void;
  onStateChange?: (state: ULDERendererState) => void;
}

export interface ULDERendererHandle {
  setState(state: Partial<ULDERendererState>): void;
  getState(): ULDERendererState;
  highlightDiagnostic(message: string): void;
  dispose(): void;
}

```

#### 8-8. timing/

##### 8-8-1. index.ts
```ts
// src/ulde/types/timing/index.ts

export * from "./ulde-timing.types";

```

##### 8-8-2. ulde-timing.types.ts
```ts
// src/ulde/types/timing/ulde-timing.types.ts

import { ULDEPluginKind, ULDEPluginExecutionHook } from "@ulde/types/plugin";
import { ULDELifecyclePhase } from "../lifecycle/ulde-lifecycle.types";


/**
 * ULDE Plugin Timing
 * timing of ONE plugin hook execution
 */
export interface ULDEPluginTiming {
  pluginName: string;
  pluginKind: ULDEPluginKind;
  hookName: ULDEPluginExecutionHook;
  lifecyclePhase: ULDELifecyclePhase;
  duration: number;
}

```

#### 8-9. index.ts
```ts
// src/ulde/types/index.ts

export * from "./context/index";
export * from "./devtools/index";
export * from "./diagnostics/index";
export * from "./frame/index";
export * from "./lifecycle/index";
export * from "./plugin/index";
export * from "./renderer/index";
export * from "./timing/index";

```

### 9. src/ulde/viewer/

#### 9-1. services/

##### 9-1-1. index.ts
```ts
// src/ulde/viewer/services/index.ts

export * from "./ulde-renderer.service";

```

##### 9-1-2. ulde-renderer.service.ts
```ts
// src/ulde/viewer/services/ulde-renderer.service.ts

import { ElementRef, Injectable } from '@angular/core';
import { ULDERenderContext, } from '@ulde/types/context';
import { ULDEDiagnostic } from '@ulde/types/diagnostics';
import { ULDEFrame } from '@ulde/types/frame';
import {
  ULDERendererConfig, ULDERendererEvents, ULDERendererHandle, ULDERendererState
} from '@ulde/types/renderer';

@Injectable({ providedIn: 'root' })
export class ULDERendererService {
  private handle: ULDERendererHandle | null = null;

  init(
    host: ElementRef<HTMLElement>,
    size: { width: number; height: number },
    events?: ULDERendererEvents
  ): void {
    const config: ULDERendererConfig = {
      container: host.nativeElement,
      width: size.width,
      height: size.height,
      backgroundColor: '#ffffff'
    };

    this.handle = this.createUldeRenderer(config, events);
    events?.onReady?.();
  }

  setState(partial: Partial<ULDERendererState>): void {
    this.handle?.setState(partial);
  }

  getState(): ULDERendererState | null {
    return this.handle ? this.handle.getState() : null;
  }

  highlightDiagnostic(message: string): void {
    this.handle?.highlightDiagnostic(message);
  }

  dispose(): void {
    this.handle?.dispose();
    this.handle = null;
  }

  private createUldeRenderer(
    config: ULDERendererConfig,
    events?: ULDERendererEvents
  ): ULDERendererHandle {
    let state: ULDERendererState = {
      modelId: '',
      variantId: undefined,
      zoom: 1,
      rotation: { x: 0, y: 0, z: 0 },

      executionContext: undefined,
      devtoolsSnapshot: undefined
    };

    // initial placeholder
    config.container.innerHTML = '<p>ULDE Viewer READY</p>';

    function renderFromContext(renderContext: ULDERenderContext | undefined) {
      if (!renderContext) return;
      config.container.innerHTML = renderContext.html;
      bindInteractivity(config.container);


    }

    function renderLifecyclePhase(phase: string | undefined) {
      // optional: could add a data attribute or small badge
      if (!phase) {
        delete config.container.dataset['uldeLifecyclePhase'];
        return;
      }

      config.container.dataset['uldeLifecyclePhase'] = phase;
    }

    function renderDiagnosticsOverlay(diags: ULDEDiagnostic[] | undefined) {

      if (!diags || diags.length === 0) {
        delete config.container.dataset['uldeDiagnosticsCount'];
        return;
      }
      config.container.dataset['uldeDiagnosticsCount'] = String(diags.length);
    }


    function renderFrameInfo(frame: ULDEFrame | undefined) {
      // optional: could add timing info; keep minimal for now
      if (!frame) {
        delete config.container.dataset['uldeFrameId'];
        delete config.container.dataset['uldeFrameTimestamp'];
        return;
      }

      config.container.dataset['uldeFrameId'] = frame.id;
      config.container.dataset['uldeFrameTimestamp'] = String(frame.timestamp);
    }

    function highlightDiagnostic(message: string) {
      const nodes = config.container.querySelectorAll('.ulde-diagnostic');

      nodes.forEach(n => {
        if (n.textContent?.includes(message)) {
          n.classList.add('ulde-diagnostic-highlight');

          setTimeout(() => {
            n.classList.remove('ulde-diagnostic-highlight');
          }, 1500);
        }
      });
    }

    function bindInteractivity(container: HTMLElement) {
      // clear previous listeners by resetting innerHTML already done in renderFromContext

      // add event to highlight active section on scroll
      const sections = Array.from(container.querySelectorAll('section'));

      window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY;

        for (const section of sections) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            section.classList.add('active');
          } else {
            section.classList.remove('active');
          }
        }
      });

      // add event to highlight TOC entry for active section
      const tocLinks = Array.from(container.querySelectorAll('.ulde-toc a'));

      window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY;

        tocLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (!href) return;

          const target = container.querySelector(href);
          if (!target) return;

          const rect = target.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      });


      // TOC links: .ulde-toc a[href="#section-id"]
      container.querySelectorAll('.ulde-toc a').forEach(a => {
        a.addEventListener('click', ev => {
          ev.preventDefault();
          const href = (ev.currentTarget as HTMLAnchorElement).getAttribute('href');
          if (!href) return;
          const target = container.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });

      // Anchors: a[data-ulde-anchor="id"]
      container.querySelectorAll('a[data-ulde-anchor]').forEach(a => {
        a.addEventListener('click', ev => {
          ev.preventDefault();
          const id = (ev.currentTarget as HTMLElement).getAttribute('data-ulde-anchor');
          if (!id) return;
          const target = container.querySelector(`#${id}`);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });

      // Demo blocks: .ulde-demo[data-demo-code]
      container.querySelectorAll('.ulde-demo').forEach(demo => {
        demo.addEventListener('click', () => {
          const code = demo.getAttribute('data-demo-code');
          if (!code) return;
          try {
            const fn = new Function('console', code);
            fn(console);
            // console.log('[ULDE Demo] Running code:', code);
            // // eslint-disable-next-line no-eval
            // eval(code);
          } catch (err) {
            console.error('[ULDE Demo] Error running code:', err);
          }
        });
      });




    }


    const bindNavigate = (container: HTMLElement) => {

      // const handleNavigate = (e: any) => {
      //   const pageId = e.detail.pageId;

      //   const executionContext = state.executionContext;
      //   if (!executionContext) return;
      //   executionContext.page.pageId = pageId;

      //   this.handle?.setState({ ...state, executionContext });

      //   console.log(`Log: [UldeRendererService] bindNavigate pageId=`, pageId);

      // };

      // container.addEventListener('ulde:navigate', handleNavigate);
    }


    return {
      setState(partial: Partial<ULDERendererState>) {
        state = { ...state, ...partial };


        if (state.executionContext !== undefined) {
        // if (partial.executionContext !== undefined) {
          renderFromContext(state.executionContext?.render);

          // internal docrouting
          config.container.addEventListener('ulde:navigate', (e: any) => {
            const pageId = e.detail.pageId;

            const executionContext = state.executionContext;
            if (!executionContext) return;
            executionContext.page.pageId = pageId;

            this.setState({ ...state, executionContext });

            console.log(`Log: [UldeRendererService] bindNavigate pageId=`, pageId, state);

          });



        }

        // if (partial.renderContext !== undefined) {
        //   renderFromContext(state.renderContext);
        // }

        // if (partial.currentLifecyclePhase !== undefined) {
        //   renderLifecyclePhase(state.currentLifecyclePhase);
        // }

        // if (partial.diagnostics !== undefined) {
        //   renderDiagnosticsOverlay(state.diagnostics);
        // }

        // if (partial.frame !== undefined) {
        //   renderFrameInfo(state.frame);
        // }

        events?.onStateChange?.(state);
      },

      getState() {
        return state;
      },


      highlightDiagnostic(message: string) {
        highlightDiagnostic(message);
      },

      dispose() {
        config.container.innerHTML = '';
        // delete config.container.dataset['uldeLifecyclePhase'];
        // delete config.container.dataset['uldeDiagnosticsCount'];
        // delete config.container.dataset['uldeFrameId'];
        // delete config.container.dataset['uldeFrameTimestamp'];
      }
    };
  }
}

```

#### 9-2. styles/

##### 9-2-1. ulde-viewer-base.scss
```scss
// src/ulde/viewer/styles/ulde-viewer-base.scss

/* This file defines the global look of ULDE pages */

:root {
  --ulde-font: 'Segoe UI', Roboto, sans-serif;
  --ulde-bg: #ffffff;
  --ulde-text: #222222;
  --ulde-accent: #0078d4;
  --ulde-border: #e0e0e0;
  --ulde-muted: #666666;

  --ulde-section-spacing: 2rem;
  --ulde-heading-spacing: 1.2rem;
  --ulde-paragraph-spacing: 0.75rem;

  --ulde-demo-bg: #f5f7fa;
  --ulde-demo-border: #d0d7e0;

  --ulde-diagnostic-info: #0078d4;
  --ulde-diagnostic-warn: #e6a100;
  --ulde-diagnostic-error: #d83b01;
}

ulder-viewer,
.ulde-viewer-root {
  font-family: var(--ulde-font);
  background: var(--ulde-bg);
  color: var(--ulde-text);
  line-height: 1.6;
  padding: 1rem;
}


```

##### 9-2-2. ulde-viewer-components.scss
```scss
// src/ulde/viewer/styles/ulde-viewer-components.scss

/* This file styles ULDE AST ouput */

/* Headings */
.ulde-section > h1,
.ulde-section > h2,
.ulde-section > h3 {
  margin-top: var(--ulde-heading-spacing);
  margin-bottom: var(--ulde-heading-spacing);
  font-weight: 600;
}

/* Paragraphs */
.ulde-paragraph {
  margin-bottom: var(--ulde-paragraph-spacing);
}

/* TOC */
.ulde-toc {
  border-left: 3px solid var(--ulde-accent);
  padding-left: 1rem;
  margin-bottom: 2rem;
}

.ulde-toc a {
  display: block;
  color: var(--ulde-accent);
  text-decoration: none;
  margin-bottom: 0.25rem;
}

.ulde-toc a:hover {
  text-decoration: underline;
}

/* Anchors */
a[data-ulde-anchor] {
  cursor: pointer;
  color: var(--ulde-accent);
}

/* Demo Blocks */
.ulde-demo {
  background: var(--ulde-demo-bg);
  border: 1px solid var(--ulde-demo-border);
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 6px;
  cursor: pointer;
}

.ulde-demo:hover {
  background: #eef2f7;
}

```

##### 9-2-3. ulde-viewer-theme-dark.scss
```scss
// src/ulde/viewer/styles/ulde-viewer-theme-dark.scss

/* Dark theme (default) */

[data-theme="dark"] {
  --ulde-bg: #1e1e1e;
  --ulde-text: #e0e0e0;
  --ulde-accent: #4da3ff;
  --ulde-border: #333333;
  --ulde-muted: #aaaaaa;

  --ulde-demo-bg: #2a2d2e;
  --ulde-demo-border: #3a3d3e;
}

```

##### 9-2-4. ulde-viewer-theme-light.scss
```scss
// src/ulde/viewer/styles/ulde-viewer-theme-light.scss


/* Light theme (default) */

[data-theme="light"] {
  --ulde-bg: #ffffff;
  --ulde-text: #222222;
  --ulde-accent: #0078d4;
  --ulde-border: #e0e0e0;
  --ulde-muted: #666666;

  --ulde-demo-bg: #f5f7fa;
  --ulde-demo-border: #d0d7e0;
}

```

#### 9-3. index.ts
```ts
// src/ulde/viewer/index.ts

export * from "./services";
export * from "./ulde-viewer";

```

#### 9-3. ulde-viewer.html
```html
<!-- src/ulde/viewer/ulde-viewer.html -->

  <div class="ulde-markdown-viewer">
    <div #markdownHost class="markdown-host"></div>
  </div>


```

#### 9-4. ulde-viewer.scss
```scss
// src/ulde/viewer/ulde-viewer.scss

/* Import ulde-viwer styles */
// @use './styles/ulde-viewer-base.scss';
// @use './styles/ulde-viewer-components.scss';
// @use './styles/ulde-viewer-diagnostics.scss';
// @use './styles/ulde-viewer-theme-light.scss';
// @use './styles/ulde-viewer-theme-dark.scss';

// .ulde-pane-container {
//   display: flex;
//   flex-direction: column;
// }

.ulde-markdown-viewer {
  display: flex;

  .markdown-host {
    padding-left: 15px;
    min-height: 400px;

  }

}

```

#### 9-5. ulde-viewer.ts
```ts
// src/ulde/viewer/ulde-viewer.ts

import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, effect, input, output, signal, computed } from '@angular/core';
import { ULDEDevtools, ULDEDevtoolsService } from '@ulde/devtools';
import { ULDEFrame } from '@ulde/types/frame';
import type { ULDERendererState } from '@ulde/types/renderer';
import { ULDERendererService } from '@ulde/viewer/services';
import { isBrowser } from '../../app/global.utils/global.utils';

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
      console.log(`Log: [UldeViewer] effect(): 🔥3`);

      const state = this.rendererService.getState();
      if (!state?.executionContext?.artifacts) return;

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
      console.log(`Log: [UldeViewer] effect(): 🔥4`, state.executionContext);
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
    this.rendererService.dispose();
  }

  private syncSignalInput(state: ULDERendererState): void {
    // const input = this.$currentRendererState();
    // if (!input || !input.executionContext) return;

    if (!state.executionContext) return;
    state.devtoolsSnapshot = this.devtoolsService.$generateDevtoolsSnapshot(state.executionContext)();

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


}

```

### 10. tsconfig.paths.json
```json
// tsconfig.paths.json  ULDE Alias path map
// shared “base” config among tsconfig.json, tsconfig.app.json and tsconfig.editor.json
{
  "compilerOptions": {
    "paths": {
      "@ulde/configurator": [
        "./src/ulde/configurator/index"
      ],
      "@ulde/configurator/*": [
        "./src/ulde/configurator/*"
      ],
      "@ulde/core": [
        "./src/ulde/core/index"
      ],
      "@ulde/core/*": [
        "./src/ulde/core/*"
      ],
      "@ulde/devtools": [
        "./src/ulde/devtools/index"
      ],
      "@ulde/devtools/*": [
        "./src/ulde/devtools/*"
      ],
      "@ulde/engine": [
        "./src/ulde/engine/index"
      ],
      "@ulde/engine/*": [
        "./src/ulde/engine/*"
      ],
      "@ulde/plugins": [
        "./src/ulde/plugins/index"
      ],
      "@ulde/plugins/*": [
        "./src/ulde/plugins/*"
      ],
      "@ulde/tools": [
        "./src/ulde/tools/index"
      ],
      "@ulde/tools/*": [
        "./src/ulde/tools/*"
      ],
      "@ulde/types": [
        "./src/ulde/types/index"
      ],
      "@ulde/types/*": [
        "./src/ulde/types/*"
      ],
      "@ulde/viewer": [
        "./src/ulde/viewer/index"
      ],
      "@ulde/viewer/*": [
        "./src/ulde/viewer/*"
      ],
    }
  }
}

```

### 11. vite.config.ts
```ts
// vite.config.ts

// Resolve ULDE aliases

import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@ulde/configurator": path.resolve(__dirname, "./src/ulde/configurator"),
      "@ulde/core": path.resolve(__dirname, "./src/ulde/core"),
      "@ulde/devtools": path.resolve(__dirname, "./src/ulde/devtools"),
      "@ulde/engine": path.resolve(__dirname, "./src/ulde/engine"),
      "@ulde/plugins": path.resolve(__dirname, "./src/ulde/plugins"),
      // "@ulde/plugins/system/content": path.resolve(__dirname, "./src/ulde/plugins/system/content"),
      "@ulde/tools": path.resolve(__dirname, "./src/ulde/tools"),
      "@ulde/types": path.resolve(__dirname, "./src/ulde/types"),
      "@ulde/viewer": path.resolve(__dirname, "./src/ulde/viewer"),
    }

  }
});

```
