import { Component, Input, OnInit } from '@angular/core';
import { CommonModule,  } from '@angular/common';
import { Tournament } from '../../page/tournaments/tournament.model';
import { UserService } from '../../auth/services/user.service';
import { TeamService } from '../../page/teams/services/team.service';
import { Team } from '../../page/teams/team.model';
import { TournamentService } from '../../page/tournaments/services/tournament.service';
import { switchMap } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Component({
  selector: 'app-tourn',
  imports: [CommonModule],
  templateUrl: './tourn.component.html',
  styleUrl: './tourn.component.scss'
})
export class TournComponent implements OnInit {
  @Input() tournament!: Tournament; // Турнир, который нужно отобразить
  participantTeams: Team[] = [];
  constructor(
    private userService: UserService,
    private teamService: TeamService,
    private tournamentService: TournamentService
  ) {}

  ngOnInit(): void {
    this.loadParticipantTeams();
  }

  loadParticipantTeams(): void {
    if (this.tournament.participants.length === 0) {
      this.participantTeams = []; // Если участников нет, оставляем массив пустым
      return;
    }

    this.teamService.getTeamsByIds(this.tournament.participants).subscribe({
      next: (teams) => {
        this.participantTeams = teams; // Сохраняем команды-участники
      },
      error: (err) => {
        console.error('Ошибка при загрузке команд-участников:', err);
      }
    });
  }

  onParticipate(): void {
    this.userService.getCurrentUser().subscribe((user) => {
      if (user) {
        const userTeamIds = user.teams || [];

        // Загружаем команды пользователя
        this.teamService.getTeamsByIds(userTeamIds).subscribe((teams) => {
          // Фильтруем команды, где пользователь является создателем
          const userCreatedTeams = teams.filter(
            (team) => String(team.creatorId) === String(user.id)
          );
          console.log('Все команды пользователя:', teams);
          console.log('ID текущего пользователя:', user.id);
          if (userCreatedTeams.length === 0) {
            alert('Вы не являетесь лидером ни одной из команд в которых вы состоите');
            return;
          }

          // Проверяем, зарегистрировал ли пользователь уже одну из своих команд
          const userCreatedTeamAlreadyInTournament = this.tournament.participants.some((participantId) =>
            userCreatedTeams.some((team) => String(team.id) === String(participantId))
          );

          if (userCreatedTeamAlreadyInTournament) {
            alert('Вы уже добавили одну из своих команд в этот турнир');
            return;
          }

          // Предлагаем выбрать команду
          const selectedTeamIndex = prompt(
            `Выберите команду для участия:\n${userCreatedTeams
              .map((team, index) => `${index + 1}. ${team.name}`)
              .join('\n')}`
          );

          const selectedIndex = parseInt(selectedTeamIndex || '', 10) - 1;

          if (!isNaN(selectedIndex) && userCreatedTeams[selectedIndex]) {
            const selectedTeam = userCreatedTeams[selectedIndex];
            
            // Проверяем, является ли команда уже участником турнира
            if (this.tournament.participants.includes(String(selectedTeam.id!))) {
              alert('Данная команда уже является участником данного турнира');
            } else {
              if (this.tournament.max_num === 0){
                alert('Все места уже заняты. Стоит поискать другой турнир для участия.')
              } else{

                // Добавляем ID турнира в turns всех участников команды
                this.addTournamentToTeamMembers(selectedTeam.id!.toString(), String(this.tournament.id!));

                // Добавляем ID команды в список участников турнира
                this.tournament.participants.push(selectedTeam.id!.toString());
                
                this.tournament.max_num = this.tournament.max_num - 1;
                // Обновляем турнир на сервере
                this.tournamentService.updateTournament(this.tournament).subscribe({
                  next: () => {
                    alert(`Команда "${selectedTeam.name}" теперь учавствует в данном трунире. За 2 часа до начала турнира с вами свяжутся наши администраторы с нашего официального email по контактной информации лидера вашей команды. Желаем вам удачного проведения турнира!`);
                  },
                  error: (err: any) => {
                    console.error('Ошибка при обновлении турнира:', err);
                  },
                });
              }
            }
          }
        });
      }
    });
  }

