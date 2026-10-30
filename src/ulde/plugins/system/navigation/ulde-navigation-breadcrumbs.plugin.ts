// src/ulde/plugins/system/navigation/ulde-navigation-breadcrumbs.plugin.ts

import { ULDEExecutionContext } from "@ulde/types";
import { ULDEPluginInstance, ULDEPluginKind } from "@ulde/types/plugin";

export class ULDENavigationBreadcrumbsPlugin implements ULDEPluginInstance {
  pluginKind: ULDEPluginKind = 'navigation';
  pluginName = "ULDENavigationBreadcrumbsPlugin";
  description = "Generates breadcrumb navigationfrom route";
  enabled = true;
  async run(ctx: ULDEExecutionContext) {

    if (ctx.lifecyclePhase !== 'load') return;
    if (ctx.page.source.raw === undefined) return;

    // console.log('Log: [ULDENavigationBreadcrumbsPlugin] run');

    const parts = ctx.page.source.raw.split("/").filter(Boolean);
    const breadCrumbs = parts.map((p, i) => ({ label: p, href: "/" + parts.slice(0, i + 1).join("/") }));

    ctx.artifacts.pluginData['breadcrumbs'] = breadCrumbs;

    // console.log('Log: [ULDENavigationBreadcrumbsPlugin] finished');


  }

}





// legacy

// import { ULDEPlugin } from "@ulde/types/plugin";

// export const ULDENavigationBreadcrumbsPlugin: ULDEPlugin = {
//   pluginKind: 'navigation',
//   pluginName: "ULDENavigationBreadcrumbsPlugin",
//   description: "Generates breadcrumb navigation from route",
//   enabled: true,
//   hooks: {
//     onPageLoad(ctx) {
//       const parts = ctx.source.raw.split("/").filter(Boolean);
//       ctx.meta['breadcrumbs'] = parts.map((p, i) => ({
//         label: p,
//         href: "/" + parts.slice(0, i + 1).join("/")
//       }));
//     }
//   }
// }
