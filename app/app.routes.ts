import { Routes } from '@angular/router';
import { GameListComponent } from './components/game-list/game-list';
import { SortingTeams } from './components/sorting-teams/sorting-teams';

export const routes: Routes = [
  { path: '', redirectTo: 'game-list', pathMatch: 'full' },
  { path: 'game-list', component: GameListComponent },
  { path: 'sorting-teams', component: SortingTeams },
  { path: '**', redirectTo: 'game-list' }
];
