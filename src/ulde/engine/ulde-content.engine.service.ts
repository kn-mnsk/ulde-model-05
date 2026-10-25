// src/ulde/engine/ulde-content.engine.service.ts

import { inject, Injectable } from '@angular/core';

import { navigate } from '../../app/global.utils/global.utils';
import { Router } from '@angular/router';


import MarkdownIt from 'markdown-it';

import Token from 'markdown-it/lib/token.mjs';


@Injectable({
  providedIn: 'root',
})
export class ContentEngineService {

  title = "ContentEngineService";

  async load(pageId: string): Promise<string | undefined> {
    /* existing loader */


    const url = `assets/${pageId}.md`;

    try {
      const response = await fetch(url);

      if (response.redirected) {
        const router = inject(Router);
        navigate(router, ['PageNotFound']);
        throw new Error(`Invalid URL: ${url}`);
      }

      const raw = await response.text();

      // console.log(`Log: ${this.title} load \npageId=`, pageId, `\nmarkdwon raw=\n`, raw);

      return raw;

    } catch (err) {
      console.error(`${this.title} load() pageId=${pageId} error:`, err);
      return undefined;
    }

  }
  async transform(raw: string): Promise<Token[]> {
    /* existing parser */

    const md = new MarkdownIt({
      html: true
    });
    // const md = new MarkdownIt();
    const tokens = md.parse(raw, {});

    // console.log(`Log: [${this.title}] tokens=\n`, tokens);

    return tokens;

  }
}
