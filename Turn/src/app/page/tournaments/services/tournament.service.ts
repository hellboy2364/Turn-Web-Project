import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tournament } from '../tournament.model';

@Injectable({
  providedIn: 'root',
})
export class TournamentService {
  private apiUrl = 'http://localhost:3000/tournaments'; // URL сервера

  constructor(private http: HttpClient) {}

  getTournaments(): Observable<Tournament[]> {
    return this.http.get<Tournament[]>(this.apiUrl);
  }

  createTournament(tournament: Tournament): Observable<Tournament> {
    return this.http.post<Tournament>(this.apiUrl, tournament);
  }

  updateTournament(tournament: Tournament): Observable<Tournament> {
    return this.http.put<Tournament>(`${this.apiUrl}/${tournament.id}`, tournament);
  }
}