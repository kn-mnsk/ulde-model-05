// src/ulde/types/context/ulde-context.types.ts

import { ULDEDiagnostic, ULDEDiagnosticLevel } from '@ulde/types/diagnostics';
import { ULDEFrame } from "@ulde/types/frame";
import { ULDELifecyclePhase } from '@ulde/types/lifecycle';
import { ULDEPluginKind } from '@ulde/types/plugin';
import type Token from 'markdown-it/lib/token.mjs';

// ---------------------------------------------------------
// ULDE Context Objects
// ---------------------------------------------------------


// export interface ULDEAstNode {
//   type: string;
//   children?: ULDEAstNodeBase[];
//   value?: string;
//   depth?: number;
//   lang?: string;
//   meta?: Record<string, any>;
// }

export interface ULDEAstNodeBase {
  children?: ULDEAstNode[];
  // children?: ULDEAstNodeBase[];

  extensions?: Record<string, unknown>;
}

export interface ULDEPageSource {
  raw: string;
  tokens: Token[];
}

/**
 * role: input - contains only source document information
 * rule: represent the document before execution
 * plugins may read, or should rarely mutate it
 */
export interface ULDEPageContext {
  pageId: string;

  /**
  * Original document source.
  * Must never be mutated by render plugins.
  */
  source: ULDEPageSource;

  /**
  * Page-level metadata.
  *
  * Examples:
  * - title
  * - description
  * - tags
  * - breadcrumbs
  * - navigation
  */
  meta: Record<string, unknown>;
}

export interface ULDERenderContext {
  pageId: string;

  /**
  * Final AST after all render plugins.
  */
  ast: ULDEAstNode[];

  /**
  * Final generated HTML.
  */
  html: string;

  /**
  * Layout identifier.
  */
  layout?: ULDELayout;
  // layout?: string;

  // /**
  // * @deprecated
  // * Use executionContext.artifacts instead.
  // */
  // artifacts?: ULDEArtifacts;
}

/** runtime truth
 * role: current execution - contains everything necessary for a single lifecycle run
 * rule: one execution, one document and one lifecycle
 * lifetime: created -> executed -> disposed
 */
export interface ULDEExecutionContext {
  lifecyclePhase: ULDELifecyclePhase;
  page: ULDEPageContext;
  render?: ULDERenderContext;
  artifacts: ULDEArtifacts;
}

export interface ULDETocEntry {
  id: string;
  text: string;
  depth: number;
}

export interface ULDEAnchorEntry {
  id: string;
  text: string;
  depth: number;
}

export interface ULDESectionInfo {
  id: string;
  depth: number;
  title: string;
}

// navigation artifact
export interface ULDEInternalLinkInfo {

  /**
   * Example:
   * #pageId:docs/angular-readme
   */
  href: string;

  title?: string;
}

// external resource artifact
export interface ULDEExternalLinkInfo {

  /**
   * Visible label.
   */
  text: string;

  /**
   * External URL.
   */
  href: string;

  title?: string;

  target?: string;

  rel?: string;
}

export interface ULDECodeBlockInfo {
  language?: string;
  content: string;
}

/** runtime outputs
 * role: execution outputs which are just results produced during execution, not analytics, not history
 * rule: everything produced by plugins belongs here, including diagnostics that are outputs, and frame that represents the result of the execution
 */
export interface ULDEArtifacts {
  // Navigation
  toc: ULDETocEntry[];
  anchors: ULDEAnchorEntry[];
  sections: ULDESectionInfo[];

  // links
  internalLinks: ULDEInternalLinkInfo[];
  externalLinks: ULDEExternalLinkInfo[];

  // Content
  codeBlocks: ULDECodeBlockInfo[];

  // Diagnostics
  diagnostics: ULDEDiagnostic[];

  // navigation
  navigation?: ULDENavigationArtifact;

  // Runtime
  frame?: ULDEFrame;

  // Plugin Extension Area
  pluginData: Record<string, unknown>;

};



export interface ULDENavigationArtifact {

  pageId: string;

  scrollPosition: number;

  activeSectionId?: string;
  
  activeAnchorId?: string;
}

export interface ULDELayout {
  id: string;
  type:
    | 'book'
    | 'sidebar'
    | 'article'
    | 'api'
    | 'landing';
  responsive?: boolean;
  version?: string;
}

// Block Nodes
export interface ULDEHeadingNode extends ULDEAstNodeBase {
  type: 'heading';
  depth: number;
}

export interface ULDEParagraphNode extends ULDEAstNodeBase {
  type: 'paragraph';
}

export interface ULDEBlockquoteNode extends ULDEAstNodeBase {
  type: 'blockquote';
}

export interface ULDEListNode extends ULDEAstNodeBase {
  type: 'list';
  ordered: boolean;
  // meta: {
  //   ordered: boolean;
  // };
}

export interface ULDEListItemNode extends ULDEAstNodeBase {
  type: 'listItem';
}

export interface ULDETableNode extends ULDEAstNodeBase {
  type: 'table';
}

export interface ULDETableRowNode extends ULDEAstNodeBase {
  type: 'tableRow';
}

export interface ULDETableCellNode extends ULDEAstNodeBase {
  type: 'tableCell';
}

export interface ULDEThematicBreakNode extends ULDEAstNodeBase {
  type: 'thematicBreak';
}

// Inline Nodes
export interface ULDETextNode extends ULDEAstNodeBase {
  type: 'text';
  value: string;
}

