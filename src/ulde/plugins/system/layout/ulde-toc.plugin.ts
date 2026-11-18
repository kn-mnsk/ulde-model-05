// src/ulde/plugins/system/layout/ulde-toc.plugin.ts

import {
  ULDEPluginInstance,
  ULDEPluginKind,
} from '@ulde/types/plugin';

import {
  ULDEExecutionContext,
  ULDEIntraPageLinkNode,
  ULDETocEntry,
  ULDETocNode
}
  from '@ulde/types/context';

import { visitUldeAst } from '@ulde/engine';

import { slugify } from '../../../../app/global.utils/global.utils';


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

          let text =
            node.children?.
              filter(c =>
                c.type === 'text').
              map(c =>
                c.value).
              join('') ??
            '';

          let depth = node.depth;

          if (!text || !depth) {
            ctx.artifacts.diagnostics.push(
              {
                pluginKind: 'layout',
                pluginName: 'ULDETocPlugin',
                lifecyclePhase: 'render',
                level: 'error',
                message: `either text ${text} or depth ${depth}\n might cause problem in TOC handling`
              }
            );
            text ??= '';
            depth ??= 0;
          };

          headings.push(
            {
              depth,
              text
            }
          );

        }
      }

    });

    // Build TOC AST node
    const tocNode: ULDETocNode = {
      type: 'toc',
      entry: {
        id: '',
        text: '',
        depth: 0
      },
      children: headings.map(h => ({
        type: 'intraPageLink',
        href: `#${slugify(h.text)}`,
        title: h.text,
        children: [{ type: 'text', value: h.text }]
      }))
    };
    // Inject TOC at top
    ctx.render.ast.unshift(tocNode);


    // build Link AST node
    // const intraPageLinkNodes: ULDEIntraPageLinkNode[] = headings.map(h => {
    //   return {
    //     type: 'intraPageLink',
    //     href: `#${slugify(h.text)}`,
    //     title: h.text,
    //     children: [{ type: 'text', value: h.text }]
    //   };
    // });

    //   // Inject TOC at top
    // ctx.render.ast.unshift(...intraPageLinkNodes);


    // Build TOC Node
    const tocEntries: ULDETocEntry[] = headings.map(h => ({
      id: `${slugify(h.text)}`,
      text: h.text,
      depth: h.depth
    }));

    // ctx.artifacts.toc = tocEntries; // ERROR happens here!!
    ctx.artifacts.toc = this.buildTocNode(tocEntries);

    // console.log(`Log: [ULDETocPlugin]`,
    //   `\n\tArtifacts TOC=`, ctx.artifacts.toc,
    //   `\n\t TOC etries=`, tocEntries,
    // );


  }

  destroy() {
    // No teardown needed
  }

  /**
   * Build TOC tree
   * @param entries
   * @returns
   */
  private buildTocNode(entries: ULDETocEntry[]): ULDETocNode[] {
    const root: ULDETocNode[] = [];
    const stack: ULDETocNode[] = [];

    for (const entry of entries) {
      const node: ULDETocNode = {
        type: 'toc',
        entry,
        children: [],
        collapsed: false
      };

      while (stack.length && stack[stack.length - 1].entry.depth >= entry.depth) {
        stack.pop();
      }

      if (!stack.length || stack.length < 1) {
        root.push(node);
      } else {

        const idx = stack.length - 1;
        stack[idx].children?.push(node);
      }

      stack.push(node);
    }

    return root;
  }


}



// function slugify(s: string) {
//   return s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
// }

