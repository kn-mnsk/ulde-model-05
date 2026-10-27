// src/ulde/viewer/services/ulde-scrollspy.service
/**
 * Ownership
 *
1. Observe sections
2. Track active section
3. Track visibility ratios
4. Track heading changes
 */

import { Injectable } from '@angular/core';
import { ULDEExecutionContext } from '@ulde/types';

@Injectable({
  providedIn: 'root',
})
export class UldeScrollspyService {

  private observer?: IntersectionObserver;

  observe(
    host: HTMLElement,
    ctx: ULDEExecutionContext
  ) {

    const sections =
      host.querySelectorAll('section');

    this.observer =
      new IntersectionObserver(
        entries => {

          const active =
            entries.find(
              e => e.isIntersecting
            );

          if (!active) {
            return;
          }

          const id =
            active.target.getAttribute(
              'data-section-id'
            );

          if (!ctx.artifacts.navigation || !id) return;

          ctx.artifacts.navigation = {
            ...ctx.artifacts.navigation,
            activeSection: id
          };

        },
        {
          root: host,
          rootMargin:
            '-20% 0px -60% 0px',
          threshold: 1
        }
      );

    sections.forEach(
      s => this.observer?.observe(s)
    );

  };

  disconnect() {

    this.observer?.disconnect();

    this.observer = undefined;
  };

}