export interface ULDEEmphasisNode extends ULDEAstNodeBase {
  type: 'emphasis';
}

export interface ULDEStrongNode extends ULDEAstNodeBase {
  type: 'strong';
}

export interface ULDEInlineCodeNode extends ULDEAstNodeBase {
  type: 'inlineCode';
  value: string;
}

export interface ULDEBreakNode extends ULDEAstNodeBase {
  type: 'break';
}

// ULE documentation navigation

export interface ULDELinkNodeBase
  extends ULDEAstNodeBase {
  /**
 * Example:
 * #pageId:docs/angular-readme, or
 * https://github.com/angular/angular-cli
 */
  href: string;
  /**
   * Optional metadata.
   */
  title?: string;
}

export interface ULDEInternalLinkNode
  extends ULDELinkNodeBase {

  type: 'internalLink';
}

// web navigation
export interface ULDEExternalLinkNode
  extends ULDELinkNodeBase {

  type: 'externalLink';

}

export interface ULDEImageNode extends ULDEAstNodeBase {
  type: 'image';
  src: string;
  alt?: string;
  title?: string;
}

// Structural Nodes
export interface ULDERootNode extends ULDEAstNodeBase {
  type: 'root';
}

export interface ULDESectionNode extends ULDEAstNodeBase {
  type: 'section';
  id?: string;
  depth?: number;
}

export interface ULDEFrontmatterNode extends ULDEAstNodeBase {
  type: 'frontmatter';
  meta: Record<string, unknown>;
}

// Code & Media Nodes
export interface ULDECodeNode extends ULDEAstNodeBase {
  type: 'code';
  lang?: string;
  value: string;
}

export interface ULDEFenceNode extends ULDEAstNodeBase {
  type: 'fence';
  lang?: string;
  value: string;
}

export interface ULDEMathNode extends ULDEAstNodeBase {
  type: 'math';
  value: string;
}

export interface ULDEInlineMathNode extends ULDEAstNodeBase {
  type: 'inlineMath';
  value: string;
}

// ULDE Custom Nodes
export interface ULDEUldeBlockNode extends ULDEAstNodeBase {
  type: 'uldeBlock';
  name: string;
  options?: Record<string, unknown>;
  // meta: {
  //   name: string;
  //   options?: Record<string, any>;
  // };
}

export interface ULDEAdmonitionNode extends ULDEAstNodeBase {
  type: 'admonition';
  kind:
  | 'info'
  | 'warning'
  | 'danger'
  | 'success';
  title?: string;
  // meta: {
  //   kind: 'info' | 'warning' | 'danger' | 'success';
  //   title?: string;
  // };
}

export interface ULDEDemoNode extends ULDEAstNodeBase {
  type: 'demo';
  id: string;
  code: string;
  language?: string;
  // meta: {
  //   id: string;
  //   code: string;
  //   lang?: string;
  // };
}

export interface ULDEComponentNode extends ULDEAstNodeBase {
  type: 'component';
  name: string;
  properties?: Record<string, unknown>;
  // meta: {
  //   name: string;
  //   props?: Record<string, any>;
  // };
}

export interface ULDETocNode extends ULDEAstNodeBase {
  type: 'toc';
}

export interface ULDEAnchorNode extends ULDEAstNodeBase {
  type: 'anchor';
  id: string;
  // meta: {
  //   id: string;
  // };
}

// Meta Nodes
export interface ULDEPositionNode extends ULDEAstNodeBase {
  type: 'position';
  start: { line: number; column: number };
  end: { line: number; column: number };
  // meta: {
  //   start: { line: number; column: number };
  //   end: { line: number; column: number };
  // };
}

export interface ULDEMetaNode extends ULDEAstNodeBase {
  type: 'meta';
  meta: Record<string, any>;
}

export interface ULDEDiagnosticNode extends ULDEAstNodeBase {
  type: 'diagnostic';
  level: ULDEDiagnosticLevel;
  message: string;
  code?: string;
  pluginName?: string;
  pluginKind?: ULDEPluginKind;
  lifecyclePhase?: ULDELifecyclePhase;
  // meta: {
  //   level: ULDEDiagnosticLevel;
  //   message: string;
  //   code?: string;
  //   lifecyclePhase?: ULDELifecyclePhase;
  //   pluginName?: string;
  //   pluginKind?: ULDEPluginKind;
  // };
}

// Full ULDE AST Node Type Union
export type ULDEAstNode =
  | ULDEHeadingNode
  | ULDEParagraphNode
  | ULDEBlockquoteNode
  | ULDEListNode
  | ULDEListItemNode
  | ULDETableNode
  | ULDETableRowNode
  | ULDETableCellNode
  | ULDEThematicBreakNode
  | ULDETextNode
  | ULDEEmphasisNode
  | ULDEStrongNode
  | ULDEInlineCodeNode
  | ULDEBreakNode
  | ULDEInternalLinkNode
  | ULDEImageNode
  | ULDERootNode
  | ULDESectionNode
  | ULDEFrontmatterNode
  | ULDECodeNode
  | ULDEExternalLinkNode
  | ULDEFenceNode
  | ULDEMathNode
  | ULDEInlineMathNode
  | ULDEUldeBlockNode
  | ULDEAdmonitionNode
  | ULDEDemoNode
  | ULDEComponentNode
  | ULDETocNode
  | ULDEAnchorNode
  | ULDEPositionNode
  | ULDEMetaNode
  | ULDEDiagnosticNode;
