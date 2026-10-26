// src/ulde/plugins/system/ulde/ulde-devtools-panel.plugin.ts

import { ULDEExecutionContext } from "@ulde/types";
import { ULDEPluginInstance, ULDEPluginKind } from "@ulde/types/plugin";

export class ULDEDevToolsPanelPlugin implements ULDEPluginInstance {
  pluginKind: ULDEPluginKind = 'ulde';
  pluginName = "ULDEDevToolsPanelPlugin";
  description = "Adds a custom panel to the ULDE Devtools";
  enabled = true;
  // onInit() {
  //   const panel = document.createElement("div");
  //   panel.className = "ulde-custom-panel";
  //   panel.innerHTML = "<strong>Custom ULDE Panel</strong>";
  //   document.body.appendChild(panel);
  // },

  async run(ctx: ULDEExecutionContext) {

    if (ctx.lifecyclePhase !== 'afterRender') return;
    if (!ctx.render) return;


    const panel = document.createElement("div");
    panel.className = "ulde-devtools-panel";
    panel.innerHTML = "<strong>Custom DevTools Panel</strong>";
    const appRoot = document.querySelector('app-root');
    appRoot?.appendChild(panel);
    // document.body.appendChild(panel);

    // const customPanel: string = `
    //   <div class="ulde-custom-panel">
    //   <strong>Custom ULDE Panel</strong>
    //   </div>
    //   `;

    // const html = ctx.render.html;
    // ctx.render.html = html + customPanel;
    // ctx.html = customPanel;

  };

}



// legacy

// export const ULDEOverlayCustomPanelPlugin: ULDEPlugin = {
//   pluginKind: 'ulde',
//   pluginName: "OverlayCustomPanel",
//   description: "Adds a custom panel to the ULDE overlay",
//   enabled: true,
//   hooks: {
//     // onInit() {
//     //   const panel = document.createElement("div");
//     //   panel.className = "ulde-custom-panel";
//     //   panel.innerHTML = "<strong>Custom ULDE Panel</strong>";
//     //   document.body.appendChild(panel);
//     // },

//     async onAfterRender(ctx) {

//       const customPanel: string = `
//       <div class="ulde-custom-panel">
//       <strong>Custom ULDE Panel</strong>
//       </div>
//       `;

//       ctx.html = ctx.html + customPanel;
//       // ctx.html = customPanel;

//     }

//   }
// };

