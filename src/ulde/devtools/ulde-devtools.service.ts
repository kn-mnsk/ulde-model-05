// src/ulde/core/devtools/ulde-devtools.service.ts

import { computed, Injectable, signal, Signal } from '@angular/core';
import { ULDEDevtoolsSnapshot, ULDEExecutionContext, ULDEHeatmapCell, ULDEPluginKind, ULDEPluginStatistics, ULDETimelinePoint, ULDETrendSnapshot } from '@ulde/types';
import { ULDEDiagnostic } from '@ulde/types/diagnostics';
import { ULDEFrame } from '@ulde/types/frame';
import { ULDELifecyclePhase, ULDELifecyclePhaseTiming } from '@ulde/types/lifecycle';
import { ULDEPluginTiming } from '@ulde/types/timing';

@Injectable({ providedIn: 'root' })
export class ULDEDevtoolsService {

  // devtools visibility + controls
  $visible = signal(true);
  $pinned = signal(false);
  $opacity = signal(1);

  // Lifecycle state
  $lifecyclePhaseTimings = signal<ULDELifecyclePhaseTiming[]>([]);
  $currentLifecyclePhaseTiming = signal<ULDELifecyclePhaseTiming | null>(null);

  // Plugin timings
  $pluginTimings = signal<ULDEPluginTiming[]>([]);

  // Frames
  $frameHistory = signal<ULDEFrame[]>([]);
  $currentFrame = signal<ULDEFrame | undefined>(undefined);
  // Diagnostics
  $diagnostics = signal<ULDEDiagnostic[]>([]);

  // Analytics
  $timeline = signal<ULDETimelinePoint[]>([]);
  $heatMap = signal<ULDEHeatmapCell[]>([]);

  // Thresholds (tweakable)
  thresholds = {
    phaseWarn: 8,
    phaseError: 16,
  };

  // signal to update computed signal
  // Derived: sparkline points
  $sparklinePoints = computed(() => {
    const history = this.$frameHistory();
    let points: string;

    if (!history.length) {
      points = ''
    } else {
      points = history
        .map((f, i) => {
          const total = f.lifecyclePhaseTimings.reduce((a, p) => a + p.duration, 0);
          return `${i * 10},${40 - Math.min(total, 40)}`;
        })
        .join(' ');
    }

    console.log(`Log: [ULDEDevtoolsService] sparklinePoints`, points);

    return points;
  });
  // Derived: filtered plugin timings by lifecycle phase
  $filteredPluginTimings = computed(() => {
    const lifecyclePhaseTiming = this.$currentLifecyclePhaseTiming();
    const timings = this.$pluginTimings();

    if (!lifecyclePhaseTiming) return timings;
    return timings.filter(t => t.lifecyclePhase === lifecyclePhaseTiming.lifecyclePhase);
  });

  $pluginStats = computed<ULDEPluginStatistics[]>(() => {
    const timings = this.$pluginTimings();

    // sort by pluginKind, then by pluginName
    const tempResult1 = [...timings].sort((a, b) => {
      const pluginKindResult = safeCompare(a.pluginKind, b.pluginKind);
      if (pluginKindResult !== 0) {
        return pluginKindResult;
      }
      return safeCompare(a.pluginName, b.pluginName);
    }).map(t => { return { key: `${t.pluginKind},${t.pluginName}`, duration: t.duration }; }
    );

    // source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/
    const max: Record<string, number[]> = Object.create(null);
    const statsByKey = tempResult1.reduce((acc: Record<string, ULDEPluginStatistics>, curr) => {

      if (!acc[curr.key]) {
        acc[curr.key] = {
          pluginName: curr.key.split(',')[1],
          pluginKind: curr.key.split(',')[0] as ULDEPluginKind,
          executions: 0,
          averageDuration: 0,
          maxDuration: 0,
          totalDuration: 0
        }
        max[curr.key] = [];
      }

      acc[curr.key].pluginName = acc[curr.key].pluginName;
      acc[curr.key].pluginKind = acc[curr.key].pluginKind;
      max[curr.key].push(curr.duration);
      acc[curr.key].executions = acc[curr.key].executions + 1;
      acc[curr.key].totalDuration = acc[curr.key].totalDuration + curr.duration;
      acc[curr.key].averageDuration = (acc[curr.key].executions !== 0) ? acc[curr.key].totalDuration / acc[curr.key].executions : 0;
      acc[curr.key].maxDuration = Math.max(...max[curr.key]);

      return acc;
    },

      Object.create(null)
    );

    return Object.entries(statsByKey).map(([k, v]) => {
      return v;
    })
  });

