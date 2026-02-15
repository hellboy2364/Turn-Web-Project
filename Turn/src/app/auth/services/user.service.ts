import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { User } from '.././models/user.model';
import { map, switchMap} from 'rxjs/operators';
import * as bcrypt from 'bcryptjs'; // Импорт bcryptjs

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:3000/users'; // URL JSON Server
  private currentUserId: number | undefined = undefined;
  
  constructor(private http: HttpClient) {}

  // Получить всех пользователей
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  // Добавить нового пользователя
  addUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  login(email: string, password: string): Observable<User | null> {
    return this.http.get<User[]>(`${this.apiUrl}?email=${email}`).pipe(
      switchMap(async (users) => {
        const user = users[0];
        if (user && (await bcrypt.compare(password, user.password))) {
          return user;
        }
        return null;
      })
    );
  }

  setCurrentUserId(id: number): void {
    this.currentUserId = id;
  }

  // Получить пользователя по ID (тип string)
  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`);
  }

  // Получить текущего пользователя
  getCurrentUser(): Observable<User | null> {
    if (this.currentUserId !== null) {
      return this.http.get<User>(`${this.apiUrl}/${this.currentUserId}`);
    }
    return of(null);
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`http://localhost:3000/users/${user.id}`, user);
  }

  updateUserTeams(userId: string, teamId: number): Observable<User> {
    return this.getUserById(userId).pipe(
      switchMap((user) => {
        const updatedTeams = [...(user.teams || []), teamId]; // Обновляем массив команд
        return this.http.patch<User>(`${this.apiUrl}/${userId}`, { teams: updatedTeams });
      })
    );
  }
}
