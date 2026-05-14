import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PresenceFormComponent } from '../presence-form/presence-form';
import { PlayersService, Player } from '../../services/players';

@Component({
  selector: 'app-game-list',
  standalone: true,
  imports: [CommonModule, PresenceFormComponent],
  templateUrl: './game-list.html',
  styleUrl: './game-list.css'
})
export class GameListComponent implements OnInit, OnDestroy {
  players = signal<Player[]>([]);

  gameInfo = {
    day: 'Sábado 16 de Maio',
    time: '21h00',
    local: 'MCM',
    quadra: '5',
    totalPrice: 135,
    hiredGoaliePrice: 0,
  };

  totalPlayersCount = computed(() => this.players().length);
  finalTotal = computed(() => this.gameInfo.totalPrice + (this.gameInfo.hiredGoaliePrice || 0));
  pricePerPlayer = computed(() => {
    const count = this.totalPlayersCount();
    return count > 0 ? (this.finalTotal() / count).toFixed(2) : '0';
  });

  private subscription?: Subscription;

  constructor(private playersService: PlayersService) {}

  ngOnInit() {
    this.subscription = this.playersService.pollPlayers().subscribe({
      next: (text) => {
        const parsed = this.playersService.parsePlayers(text);
        if (parsed.length) {
          this.players.set(parsed);
        }
      },
      error: (err) => console.error('Erro ao carregar sheet:', err)
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  handleAddPlayer(newName: string) {
    const newPlayer: Player = {
      name: newName,
      isPaid: false,
      status: '(atualize para fixar)',
      id: `temp-${Date.now()}`,
    };
    this.players.update(prev => [...prev, newPlayer]);
  }
}
