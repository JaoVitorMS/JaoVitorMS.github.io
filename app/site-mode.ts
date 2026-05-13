import { signal } from '@angular/core';

export type SiteMode = 'game-list' | 'coming-soon';

export const siteMode = signal<SiteMode>('game-list');
// export const siteMode = signal<SiteMode>('coming-soon');
