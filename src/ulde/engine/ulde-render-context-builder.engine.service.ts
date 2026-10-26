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

    // 2. Inject diagnostics into AST
    const diagnostics = this.devtoolsService.$diagnostics();

    const finalAst = sectionAst;
    // const finalAst = [...sectionAst, ...diagnosticNodes];

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

