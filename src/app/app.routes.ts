// src/app/app.routes.ts

import type { Routes } from '@angular/router';
import { App } from './app';
import { PageNotFound } from './page-not-found/page-not-found';


export const routes: Routes = [
  {
    path: 'home',
    component: App,
    // loadComponent: () =>
    //   import('./app')
    //     .then(m => m.App)
  },
  {
    path: 'PageNotFound',
    component: PageNotFound,
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: '**',
    component: PageNotFound,
  }
];
