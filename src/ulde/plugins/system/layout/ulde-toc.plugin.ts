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


// Legacy

// import { ULDEPlugin } from "@ulde/types/plugin";
// import { ULDERenderContext } from "@ulde/types/context";
// import { visitUldeAst, renderUldeAstToHtml } from "@ulde/engine";

// // import { renderUldeAstToHtml } from './ulde-ast-renderer.engine';

// export const ULDETocPlugin: ULDEPlugin = {
//   pluginKind: 'layout',
//   pluginName: "auto-toc",
//   description: "Generates a table of contents from headings",
//   enabled: true,
//   hooks: {
//     async onBeforeRender(ctx: ULDERenderContext) {

//       // console.log(`Log: [AutoToc Plugin] onBeforeRender`);

//       // const headings = ctx.ast.map(n =>
//       //   n.children?.filter((n: any) => /^h[1-6]$/.test(n.tag))
//       // );
//       // const tocHtml = headings
//       //   .map((h: any) => `<li><a href="#${h.id}">${h.text}</a></li>`)
//       //   .join("");

//       // ctx.html = `<nav class="toc"><ul>${tocHtml}</ul></nav>` + ctx.html;

//       const headings: { depth: number; text: string }[] = [];

//       // Collect headings
//       visitUldeAst(ctx.ast, {
//         pre(node) {
//           if (node.type === 'heading') {
//             const text = node.children
//               ?.filter(c => c.type === 'text')
//               .map(c => c.value)
//               .join('') ?? '';
//             headings.push({ depth: node.depth!, text });
//           }
//         }
//       });

//       // Build TOC AST node
//       const tocNode = {
//         type: 'toc',
//         children: headings.map(h => ({
//           type: 'link',
//           meta: { href: `#${slugify(h.text)}` },
//           children: [{ type: 'text', value: h.text }]
//         }))
//       };

//       // Inject TOC at top
//       ctx.ast.unshift(tocNode);
//       console.log(`Log: AutoTOC Plugin] onBeforeRender \nctx.ast=`, ctx.ast);

//       // // New addition in debugginf
//       // const ast = ctx.ast;
//       // ctx.html = renderUldeAstToHtml(ast);

//     },

//     // onAfterRender(ctx) {
//     //   const headings: { depth: number; id: string, text: string }[] = [];
//     //   visitUldeAst(ctx.ast, {
//     //     pre(node) {
//     //       if (node.type === 'section') {
//     //         const id = node.meta?.['id'];
//     //         const depth = node.meta?.['depth'];

//     //         const heading = node.children?.map(c => c)
//     //           .filter(c => c.type === 'heading');

//     //         const anchor = heading?.map(c => c?.children?.filter(c => c.type==='anchor'));
//     //         // ?.map(c=>c).filter(c => c.type ==='anchor');
//     //         // .filter(c => c.type==='anchor');
//     //         const text = heading?.map(c => c?.children?.filter(c => c.type==='text')).map(c => c?.values).join('') ?? '';;

//     //           // .filter(c => c?.type === 'anchor').join('') ?? '';


//     //         headings.push({ depth: depth, id: id, text });
//     //       }
//     //     }
//     //   });



//     //   console.log(`Log: AutoTOC Plugin] onAfterRender \nheadins=\n`, headings);

//     //   const tocHtml = headings
//     //     .map((h: any) => `<li><a href="#${h.id}">${h.text}</a></li>`)
//     //     .join("");

//     //   ctx.html = `<nav class="toc"><ul>${tocHtml}</ul></nav>` + ctx.html;


//     //   console.log(`Log: AutoTOC Plugin] onAfterRender \nctx.html=\n`, ctx.html);
//     // },

//   }

// };

// function slugify(s: string) {
//   return s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
// }
