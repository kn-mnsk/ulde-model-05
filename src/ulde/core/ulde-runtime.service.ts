// src/ulde/core/ulde-runtime.service.ts

import { Injectable } from '@angular/core';
import {ULDEDevtoolsService } from '@ulde/devtools';
import { ULDEFrame } from '@ulde/types/frame';


@Injectable({ providedIn: 'root' })
export class ULDERuntimeService {
  // Simple thresholds (tune as needed)
  private phaseWarnThreshold = 12;   // ms
  private phaseErrorThreshold = 24;  // ms
  private pluginWarnThreshold = 8;   // ms
  private pluginErrorThreshold = 16; // ms

  constructor(
    private devtoolsService: ULDEDevtoolsService,

  ) { }

  /**
   * Called at the end of each full lifecycle (afterRender).
   * Orchestrates fro
   * ame finalization + anomaly detection.
   */
  finalizeFrameAndAnalyze() {
    this.devtoolsService.finalizeFrame();

    const frame = this.devtoolsService.$currentFrame();
    if (!frame) return;

    this.detectPhaseAnomalies(frame);
    this.detectPluginAnomalies(frame);
  }

  private detectPhaseAnomalies(frame: ULDEFrame) {
    for (const phase of frame.lifecyclePhaseTimings) {
      if (phase.duration > this.phaseErrorThreshold) {
        this.devtoolsService.addDiagnostic({
          level: 'error',
          message: `Lifecycle phase "${phase.lifecyclePhase}" exceeded error threshold (${this.phaseErrorThreshold}ms): ${phase.duration.toFixed(1)}ms`,
          lifecyclePhase: phase.lifecyclePhase,
        });
      } else if (phase.duration > this.phaseWarnThreshold) {
        this.devtoolsService.addDiagnostic({
          level: 'warn',
          message: `Lifecycle phase "${phase.lifecyclePhase}" exceeded warn threshold (${this.phaseWarnThreshold}ms): ${phase.duration.toFixed(1)}ms`,
          lifecyclePhase: phase.lifecyclePhase,
        });
      }
    }
  }

  private detectPluginAnomalies(frame: ULDEFrame) {
    for (const t of frame.pluginTimings) {
      if (t.duration > this.pluginErrorThreshold) {
        this.devtoolsService.addDiagnostic({
          level: 'error',
          message: `Plugin "${t.pluginName}" in hook "${t.hookName}" exceeded error threshold (${this.pluginErrorThreshold}ms): ${t.duration.toFixed(1)}ms`,
          pluginName: t.pluginName,
          lifecyclePhase: t.lifecyclePhase,
        });
      } else if (t.duration > this.pluginWarnThreshold) {
        this.devtoolsService.addDiagnostic({
          level: 'warn',
          message: `Plugin "${t.pluginName}" in hook "${t.hookName}" exceeded warn threshold (${this.pluginWarnThreshold}ms): ${t.duration.toFixed(1)}ms`,
          pluginName: t.pluginName,
          lifecyclePhase: t.lifecyclePhase,
        });
      }
    }
  }

  // in ULDERuntimeService
  // async runForPage(pageCtx: ULDEPageContext, renderCtx: ULDERenderContext) {
  //   await this.lifecycle.run(pageCtx, renderCtx);
  //   this.finalizeFrameAndAnalyze();
  // }

}
