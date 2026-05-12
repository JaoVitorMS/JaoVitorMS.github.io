import { Component } from '@angular/core';
import { GameListComponent } from './components/game-list/game-list';
import { ComingSoon } from './components/coming-soon/coming-soon';
import { siteMode } from './site-mode';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GameListComponent, ComingSoon],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly siteMode = siteMode;
}
