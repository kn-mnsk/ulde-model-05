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
            case 'text':
              push({ type: 'text', value: child.content });
              break;

            case 'html_inline':
              // reserved for future ULDEHtmlNode
              break;

            // case 'html_inline':

            //   const content = child.content;
            //   const html = t.content;

            //   const externalLink =
            //     parseExternalAnchor(html);
            //   if (externalLink) {
            //     // push(externalLink);
            //     if (content.includes('<a')) {
            //       open({
            //         type: 'externalLink',
            //         href: externalLink.href,
            //         text: externalLink.text,
            //         title: externalLink.title,
            //         target: externalLink.target,
            //         rel: externalLink.rel

            //       })
            //     } else if (content.includes('</a>')) {
            //       close();
            //     }
            //   };

            //   break;

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

              const href =
                child.attrGet('href') || '';

              const text =
                getInlineLinkText(t.children ?? []);

              console.log(`Log: [AstBuilder] link-open text=`, text, href)
              const isExternal =
                text.startsWith('external:');

              if (isExternal) {

                open({
                  type: 'externalLink',

                  href,

                  text: text.replace(
                    /^external:/,
                    ''
                  ),

                  target: '_blank',

                  rel: 'noopener noreferrer'
                });

              } else {

                open({
                  type: 'internalLink',

                  href,

                  title: undefined
                });

              }

              break;
            }


            // case 'link_open':
            //   open({
            //     type: 'internalLink',
            //     // type: 'link',
            //     href: child.attrGet('href') || '',
            //     title: t.content  // ??
            //   });
            //   break;



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

function getInlineLinkText(
  children?: Token[]
): string {

  return (children ?? [])
    .filter(
      child => child.type === 'text'
    )
    .map(
      child => child.content
    )
    .join('');
}

function parseExternalAnchor(
  html: string
): ULDEExternalLinkNode | undefined {

  const href =
    html.match(/href="([^"]+)"/)?.[1];

  if (!href) {
    return undefined;
  }

  const reg = /<a[^>]*>([^<]+)<\/a>/g;
  const text = reg.exec(html)?.[1] ?? '';

  // console.log(`Log: [AstBuildr] parseExternalAnchor \ntext=`, text, href)

  return {
    type: 'externalLink',

    href,

    text,

    target: '_blank',

    rel: 'noopener noreferrer'
  };
}
//-----------------------------------------
// NOTE:
// If addinng custom tokens (for frontmatter, demos, ULDE blocks) later, can extend this switch with those types and map them to ULDEFrontmatterNode, ULDEDemoNode, ULDEUldeBlockNode, etc.
//-------------------------------------
