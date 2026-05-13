import { signal } from '@angular/core';

export type SiteMode = 'game-list' | 'sorting-teams' | 'coming-soon';

export const siteMode = signal<SiteMode>('game-list');
