// src/ulde/core/devtools/panels/plugin-timeline/ulde-devtools-plugin-timeline.panel.ts

import { Component, computed, input } from '@angular/core';
import { ULDEPluginKind } from '@ulde/types/plugin';
import { ULDEPluginTiming } from '@ulde/types/timing';

@Component({
  selector: 'ulde-devtools-plugin-timeline-panel',
  imports: [],
  templateUrl: './ulde-devtools-plugin-timeline.panel.html',
  styleUrl: './ulde-devtools-plugin-timeline.panel.scss',
})
export class UldeDevtoolsPluginTimelinePanel {

  total: number = 0;

  $pluginTimings = input<ULDEPluginTiming[]>();


  $plugins = computed(() => {
    const list = this.$pluginTimings() ?? [];
    if (list.length === 0) return [];

    this.total = list.reduce((sum, p) => sum + p.duration, 0) || 1;

    return list
      .slice()
      .sort((a, b) => b.duration - a.duration)
      .map(p => ({
        label: `${p.pluginName} (${p.hookName})`,
        duration: p.duration,
        ratio: p.duration / this.total,
        color: pluginColor(p.pluginKind),
        phase: p.lifecyclePhase,
        kind: p.pluginKind,
      }));
  });
}

function pluginColor(kind: ULDEPluginKind) {
  switch (kind) {
    // switch (kind) {
    case 'content': return '#4caf50';
    case 'layout': return '#2196f3';
    case 'interactive': return '#ff9800';
    case 'navigation': return '#9c27b0';
    case 'demo': return '#e91e63';
    case 'ulde': return '#9e9e9e';
    default: return '#cccccc';
  }
}
