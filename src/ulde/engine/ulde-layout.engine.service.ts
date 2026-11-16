// src/ulde/engine/ulde-layout.engine.service.ts

import { Injectable } from '@angular/core';

import {
  ULDEAstNode,
  ULDESectionNode,
  ULDEHeadingNode
 } from '@ulde/types/context';

 import { slugify } from '../../app/global.utils/global.utils';

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
          id: slugify(collectHeadingText(node)) ?? undefined,
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

// function slugify(s: string) {
//   return s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
// }
