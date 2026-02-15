import { Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../auth/services/user.service';
import { User } from '../../auth/models/user.model';
import { AuthService } from '../../auth/services/auth.service';
import { Router } from '@angular/router';
import { Team } from '../teams/team.model';
import { Tournament } from '../tournaments/tournament.model';
import { TeamService } from '../teams/services/team.service';
import { TournamentService } from '../tournaments/services/tournament.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})


export class ProfileComponent implements OnInit {
  currentUser: User | null = null; // Данные текущего пользователя
  loading: boolean = true; // Флаг для отображения загрузки
  error: string | null = null; // Сообщение об ошибке
  userTeams: Team[] = [];
  userTurns: Tournament[] = [];
  userNickname: string | undefined; // ID текущего пользователя

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private teamService: TeamService,
    private turnService: TournamentService
  ) {}

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        if (user) {
          this.currentUser = user;
          this.loadUserTeams(); // Загружаем команды, где пользователь является участником
          this.loadUserTurns();
        } else {
          this.error = 'Пользователь не найден.';
        }
        this.loading = false; // Отключаем индикатор загрузки
      },
      error: (err) => {
        this.error = 'Произошла ошибка при загрузке данных пользователя.';
        console.error('Error loading user:', err);
        this.loading = false; // Отключаем индикатор загрузки
      },
    });
  }

  private loadUserTeams(): void {
    if (!this.currentUser || !this.currentUser.teams || this.currentUser.teams.length === 0) {
      this.userTeams = []; // Если у пользователя нет команд, инициализируем пустой массив
      return;
    }
  
    const teamIds = this.currentUser.teams; // Получаем массив ID команд пользователя
  
    this.teamService.getTeams().subscribe({
      next: (teams) => {
        // Фильтруем команды по ID из массива teams пользователя
        this.userTeams = teams.filter((team) => teamIds.includes(team.id?.toString() || ''));
      },
      error: (err) => {
        this.error = 'Ошибка при загрузке команд.';
        console.error('Error loading teams:', err);
      },
    });
  }

  private loadUserTurns(): void {
    if (!this.currentUser || !this.currentUser.turns || this.currentUser.turns.length === 0) {
      this.userTurns = []; // Если у пользователя нет команд, инициализируем пустой массив
      return;
    }

    const turnIds = this.currentUser.turns; // Получаем массив ID команд пользователя

    this.turnService.getTournaments().subscribe({
      next: (turns) => {
        this.userTurns = turns.filter((turn) => turnIds.includes(turn.id?.toString() || ''))
      },
      error: (err) => {
        this.error = 'Ошибка при загрузке турниров.';
        console.error('Error loading turns:', err);
      }
    });
  }

  exit(): void {
    this.authService.logout();
    this.router.navigate(['main-page']);
  }

  leave(teamId: number | undefined){
    if (!this.currentUser || !teamId) {
      console.error('Неверные данные для выхода из команды.');
      return;
    }
  
    // Найти команду по ID
    this.teamService.getTeams().subscribe({
      next: (teams) => {
        const team = teams.find((t) => t.id === teamId);
        if (!team) {
          console.error('Команда не найдена.');
          return;
        }
  
        if (team.creatorId === this.currentUser?.id) {
          // Если текущий пользователь является создателем команды, удаляем команду
          this.teamService.deleteTeam(teamId).subscribe({
            next: () => {
              // Удаляем ID команды из свойства `teams` текущего пользователя
              this.updateUserTeams(teamId, true);
              alert('Вы успешно удалили команду.');
              this.loadUserTeams();
            },
            error: (err) => {
              console.error('Ошибка при удалении команды:', err);
              alert('Ошибка при удалении команды.');
            },
          });
        } else {
          // Если пользователь не является создателем команды
          // Удаляем пользователя из `members` команды
          const updatedMembers = team.members.filter((memberId) => memberId !== this.currentUser?.id?.toString());
          this.teamService.updateTeam(teamId, { members: updatedMembers }).subscribe({
            next: () => {
              // Удаляем ID команды из свойства `teams` текущего пользователя
              this.updateUserTeams(teamId, false);
              alert('Вы успешно покинули команду.');
              this.loadUserTeams();
            },
            error: (err) => {
              console.error('Ошибка при обновлении команды:', err);
              alert('Ошибка при покидании команды.');
            },
          });
        }
      },
      error: (err) => {
        console.error('Ошибка при загрузке команды:', err);
        alert('Ошибка при обработке команды.');
      },
    });
  }

  private updateUserTeams(teamId: number, isTeamDeleted: boolean): void {
    if (!this.currentUser) {
      console.error('Текущий пользователь не найден.');
      return;
    }
  
    const updatedTeams = this.currentUser.teams.filter((id) => id !== teamId.toString());
  
    // Если команда удалена, передаём обновлённые данные
    const userData = isTeamDeleted ? { ...this.currentUser, teams: updatedTeams } : { ...this.currentUser, teams: updatedTeams };
  
    this.userService.updateUser(userData).subscribe({
      next: (updatedUser) => {
        this.currentUser = updatedUser; // Обновляем текущего пользователя
      },
      error: (err) => {
        console.error('Ошибка при обновлении команд пользователя:', err);
        alert('Не удалось обновить список команд пользователя.');
      },
    });
  }
}
