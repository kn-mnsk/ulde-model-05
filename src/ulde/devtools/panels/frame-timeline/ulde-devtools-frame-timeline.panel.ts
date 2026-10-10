// src/ulde/core/devtools/panels/frame-timeline/ulde-devtools-frame-timeline.panel.ts

import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ULDELifecyclePhase, ULDETimelinePoint } from '@ulde/types';

@Component({
  selector: 'ulde-devtools-frame-timeline-panel',
  imports: [DatePipe],
  templateUrl: './ulde-devtools-frame-timeline.panel.html',
  styleUrl: './ulde-devtools-frame-timeline.panel.scss',
})
export class UldeDevtoolsFrameTimelinePanel {

  $thresholds = input<any>();

  $timelines = input<ULDETimelinePoint[]>();


  phaseColor(phase: ULDELifecyclePhase) {
    switch (phase) {
      case 'init': return '#607d8b';
      case 'load': return '#03a9f4';
      case 'render': return '#4caf50';
      case 'hydrate': return '#9c27b0';
      case 'afterRender': return '#9e9e9e';
      default: return '#cccccc';
    }
  }
}

