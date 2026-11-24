// src/ulde/viewer/ulde-viewer.ts

/**
 * Ownership
 *
 *
 */

import { OnInit, AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, effect, input, output, signal, computed } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { ULDEDevtools, ULDEDevtoolsService } from '@ulde/devtools';
import type { ULDERendererState } from '@ulde/types/renderer';
import { UldeNavigationRuntimeService, ULDERendererService, UldePageRestorationService, UldeScrollspyService } from '@ulde/viewer/services';
import { ULDEAstNode, ULDEDevtoolsSnapshot, ULDETocEntry } from '@ulde/types';
import { isBrowser } from '../../app/global.utils/global.utils';
import { ULDEExecutionContext, ULDETocNode } from '@ulde/types';
import { UldeViewerTocResizerDirective } from '@ulde/viewer/ulde-viewer-toc-resizer.directive';
import { UldeOverlayService } from '@ulde/viewer/services/ulde-overlay.service';
import { UldeViewerThemeToggle } from './theme-toggle';
import { UldeThemeService, ThemeName } from '@ulde/viewer/services';


@Component({
  selector: 'ulde-viewer',
  standalone: true,
  imports: [
    UldeViewerTocResizerDirective,
    ULDEDevtools,
    NgTemplateOutlet,
    UldeViewerThemeToggle
  ],
  templateUrl: 'ulde-viewer.html',
  styleUrl: 'ulde-viewer.scss',
})
export class UldeViewer implements
  OnInit,
  AfterViewInit,
  OnDestroy {

  // Viewer Container
  @ViewChild('uldeViewerContainer', { static: false })
  viewerContainerRef!: ElementRef<HTMLElement>;

  // Aside - TOC
  @ViewChild('viewerToc', { static: false })
  viewerTocRef!: ElementRef<HTMLElement>;
  @ViewChild('viewerTocOverlay', { static: false })
  viewerTocOverlayRef?: ElementRef<HTMLElement>;

  // Main - Markdown
  @ViewChild('markdownHostContainer', { static: false })
  hostContainerRef!: ElementRef<HTMLElement>;
  @ViewChild('markdownHostOverlay', { static: false })
  markdownHostOverlayRef?: ElementRef<HTMLElement>;
  @ViewChild('markdownHost', { static: false })
  hostRef!: ElementRef<HTMLElement>;


  // Full renderer state comes in as a signal input
  $inputRendererState = input.required<ULDERendererState | null>();

  $currentRendererState = computed(() =>
    this.$inputRendererState()
  );

  $pageId = computed(() =>
    this.$currentRendererState()?.executionContext?.page.pageId
  );

  $ready = output<void>();
  $error = output<Error>();
  $rendererStateChange = output<ULDERendererState>();

  $prevPageId = signal<string | null>(null);


  //TOC
  $tocResizeRef =
    signal<ElementRef<HTMLElement> | undefined>(undefined);

  $toc = signal<ULDETocNode[]>([]);

  readonly $tocTree = computed<ULDETocNode[]>(() =>
    this.$toc()
  );

  $activeHeading = computed<string | null>(() =>
    this.scrollSpy.$activeHeading()
  );

  // devtools
  $visibilityDevtools = signal<'visible' | 'hidden'>('hidden');

  $devtoolsSnapshot =
    computed<ULDEDevtoolsSnapshot | undefined>(() => this.$currentRendererState()?.devtoolsSnapshot);

  // event handler
  private keyDownEvent!: any;
  private handleKeydown!: (e: KeyboardEvent) => void;

  private debugCounter: number = 0;

  constructor(
    public rendererService: ULDERendererService,
    private devtoolsService: ULDEDevtoolsService,
    private navigationRuntimeService: UldeNavigationRuntimeService,
    private scrollSpy: UldeScrollspyService,
    public pageRestore: UldePageRestorationService,
    private overlayService: UldeOverlayService,
    private themeService: UldeThemeService,
  ) {

    // this.handleKeydown = this.onKeyDown;

    // 🔥1 React to change of $rendererState()
    effect(() => {

      /** debug */
      this.debugCounter++;

      console.log(
        `[UldeViewer]`,
        `\n\teffect()`,
        `\n\tdebug count=`, this.debugCounter
      );

      if (this.debugCounter > 20) {
        debugger;
        throw new Error('Loop detected');
      }
      /** debug */

      if (!isBrowser()) return;

      const currentRendererState =
        this.$currentRendererState();
      const executionContext
        = currentRendererState?.executionContext;

      // console.log(
      //   `[UldeViewer]`,
      //   `\n\teffect()`,
      //   `\n\tcurrentRendererState=`, currentRendererState
      // );

      if (
        !currentRendererState ||
        !executionContext
      ) return;

      if (
        !this.hostRef ||
        !this.hostContainerRef ||
        !this.viewerTocRef
      ) return;

      // 1. overlay on
      // this.overlayService.show(this.viewerTocRef);
      // this.overlayService.show(this.markdownHostOverlayRef);

      // 2. update spapshot
      currentRendererState.devtoolsSnapshot = this.devtoolsService.$generateDevtoolsSnapshot(executionContext)();

      // 3. set rendererState
      this.rendererService.init(
        currentRendererState,
        this.hostRef,
        {
          width: this.hostRef.nativeElement.clientWidth,
          height: this.hostRef.nativeElement.clientHeight,
        },
        {
          onReady: () => this.$ready.emit(),
          onError: (e) => this.$error.emit(e),
          onStateChange: (s) => this.$rendererStateChange.emit(s),
        },
      );

      // // 4. recover previous pageId
      // this.$prevPageId.set(
      //   this.pageRestore.getPrevPageId()
      // );

      // 5. set TOC
      const toc = executionContext.artifacts.toc;
      this.$toc.set(toc);
      //

      // 6. Toc layout rezizer setting
      this.$tocResizeRef.set(this.viewerTocRef);

      // 7. set rendererStae
      currentRendererState.executionContext = executionContext;

      this.rendererService.setState(currentRendererState);

      // 4. recover previous pageId
      this.$prevPageId.set(
        this.pageRestore.getPrevPageId()
      );


      // 8. scrollspy setting through intersetionobserver
      this.scrollSpy.disconnect();
      this.scrollSpy.observe(
        this.hostContainerRef.nativeElement,
        executionContext
      );

      this.scrollTracking(
        this.hostContainerRef.nativeElement,
        executionContext,
      );

      // 9. seeting intrapage link to hight linked anchor
      this.navigationRuntimeService.bind(
        this.hostContainerRef.nativeElement,
        executionContext
      );



      console.log(
        `Log: [UldeViewer] effect()`,
        `\n\t🔥1 Finished`
      );

    });

    // VS Code auto-expand behavior
    effect(() => {
      const active = this.$activeHeading();
      const tree = this.$tocTree();

      if (!tree.length) return;

      if (!active) {
        // First load → expand everything
        tree.forEach(n => n.collapsed = false);
        return;
      }

      this.rendererService.updateTocCollapseState(tree, active);

    });

  }


  ngOnInit(): void { }


  ngAfterViewInit(): void {

    if (!isBrowser()) return;


    // event listner to open devtools
    document.removeEventListener(
      'keydown',
      this.handleKeydown
    );
    this.handleKeydown = () => { };
    this.handleKeydown = this.onKeyDown;
    document.addEventListener(
      'keydown',
      this.handleKeydown
    );


    // overlay off
    this.overlayService.hide(this.viewerTocRef);
    this.overlayService.hide(this.markdownHostOverlayRef);



//test
    const container: HTMLElement| null = document.querySelector('div.markdown-host');
    const nodes = container?.querySelectorAll('a[href^="#pageId:"]');

    // container?.childNodes.forEach(child => {
    //   console.log(`debug`,child.nodeName);
    // })

    console.log(
      `Log: [UldeViewer]`,
      `\n\tcontainer=`, container,
      nodes,

    );

//test

  }

  ngOnDestroy(): void {

    this.pageRestore.stopScrollTracking(
      this.hostContainerRef.nativeElement
    );

    this.rendererService.dispose();

    this.scrollSpy.disconnect();


    this.handleKeydown = (e: Event): void => { };
    // this.onKeyDown.bind(null);

    console.log(`Log: [UldeViewer]`,
      `\n\tngOnDestroy Completed`
    );
  }

  private syncSignalInput(
    rendererState: ULDERendererState
  ): void {

    if (!rendererState.executionContext) return;

    rendererState.devtoolsSnapshot =
      this.devtoolsService.$generateDevtoolsSnapshot(
        rendererState.executionContext)();

    this.rendererService.setState(rendererState);

    const toc = rendererState.executionContext.artifacts.toc;

    this.$toc.set(toc);

    // console.log(`[UldeViewer]`,
    //   `\n\tsyncSingnalInput`,
    //   `\n\tTOC=`, toc,
    // );


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
    host: HTMLElement,
    ctx: ULDEExecutionContext,
  ) {

    // console.log(`Log: [UldeViewer] scrollTracking() beging`);

    const pageId =
      ctx.page.pageId;

    // restore page position
    this.pageRestore.
      restorePagelPosition(
        host,
        pageId
      );

    this.pageRestore.
      stopScrollTracking(
        host
      );


    this.pageRestore.
      startScrollTracking(
        host,
        pageId,
        this.$tocTree()
      );

  }

  backToPrevPage() {
    // console.log(`[UldeViewer] onBackToPrevPage 1`);

    const newPageId = this.$prevPageId();// prevPageId becomes newPageId
    // if (!newPageId) return;


    this.loadPage(newPageId);

    // const currentRendererState =
    //   this.$currentRendererState();

    // if (
    //   !currentRendererState ||
    //   !currentRendererState.executionContext
    // ) return;


    // currentRendererState.executionContext.page.pageId
    //   = newPageId;

    // this.syncSignalInput(currentRendererState);

    // console.log(
    //   `[UldeViewer] onBackToPrevPage 🔄️`,
    //   `\ncurrent Page=`, newPageId,
    //   `\nprev Page=`, this.$prevPageId()
    // );

  }

  private onKeyDown = (e: KeyboardEvent) => {

    // console.log(
    //   `[UldeConfigurator] onKeyDown`
    // );

    if (
      e.ctrlKey &&
      e.key === 'k'
    ) {

      e.preventDefault();

      // console.log(`Log: [${this.component}] onkeyDown`, e);

      this.$visibilityDevtools.update(b =>
        b ==
          'hidden' ?
          'visible' :
          'hidden'
      );

    };

  };

  isParentActive(node: ULDETocNode)
    : boolean {

    return this.scrollSpy.isParentActive(node);

  }

  // Scroll to heading
  scrollTo(host: HTMLElement, slug: string,
  ) {

    this.scrollSpy.scrollTo(host, slug, this.$tocTree());

    // this.scrollSpy.detectScrollEnd(host, () => {
    //   this.scrollSpy.activateClickedTocItem(this.$tocTree(), slug);
    // });

  }


  // Theme toggle
  async onToggleTheme(theme: ThemeName): Promise<void> {
    this.themeService.toggleTheme(theme);

    const currentRedererState =
      this.$currentRendererState();
    if (!currentRedererState) return;
    this.rendererService.setState(currentRedererState);

  }

  loadPage(pageId: string | null): void {

    if (!pageId) {
      console.error(`[UldeViewer]`,
        `\n\tloadPage()`,
        `\n\tInvalid PageId=`, pageId,
      );
      return;
    };

    const currentRendererState =
      this.$currentRendererState();

    if (
      !currentRendererState ||
      !currentRendererState.executionContext
    ) return;


    currentRendererState.executionContext.page.pageId = pageId;

    // this.syncSignalInput(currentRendererState);
    this.rendererService.setState(currentRendererState);

    console.log(
      `[UldeViewer] loadPage`,
      `\nnew pageId=`, pageId,
      `\nprev Page=`, this.$prevPageId()
    );

  }

}
