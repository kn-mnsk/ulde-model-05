// src/ulde/viewer/theme-toggle/theme-toggle.ts

import { Component, signal, output } from '@angular/core';
import { defaultThemeName } from '@ulde/viewer';
import type { ThemeName } from '@ulde/viewer';

@Component({
  selector: 'ulde-viewer-theme-toggle',
  imports: [],
  templateUrl: './ulde-viewer-theme-toggle.html',
  styleUrl: './ulde-viewer-theme-toggle.scss',
})
export class UldeViewerThemeToggle {


  $toggleTheme = output<ThemeName>();
  // @Output() toggleTheme = new EventEmitter<void>();

  // Local UI state (optional)
  $themeName = signal<ThemeName>(defaultThemeName);

  toggle() {
    this.$themeName.update((v: ThemeName) => (v === 'dark') ? 'light': 'dark');
    this.$toggleTheme.emit(this.$themeName());
    // console.log(`Log: [ThemeToggle] isDark=`, this.isDark());
  }
}
