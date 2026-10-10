// src/ulde/plugins/system/demo/ulde-playground-injector.plugin.ts

import { ULDEPluginInstance, ULDEPluginKind } from "@ulde/types/plugin";

import { createComponent, EnvironmentInjector } from "@angular/core";
import { Example01 } from "../../../../app/demo/example01/example01"; // TBD
import { ULDEExecutionContext } from "@ulde/types";

export class ULDEPlaygroundInjectorPlugin implements ULDEPluginInstance {
  pluginKind: ULDEPluginKind = 'demo';
  pluginName = "ULDEPlaygroundInjectorPlugin";
  description = "Hydrates <demo-playground> blocks into live Angular components";
  enabled = true;
  async run(ctx: ULDEExecutionContext) {

    if (ctx.lifecyclePhase !== 'hydrate') return;
    if (!ctx.render) return;

    const placeholders = document.querySelectorAll("demo-playground");
    // You must provide the Angular environment injector
    const injector = (window as any).ngEnvironment as EnvironmentInjector;

    for (const el of placeholders) {
      const cmpRef = createComponent(Example01, {
        hostElement: el,
        environmentInjector: injector
      });

      cmpRef.changeDetectorRef.detectChanges();
    }
  }
}

