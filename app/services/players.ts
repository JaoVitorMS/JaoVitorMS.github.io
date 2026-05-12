import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, switchMap, startWith } from 'rxjs';

export interface Player {
  id: string | number;
  name: string;
  isPaid: boolean;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlayersService {
  private readonly SHEET_ID = '1vU_mmjVqvlFky3kzztEvH21gZXnpxniQ1FxiJICg8mI';
  private readonly SHEET_GID = '613547221';

  constructor(private http: HttpClient) {}

  loadPlayers(): Observable<string> {
    const url = `https://docs.google.com/spreadsheets/d/${this.SHEET_ID}/gviz/tq?tqx=out:json&gid=${this.SHEET_GID}&t=${Date.now()}`;
    return this.http.get(url, { responseType: 'text' });
  }

  pollPlayers(): Observable<string> {
    return interval(30000).pipe(
      startWith(0),
      switchMap(() => this.loadPlayers())
    );
  }

  parsePlayers(text: string): Player[] {
    const jsonText = text.match(/setResponse\((.*)\);/s)?.[1];
    if (!jsonText) return [];

    const data = JSON.parse(jsonText);
    const rows = data.table.rows || [];

    return rows
      .map((r: any) => {
        const getName = (cell: any) => (cell && cell.v) ? String(cell.v).trim() : '';
        const getStatus = (cell: any) => (cell && cell.v) ? String(cell.v).trim() : '';

        const name = getName(r.c[1]);
        const rawStatus = getStatus(r.c[2]);
        const lowerStatus = rawStatus.toLowerCase();
        const isPaid = lowerStatus === 'pago';

        let status = '';
        if (lowerStatus !== 'pago' && lowerStatus !== 'não-pago' && lowerStatus !== 'nao-pago') {
          status = rawStatus;
        }

        return { name, isPaid, status, id: name || Math.random() };
      })
      .filter((p: Player) => p.name && !p.name.startsWith('Date('));
  }
}
