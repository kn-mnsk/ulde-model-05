// src/ulde/plugins/system/ulde/ulde-timeline-profiler.plugin.ts

import { ULDEExecutionContext } from "@ulde/types";
import { ULDEPluginInstance, ULDEPluginKind } from "@ulde/types/plugin";

export class ULDETimelineProfilerPlugin implements ULDEPluginInstance {
  pluginKind: ULDEPluginKind = 'ulde';
  pluginName = "ULDETimelineProfilerPlugin";
  description = "Logs ULDE phase durations to console";
  enabled = true;
  async run(ctx: ULDEExecutionContext) {

    if (ctx.lifecyclePhase !== 'afterRender') return;

    if (!ctx.artifacts) return;

    // console.log("[ULDE] Timeline profiler initialized");
  };

}





// legacy
// export const ULDETimelineProfilerPlugin: ULDEPlugin = {
//   pluginKind: 'ulde',
//   pluginName: "TimelineProfiler",
//   description: "Logs ULDE phase durations to console",
//   enabled: true,
//   hooks: {
//     onInit() {
//       console.log("[ULDE] Timeline profiler initialized");
//     },

//     onDestroy() {
//       console.log("[ULDE] Timeline profiler destroyed");
//     }
//   }
// };
// //
