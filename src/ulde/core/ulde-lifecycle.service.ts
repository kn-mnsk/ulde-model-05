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
      navigation: {
        pageId: pageContext.pageId,
        scrollPosition: 0
      },
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

    // GENERATE markdown-it tokens for the next step
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

