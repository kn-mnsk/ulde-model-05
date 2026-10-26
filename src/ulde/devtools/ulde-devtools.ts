// src/ulde/devtools/ulde-devtools.ts

import { DatePipe, DecimalPipe, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { ULDERendererState } from '@ulde/types';
import { ULDEDevToolsTab } from '@ulde/types/devtools';
import { ULDEDiagnostic } from '@ulde/types/diagnostics';
import { ULDEFrame } from '@ulde/types/frame';
import { ULDELifecyclePhaseTiming } from '@ulde/types/lifecycle';
import { UldeDevToolsDiagnosticsPanel, UldeDevtoolsFrameTimelinePanel, UldeDevtoolsPluginTimelinePanel, UldeDevtoolsRuntimeInspectorPanel, ULDEDevtoolsService } from '.';

@Component({
  selector: 'ulde-devtools',
  standalone: true,
  imports: [
    DecimalPipe, DatePipe, JsonPipe,
    UldeDevToolsDiagnosticsPanel,
    UldeDevtoolsFrameTimelinePanel,
    UldeDevtoolsRuntimeInspectorPanel,
    UldeDevtoolsPluginTimelinePanel,

  ],
  templateUrl: './ulde-devtools.html',
  styleUrl: './ulde-devtools.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ULDEDevtools {

  $rendererState = input<ULDERendererState>()

  $highlight = output<string>();

  // Declare signals
  $snapshot = computed(() => this.$rendererState()?.devtoolsSnapshot);
  $sparklinePoints!: typeof this.devtoolsService.$sparklinePoints;

  $visible!: typeof this.devtoolsService.$visible;
  $pinned!: typeof this.devtoolsService.$pinned;
  $opacity!: typeof this.devtoolsService.$opacity;

  thresholds!: typeof this.devtoolsService.thresholds;

  $activeTab = signal<ULDEDevToolsTab>('diagnostics');

  selectTab(tab: ULDEDevToolsTab) {
    this.$activeTab.set(tab);
  }

  constructor(
    private devtoolsService: ULDEDevtoolsService,
  ) {

    this.$sparklinePoints = devtoolsService.$sparklinePoints;

    this.$visible = devtoolsService.$visible;
    this.$pinned = devtoolsService.$pinned;
    this.$opacity = devtoolsService.$opacity;

    this.thresholds = devtoolsService.thresholds;

    // effect(() => {
    //   // for debug
    //   if (!this.$rendererState()) return;
    //   console.log(`Log: [UldeDevTools] effect() $rendererState:\n`, this.$rendererState());

    // })

  }

  // UI actions
  toggleDevTools() {
    this.devtoolsService.toggle();
  }

  pinDevTools() {
    this.devtoolsService.pin();
  }

  setDevToolsOpacity(value: number) {
    this.devtoolsService.setOpacity(value);
  }

  // Phase selection (for filtering plugin timings)
  selectPhase(phase: ULDELifecyclePhaseTiming) {
    this.devtoolsService.$currentLifecyclePhaseTiming.set(phase);
  }

  clearPhaseSelection() {
    this.devtoolsService.$currentLifecyclePhaseTiming.set(null);
  }

  // Frame selection (for timeline/sparkline)
  selectFrame(frame: ULDEFrame) {
    this.devtoolsService.$currentFrame.set(frame);
  }


  trackDiag(i: number, d: ULDEDiagnostic) {
    return `${d.level}-${d.message}-${i}`;
  }

  onHighlight(msg: string) {
    this.$highlight.emit(msg);
  }
}
