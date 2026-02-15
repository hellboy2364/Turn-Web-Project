import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { Team } from '../team.model';
import { User } from '../../../auth/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private apiUrl = 'http://localhost:3000/teams'; // URL для хранения данных команд

  constructor(private http: HttpClient) {}

  // Получение всех команд
  getTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(this.apiUrl);
  }

  // Создание новой команды
  createTeam(team: Team): Observable<Team> {
    return this.http.post<Team>(this.apiUrl, team);
  }

  // Удаление команды
  deleteTeam(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  

  getUsersByIds(ids: string[]): Observable<any[]> {
    const requests = ids.map((id) => this.http.get<any>(`http://localhost:3000/users/${id}`));
    return forkJoin(requests); // Выполняет запросы параллельно
  }
  
  // Обновление данных команды
  updateTeam(teamId: number, updatedData: Partial<Team>): Observable<Team> {
    return this.http.patch<Team>(`${this.apiUrl}/${teamId}`, updatedData);
  }

  // Получить команду по ID
  getTeamById(teamId: string): Observable<Team> {
    return this.http.get<Team>(`${this.apiUrl}/${teamId}`);
  }

  // Получить несколько команд по их ID
  getTeamsByIds(ids: string[]): Observable<Team[]> {
    const query = ids.map((id) => `id=${id}`).join('&');
    return this.http.get<Team[]>(`${this.apiUrl}?${query}`);
  }
}
