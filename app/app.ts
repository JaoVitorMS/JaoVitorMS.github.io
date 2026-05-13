import { Component } from '@angular/core';
import { ComingSoonComponent } from './components/coming-soon/coming-soon';
import { GameListComponent } from './components/game-list/game-list';
import { SortingTeams } from './components/sorting-teams/sorting-teams';
import { siteMode } from './site-mode';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ComingSoonComponent, GameListComponent, SortingTeams],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly siteMode = siteMode;
}
