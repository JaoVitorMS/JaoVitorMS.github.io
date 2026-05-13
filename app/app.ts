import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ComingSoonComponent } from './components/coming-soon/coming-soon';
import { siteMode } from './site-mode';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ComingSoonComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly siteMode = siteMode;
}
