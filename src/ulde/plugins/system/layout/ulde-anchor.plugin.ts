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

    // console.log(`Log: [ULDEAnchorPlugin] run`);

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


    // console.log('Log: [ULDEAnchorPlugin] \nArtifacts ANCHORS Finished');

  }

}


function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}
