// src/app/app.ts

import { Component, signal } from '@angular/core';
import { UldeConfigurator } from '../ulde/configurator/ulde-configurator';

@Component({
  selector: 'app-root',
  imports: [UldeConfigurator],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('App');

}
