// src/app/app.routes.ts

import type { Routes } from '@angular/router';;


export const routes: Routes = [

  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./app')
        .then(m => m.App)
  },
  {
    path: 'PageNotFound',
    loadComponent: () => import('./page-not-found/page-not-found').then(m => m.PageNotFound)
  },

  {
    path: '**',
    redirectTo: 'PageNotFound'
  }
];