  $trendSnashot = computed<ULDETrendSnapshot>(() => {

    const pluginInfo = [...this.$pluginTimings()].filter(t => {
      return t.duration !== 0;
    }
    ).sort((a, b) => {
      return safeCompare(a.pluginName, b.pluginName);
    }).map(t => {
      return { pluginname: t.pluginName, duration: t.duration };
    }).reduce((acc: Record<string, { duration: number; executions: number, averageDuration: number }>, curr) => {

      if (!acc[curr.pluginname]) {
        acc[curr.pluginname] = {
          duration: 0,
          executions: 0,
          averageDuration: 0
        }
      }

      acc[curr.pluginname].duration = acc[curr.pluginname].duration + curr.duration;
      acc[curr.pluginname].executions = acc[curr.pluginname].executions + 1;
      acc[curr.pluginname].averageDuration = acc[curr.pluginname].executions !== 0 ? acc[curr.pluginname].duration / acc[curr.pluginname].executions : 0;

      return acc;
    },
      Object.create(null)
    );

    const { totalDurations, totalExecutions } = Object.entries(pluginInfo).map(([k, v]) => {
      return v;
    }).reduce((acc: { totalDurations: number; totalExecutions: number }, curr) => {
      const totalDurations = acc.totalDurations ?? 0;
      const totalExecutions = acc.totalExecutions ?? 0;

      acc.totalDurations = totalDurations + curr.duration;
      acc.totalExecutions = totalExecutions + curr.executions;

      return acc;
    },
      Object.create(null)
    );

    const averagePluginDuration = totalExecutions !== 0 ? totalDurations / totalExecutions : 0;

    const slowestPlugin = Object.entries(pluginInfo).map(([k, v]) => {
      return { pluginName: k, averageDuration: v.averageDuration };
    }).sort((a, b) => {
      return b.averageDuration - a.averageDuration;
    })[0];

    const frameInfo = [...this.$frameHistory()].map(f => {
      return {
        id: f.id, frameDuration: f.lifecyclePhaseTimings.map(t => t.duration).reduce((acc, curr) => {
          acc = acc + curr;
          return acc;
        })
      };
    }, 0);

    const worstFrameDuration = [...frameInfo].sort((a, b) => {
      return b.frameDuration - a.frameDuration;
    }).flat()[0].frameDuration;

    const { totalFrameDurations, totalFrameExecutions } = [...frameInfo].reduce((acc: { totalFrameDurations: number, totalFrameExecutions: number }, curr) => {
      const totalDurations = acc.totalFrameDurations ?? 0;
      const totalExecutions = acc.totalFrameExecutions ?? 0;

      acc.totalFrameDurations = totalDurations + curr.frameDuration;
      acc.totalFrameExecutions = totalExecutions + 1;
      return acc;
    },
      Object.create(null)
    )

    const averageFrameDuration = totalFrameDurations !== 0 ? totalFrameDurations / totalFrameExecutions : 0;

    return {
      averageFrameDuration: averageFrameDuration,
      worstFrameDuration: worstFrameDuration,
      averagePluginDuration: averagePluginDuration,
      slowestPlugin: slowestPlugin,
      regressionDetected: false // TO BE CLARIFIED: MEANING
    };

  });




  $generateDevtoolsSnapshot(executionContext: ULDEExecutionContext): Signal<ULDEDevtoolsSnapshot> {

    executionContext.artifacts.diagnostics = this.$diagnostics();
    executionContext.artifacts.frame = this.$currentFrame();

    return computed(() => {
      return {
        executionContext: executionContext,
        frameHistory: this.$frameHistory(),
        analytics: {
          timeline: this.$timeline(),
          heatMap: this.$heatMap(),
          trends: this.$trendSnashot(),
          pluginStats: this.$pluginStats(),
        }
      }
    });
  }


  constructor() { }

