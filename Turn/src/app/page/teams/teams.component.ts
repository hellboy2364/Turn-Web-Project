import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TeamService } from './services/team.service';
import { UserService } from '../../auth/services/user.service';
import { Team } from './team.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './teams.component.html',
  styleUrl: './teams.component.scss'
})
export class TeamsComponent implements OnInit{
  teamForm!: FormGroup;
  currentUserId!: number | undefined;

  constructor(private teamService: TeamService, private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    // Получение текущего пользователя
    this.userService.getCurrentUser().subscribe(user => {
      if (user !== null){
        this.currentUserId = user.id;
      }
      
    });

    // Инициализация формы
    this.teamForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      gameType: new FormControl('', [Validators.required]),
      members: new FormControl('', [Validators.required]),
    });
  }

  onSubmit(): void {
    if (this.teamForm.invalid || this.currentUserId === null) {
      alert('Форма некорректна или пользователь не авторизован');
      return;
    }

    const { name, gameType, members } = this.teamForm.value;
    // Разделяем строку с ID участников на массив, очищая от лишних пробелов
  const userIds = members
  .split(',')
  .map((id: string) => id.trim()) // Удаляем лишние пробелы
  .filter((id: string) => id.length > 0); // Убираем пустые строки

  console.log('Проверка userIds:', userIds);

  // Проверяем, существуют ли пользователи с указанными ID
  this.teamService.getUsersByIds(userIds).subscribe({
    next: (users) => {
      console.log('Полученные пользователи:', users);
      if (users.length !== userIds.length) {
        alert('Некоторые пользователи не найдены!');
        return;
      }

      const newTeam: Team = {
        name,
        gameType,
        members: userIds, // Используем массив ID
        creatorId: this.currentUserId,
      };

      // Сохранение команды
      this.teamService.createTeam(newTeam).subscribe({
        next: (createdTeam) => {
          // Добавляем ID команды каждому участнику
          userIds.forEach((userId: string) => {
            this.userService.updateUserTeams(userId, createdTeam.id!).subscribe({
              next: () => {
                console.log(`Пользователь ${userId} обновлен`);
              },
              error: (error) => {
                console.error(`Ошибка при обновлении пользователя ${userId}:`, error);
              },
            });
          });

          alert('Команда успешно создана!');
          this.router.navigate(['/prof']); // Перенаправление на список команд
        },
        error: (error) => {
          console.error('Ошибка при создании команды:', error);
          alert('Произошла ошибка при создании команды');
        },
      });
    },
    error: (error) => {
      console.error('Ошибка при проверке пользователей:', error);
      alert('Произошла ошибка при обработке списка участников');
    },
  });
}
}
