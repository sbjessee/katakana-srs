import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { isDevMode } from '@angular/core';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

// Register service worker for PWA support
if (!isDevMode() && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/ngsw-worker.js');
}
