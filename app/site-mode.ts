import { signal } from '@angular/core';

export type SiteMode = 'game-list' | 'sorting-teams' | 'coming-soon';

export const siteMode = signal<SiteMode>('game-list');
// export const siteMode = signal<SiteMode>('sorting-teams');
// export const siteMode = signal<SiteMode>('coming-soon');
