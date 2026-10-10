// src/ulde/core/devtools/panels/diagnostics/ulde-devtools-diagnostics.panel.ts

import { Component, input, signal, ViewChild, ElementRef } from '@angular/core';
import { ULDEDiagnostic } from '@ulde/types/diagnostics';

@Component({
  selector: 'ulde-devtools-diagnostics-panel',
  standalone: true,
  templateUrl: './ulde-devtools-diagnostics.panel.html',
  styleUrl: './ulde-devtools-diagnostics.panel.scss',
})
export class UldeDevToolsDiagnosticsPanel {

  @ViewChild('diagnosticsHost', { static: true })
  hostRef!: ElementRef<HTMLElement>;

  $diagnostics = input<ULDEDiagnostic[]>();
  // $highlight = output<string>();

  $expanded = signal(true);

  toggle() {
    this.$expanded.update(v => !v);
  }

  trackDiag(i: number, d: ULDEDiagnostic) {
    return `${d.level}-${d.message}-${i}`;
  }

  onHighlight(msg: string) {
    const nodes = this.hostRef.nativeElement.querySelectorAll('.body .ulde-item .msg');

    nodes.forEach(n => {
      if (n.textContent?.includes(msg)) {
        n.classList.add('ulde-diagnostic-highlight');

        setTimeout(() => {
          n.classList.remove('ulde-diagnostic-highlight');
        }, 1500);
      }
    });
  }


}
