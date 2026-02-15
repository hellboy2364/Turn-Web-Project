export interface User {
    id?: number;        // Идентификатор
    nickname: string,
    name: string;      // Имя пользователя
    surname: string;
    email: string;     // Email пользователя
    password: string;  // Пароль пользователя
    teams: string[],
    turns: string[]
  }
  