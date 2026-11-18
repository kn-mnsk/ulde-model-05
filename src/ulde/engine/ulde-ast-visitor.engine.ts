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
 * @param nodes ULDEAstNode[]
 * @param options ULDEAstVisitorOptions
 * @returns
 */
export function visitUldeAst(
  nodes: ULDEAstNode[],
  options: ULDEAstVisitorOptions
): ULDEAstNode[] {

  const { pre, post } = options;

  const walk = (
    node: ULDEAstNode,
    parent: ULDEAstNode | null
  ): ULDEAstNode | null => {

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

