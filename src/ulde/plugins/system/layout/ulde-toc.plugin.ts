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

    // console.log('Log: [ULDETocPlugin] run');

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

    // console.log('Log: [ULDETocPlugin] \nArtifacts TOC Finished');


  }

  destroy() {
    // No teardown needed
  }
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