  // Frame lifecycle
  startPhase(lifecyclePhase: ULDELifecyclePhase) {
    this.$currentLifecyclePhaseTiming.set({
      lifecyclePhase,
      startTime: performance.now(),
      endTime: 0,
      duration: 0,
    });
  }
  endPhase(lifecyclePhase: ULDELifecyclePhase) {
    const phase = this.$currentLifecyclePhaseTiming();
    if (!phase || phase.lifecyclePhase !== lifecyclePhase) return;

    const end = performance.now();
    const duration = end - phase.startTime;

    const updatedPhase: ULDELifecyclePhaseTiming = {
      ...phase,
      endTime: end,
      duration,
    };

    this.$lifecyclePhaseTimings.update(list => [...list, updatedPhase]);
    this.$currentLifecyclePhaseTiming.set(null);
  }
  finalizeFrame() {
    const frame: ULDEFrame = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      lifecyclePhaseTimings: this.$lifecyclePhaseTimings(),
      pluginTimings: this.$pluginTimings()
    };

    this.$frameHistory.update(list => [...list.slice(-50), frame]); // keep last 50 frames

    this.$heatMap.set(this.buildHeatmap());
    this.$timeline.set(this.buildTimeline());
    this.generateWarnings();
    this.$currentFrame.set(frame);

    // reset for next frame
    this.$lifecyclePhaseTimings.set([]);
    // this.$pluginTimings.set([]);
  }

  // Diagnostics
  addDiagnostic(diag: ULDEDiagnostic) {
    this.$diagnostics.update(list => [...list, diag]);
  }
  /**
   * Generate warnings based on patterns in frame history.
   */
  generateWarnings() {
    const frameHistory = this.$frameHistory();
    if (frameHistory.length < 3) return;

    const lastThree = frameHistory.slice(-3);
    const durations = lastThree.map(f =>
      f.lifecyclePhaseTimings.reduce((sum, p) => sum + p.duration, 0)
    );

    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const last = durations[durations.length - 1];

    // Sudden spike detection
    if (last > avg * 1.5) {
      this.addDiagnostic({
        level: 'warn',
        message: `Frame duration spike detected: ${last.toFixed(1)}ms (avg ${avg.toFixed(1)}ms)`
      });
    }

    // Consistent slowdown detection
    if (durations.every(d => d > avg)) {
      this.addDiagnostic({
        level: 'warn',
        message: `Consistent slowdown across last 3 frames`
      });
    }
  }

  // Analytics
  /**
   * Plugin timing recording
   * @param timing
   */
  recordPluginTiming(timing: ULDEPluginTiming) {
    this.$pluginTimings.update(list => [...list, timing]);
  }
  /**
     * Build a timeline of frames with total durations.
     */
  buildTimeline(): ULDETimelinePoint[] {
    return this.$frameHistory().map(frame => {
      const total = frame.lifecyclePhaseTimings.reduce((sum, p) => sum + p.duration, 0);

      return {
        frameId: frame.id,
        timeStamp: frame.timestamp,
        totalDuration: total,
        phases: frame.lifecyclePhaseTimings.map(p => ({
          lifecyclePhase: p.lifecyclePhase,
          duration: p.duration
        }))
      };
    });
  }
  /**
   * Generate a heatmap of plugin performance.
   * Normalizes plugin durations across all frames.
   */
  buildHeatmap(): ULDEHeatmapCell[] {
    const frameHistory = this.$frameHistory();
    const timings = frameHistory.flatMap(f => f.pluginTimings);

    if (!timings.length) return [];

    const max = Math.max(...timings.map(t => t.duration));

    return timings.map(t => ({
      pluginKind: t.pluginKind,
      pluginName: t.pluginName,
      hookName: t.hookName,
      lifecyclePhase: t.lifecyclePhase,
      intensity: t.duration / max // normalized 0–1
    }));
  }

  // UI - control methods
  toggle() {
    this.$visible.update(v => !v);
    console.log(`Log: [UldeDevtoolsService] toggle90 => $visible()=`, this.$visible());
  }
  pin() {
    this.$pinned.update(p => !p);
  }
  setOpacity(value: number) {
    this.$opacity.set(value);
  }

}

// Safe string comparison function
function safeCompare(a: string | null, b: string | null): number {
  const strA = a ?? ""; // Treat null/undefined as empty string
  const strB = b ?? "";
  return strA.localeCompare(strB, undefined, { sensitivity: "base" });
}
