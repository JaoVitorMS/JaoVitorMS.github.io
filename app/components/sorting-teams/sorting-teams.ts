import { Component, OnDestroy, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Player, PlayersService } from "../../services/players";
import { Subscription } from "rxjs";

@Component({
  selector: "app-sorting-teams",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./sorting-teams.html",
  styleUrl: "./sorting-teams.css",
})
export class SortingTeams implements OnInit, OnDestroy {
  players = signal<Player[]>([]);
  teamA = signal<Player[]>([]);
  teamB = signal<Player[]>([]);

  private readonly FIXED_TEAM_A = [
    "Dindo Pedro",
    "Thiago",
    "Matheus",
    "JV",
    "Jeferson",
  ];

  private subscriptions?: Subscription;

  constructor(private playersService: PlayersService) {}

  ngOnInit() {
    this.subscriptions = this.playersService.pollPlayers().subscribe({
      next: (text) => {
        const parsed = this.playersService.parsePlayers(text);
        if (parsed) {
          this.players.set(parsed);
          this.applyFixedTeams();
        }
      },
      error: (err) => {
        console.error("Error polling players:", err);
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions?.unsubscribe();
  }

  private applyFixedTeams() {
    const allPlayers = this.players();
    const playersByName = new Map(
      allPlayers.map((player) => [this.normalizeName(player.name), player]),
    );

    const teamA = this.FIXED_TEAM_A.map((name) =>
      playersByName.get(this.normalizeName(name)),
    ).filter((player): player is Player => Boolean(player));

    const teamAIds = new Set(teamA.map((player) => player.id));
    const teamB = allPlayers.filter((player) => !teamAIds.has(player.id));

    this.teamA.set(teamA);
    this.teamB.set(teamB);
  }

  private normalizeName(name: string) {
    return name.trim().toLowerCase();
  }
}
