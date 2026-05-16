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

  // CONFIGURE AQUI: Nomes dos goleiros que devem ser separados
  private readonly GOLEIROS = ["Dindo Pedro", "Goleiro 2"];

  // CONFIGURE AQUI: ajustes manuais por nome (troque quando precisar)
  private readonly MANUAL_TEAM_A = ["Jogador A"];
  private readonly MANUAL_TEAM_B = ["Jogador B"];

  private subscriptions?: Subscription;
  private lastSortedCount = 0;
  private nextTeam: 'A' | 'B' = 'A';

  constructor(private playersService: PlayersService) {}

  ngOnInit() {
    this.subscriptions = this.playersService.pollPlayers().subscribe({
      next: (text) => {
        const parsed = this.playersService.parsePlayers(text);
        if (parsed) {
          this.players.set(parsed);
          this.maybeAutoSort();
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

  /**
   * 1. SORTEIO ALEATÓRIO
   * Separa goleiros automaticamente (um para cada time)
   * Depois distribui o resto aleatoriamente
   */
  sortTeamsRandomly() {
    const allPlayers = [...this.players()];
    const new_teamA: Player[] = [];
    const new_teamB: Player[] = [];

    // Separar goleiros
    const goleiros = allPlayers.filter(p => this.GOLEIROS.includes(p.name));
    const outrosJogadores = allPlayers.filter(p => !this.GOLEIROS.includes(p.name));

    // Distribuir goleiros (um em cada time)
    if (goleiros.length > 0) {
      new_teamA.push(goleiros[0]);
    }
    if (goleiros.length > 1) {
      new_teamB.push(goleiros[1]);
    }

    // Embaralhar o resto e distribuir alternadamente
    const shuffled = this.shuffleArray([...outrosJogadores]);
    shuffled.forEach((player, index) => {
      if (index % 2 === 0) {
        new_teamA.push(player);
      } else {
        new_teamB.push(player);
      }
    });

    this.teamA.set(new_teamA);
    this.teamB.set(new_teamB);
    this.applyManualOverrides();
  }

  private sortInitialTeams(totalCount: number) {
    const allPlayers = [...this.players()];
    let baseCount = 10;
    if (totalCount >= 14) {
      baseCount = 14;
    }

    const playersToSort = allPlayers.slice(0, baseCount);
    const new_teamA: Player[] = [];
    const new_teamB: Player[] = [];

    const goleiros = playersToSort.filter(p => this.GOLEIROS.includes(p.name));
    const outrosJogadores = playersToSort.filter(p => !this.GOLEIROS.includes(p.name));

    if (goleiros.length > 0) new_teamA.push(goleiros[0]);
    if (goleiros.length > 1) new_teamB.push(goleiros[1]);

    const shuffled = this.shuffleArray([...outrosJogadores]);
    shuffled.forEach((player, index) => {
      if (index % 2 === 0) {
        new_teamA.push(player);
      } else {
        new_teamB.push(player);
      }
    });

    this.teamA.set(new_teamA);
    this.teamB.set(new_teamB);
    this.applyManualOverrides();
  }

  private maybeAutoSort() {
    const count = this.players().length;
    const shouldSort = (count >= 10 && count < 14) || (count >= 14);
    const isEmpty = this.teamA().length === 0 && this.teamB().length === 0;

    if (shouldSort && (count !== this.lastSortedCount || isEmpty)) {
      if (isEmpty) {
        // Se for a primeira vez e já tiver mais de 10 jogadores, sorteamos os primeiros 10 ou 14
        this.lastSortedCount = count;
        this.sortInitialTeams(count);
      } else if (count === 10 || count === 14) {
        this.lastSortedCount = count;
        this.sortTeamsRandomly();
      } else {
        // Se não for um marco (10 ou 14) mas houve mudança no total, apenas garantimos
        // que os novos jogadores sejam adicionados (caso não tenha caído no isEmpty)
        this.lastSortedCount = count;
      }
      this.resetSequentialState();
      
      // Adicionamos sequencialmente qualquer jogador que não esteja nos times
      this.assignNewPlayersSequentially();
      return;
    }

    // Caso já existam times e o número de jogadores mude para um valor que não é marco
    if (count > this.lastSortedCount && !isEmpty) {
      this.lastSortedCount = count;
      this.assignNewPlayersSequentially();
    }
  }

  private resetSequentialState() {
    this.nextTeam = 'A';
  }

  private assignNewPlayersSequentially() {
    const teamA = [...this.teamA()];
    const teamB = [...this.teamB()];
    const assignedIds = new Set([...teamA, ...teamB].map((p) => p.id));
    const newPlayers = this.players().filter((p) => !assignedIds.has(p.id));

    if (!newPlayers.length) {
      return;
    }

    // Se os times estão vazios, o sorteio deve ter acontecido antes.
    // Se ainda assim estiverem vazios, não fazemos o append sequencial
    // para não quebrar a lógica de ter 5 ou 7 jogadores por time base.
    if (teamA.length === 0 && teamB.length === 0) {
      return;
    }

    newPlayers.forEach((player) => {
      // Garantir equilíbrio: adiciona no time que tiver menos jogadores
      if (teamA.length <= teamB.length) {
        teamA.push(player);
      } else {
        teamB.push(player);
      }
    });

    this.teamA.set(teamA);
    this.teamB.set(teamB);
    this.applyManualOverrides();
  }

  private applyManualOverrides() {
    this.MANUAL_TEAM_A.forEach((name) => {
      const player = this.findPlayerByName(name);
      if (player) {
        this.movePlayerToTeamA(player);
      }
    });

    this.MANUAL_TEAM_B.forEach((name) => {
      const player = this.findPlayerByName(name);
      if (player) {
        this.movePlayerToTeamB(player);
      }
    });
  }

  private findPlayerByName(name: string) {
    const normalized = name.trim().toLowerCase();
    return this.players().find((p) => p.name.trim().toLowerCase() === normalized);
  }

  /**
   * 2. MOVER JOGADOR (via código)
   * Use isso para ajustar manualmente se ficar desparelho
   */
  movePlayerToTeamA(player: Player) {
    const currentTeamB = this.teamB().filter(p => p.id !== player.id);
    const currentTeamA = [...this.teamA(), player];

    this.teamB.set(currentTeamB);
    this.teamA.set(currentTeamA);
  }

  movePlayerToTeamB(player: Player) {
    const currentTeamA = this.teamA().filter(p => p.id !== player.id);
    const currentTeamB = [...this.teamB(), player];

    this.teamA.set(currentTeamA);
    this.teamB.set(currentTeamB);
  }

  /**
   * Embaralha um array (Fisher-Yates)
   */
  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
