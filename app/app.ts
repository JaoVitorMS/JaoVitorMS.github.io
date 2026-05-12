import { Component } from '@angular/core';
import { GameListComponent } from './components/game-list/game-list';
import {PresenceFormComponent} from "./components/presence-form/presence-form";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GameListComponent, PresenceFormComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}

