// src/app/app.routes.ts

import type { Routes } from '@angular/router';
import { App } from './app';
import { PageNotFound } from './page-not-found/page-not-found';
import {Error} from './page-error/error';


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
    path: 'PageError',
    component: Error,
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
