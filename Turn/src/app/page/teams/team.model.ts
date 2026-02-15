export interface Team {
    id?: number;            // Идентификатор команды
    name: string;           // Название команды
    gameType: string;       // Тип игры
    members: string[];      // Участники команды
    creatorId?: number;      // ID капитана команды
  }
  