  addTournamentToTeamMembers(teamId: string, tournamentId: string): void {
    this.teamService.getTeamById(teamId).subscribe((team) => {
      if (team && team.members) {
        // Формируем массив запросов для обновления участников команды
        const memberUpdates = team.members.map((memberId) => {
          return this.userService.getUserById(memberId).pipe(
            switchMap((user) => {
              // Проверяем, есть ли турнир уже в turns
              if (user.turns.includes(tournamentId)) {
                console.log(`Турнир уже добавлен пользователю ${user.id}`);
                return of(user); // Возвращаем текущего пользователя без изменений
              }
              const updatedTurns = [...user.turns, tournamentId];
              return this.userService.updateUser({ ...user, turns: updatedTurns }).pipe(
                catchError((error) => {
                  console.error(`Ошибка обновления пользователя ${user.id}:`, error);
                  return of(null); // Возвращаем null в случае ошибки
                })
              );
            })
          );
        });
  
        // Выполняем обновление всех участников параллельно
        forkJoin(memberUpdates).subscribe({
          next: (results) => {
            console.log('Участники команды успешно обновлены:', results);
          },
          error: (err) => {
            console.error('Ошибка при обновлении участников команды:', err);
          },
        });
      }
    });
  }
  
  leave(): void {
    this.userService.getCurrentUser().subscribe((user) => {
      if (user) {
        const userTeamIds = user.teams || [];
  
        // Загружаем команды пользователя
        this.teamService.getTeamsByIds(userTeamIds).subscribe((teams) => {
          // Фильтруем команды, где пользователь является создателем
          const userCreatedTeams = teams.filter(
            (team) => String(team.creatorId) === String(user.id)
          );
  
          // Проверяем, зарегистрировал ли пользователь уже одну из своих команд
          const userCreatedTeamInTournament = userCreatedTeams.find((team) =>
            this.tournament.participants.includes(String(team.id))
          );
  
          if (!userCreatedTeamInTournament) {
            alert('Вы не регистрировали ни одну из своих команд на данный турнир');
            return;
          }
  
          const selectedTeam = userCreatedTeamInTournament;
  
          // Удаляем ID команды из списка участников турнира
          this.tournament.participants = this.tournament.participants.filter(
            (participantId) => participantId !== String(selectedTeam.id)
          );
  
          // Увеличиваем доступное количество мест
          this.tournament.max_num = this.tournament.max_num + 1;
  
          // Удаляем ID турнира из turns всех участников команды
          this.removeTournamentFromTeamMembers(selectedTeam.id!.toString(), String(this.tournament.id!));
  
          // Обновляем турнир на сервере
          this.tournamentService.updateTournament(this.tournament).subscribe({
            next: () => {
              alert(`Команда "${selectedTeam.name}" успешно покинула данный турнир.`);
            },
            error: (err: any) => {
              console.error('Ошибка при обновлении турнира:', err);
            },
          });
        });
      }
    });
  }
  
  removeTournamentFromTeamMembers(teamId: string, tournamentId: string): void {
    this.teamService.getTeamById(teamId).subscribe((team) => {
      if (team && team.members) {
        // Формируем массив запросов для обновления участников команды
        const memberUpdates = team.members.map((memberId) => {
          return this.userService.getUserById(memberId).pipe(
            switchMap((user) => {
              // Удаляем турнир из turns, если он существует
              if (!user.turns.includes(tournamentId)) {
                console.log(`Турнир отсутствует у пользователя ${user.id}`);
                return of(user); // Возвращаем текущего пользователя без изменений
              }
              const updatedTurns = user.turns.filter((turnId) => turnId !== tournamentId);
              return this.userService.updateUser({ ...user, turns: updatedTurns }).pipe(
                catchError((error) => {
                  console.error(`Ошибка обновления пользователя ${user.id}:`, error);
                  return of(null); // Возвращаем null в случае ошибки
                })
              );
            })
          );
        });
  
        // Выполняем обновление всех участников параллельно
        forkJoin(memberUpdates).subscribe({
          next: (results) => {
            console.log('Участники команды успешно обновлены:', results);
          },
          error: (err) => {
            console.error('Ошибка при обновлении участников команды:', err);
          },
        });
      }
    });
  }
  

}
