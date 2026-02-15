import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { Tournament } from './tournament.model';
import { TournamentService } from './services/tournament.service';
import { TournComponent } from '../../common-ui/tourn/tourn.component';
import { UserService } from '../../auth/services/user.service';
@Component({
  selector: 'app-tournaments',
  imports: [CommonModule, FormsModule, TournComponent],
  templateUrl: './tournaments.component.html',
  styleUrl: './tournaments.component.scss',
})
export class TournamentsComponent implements OnInit {
  tournaments: Tournament[] = []; // Список всех турниров
  currentUserId!: number | undefined;
  today: string = ''; // Для минимальной даты
  currentTime: string = new Date().toISOString().split('T')[1]?.slice(0, 5) || '';
  constructor(private tournamentService: TournamentService, private userService: UserService) {}

  

  newTournament: Tournament = {
    name: '',
    date: '',
    time: '',
    max_num: 0,
    format: '',
    participants: [],
    creatorId: undefined, // ID текущего пользователя будет присвоен при создании
  };

  

  ngOnInit(): void {
    this.loadTournaments();

    this.userService.getCurrentUser().subscribe(user => {
      if (user !== null){
        this.currentUserId = user.id;
      }
      
    });

    // Устанавливаем минимальную дату как сегодняшнюю
    const now = new Date();
    this.today = now.toISOString().split('T')[0];
  }

  loadTournaments(): void {
    this.tournamentService.getTournaments().subscribe({
      next: (tournaments: Tournament[]) => {
        this.tournaments = tournaments;
      },
      error: (err: any) => {
        console.error('Ошибка при загрузке турниров:', err);
      },
    });
  }

  createTournament(event: Event, form: any): void {
    event.preventDefault();

    if (form.invalid){
      return;
    }
    const creatorId = this.currentUserId; // Подставьте текущего пользователя
    const tournament = { ...this.newTournament, creatorId };
    console.log(tournament);
    this.tournamentService.createTournament(tournament).subscribe({
      next: (createdTournament) => {
        this.tournaments.push(createdTournament);
        this.newTournament = { name: '', date: '', time: '', max_num: 0, format: '', participants: [], creatorId: undefined };
      },
      error: (err) => {
        console.error('Ошибка при создании турнира:', err);
      },
    });
  }

  // Проверка времени на валидность (не ранее чем через 2 часа)
  validateTime(model: NgModel): boolean {
    const inputDate = new Date(`${this.newTournament.date}T${this.newTournament.time}`);
    const currentDate = new Date();
    const twoHoursLater = new Date(currentDate.getTime() + 2 * 60 * 60 * 1000);

    if (this.newTournament.date === this.today) {
      // Если дата сегодняшняя, проверяем, что время позже чем через 2 часа
      if (inputDate.getTime() < twoHoursLater.getTime()) {
        model.control.setErrors({ invalidTime: true });
        return false;
      }
    }

    // Если дата не сегодняшняя, считаем время корректным
    return true;
  }
}
