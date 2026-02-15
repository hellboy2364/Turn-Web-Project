export interface Tournament {
    id?: number;         // Идентификатор турнира
    name: string;        // Название турнира
    date: string;        // Дата турнира в формате ISO
    time: string;        // Время турнира
    format: string;      // Формат турнира
    participants: string[]; // Список ID команд-участников
    max_num: number;
    creatorId?: number;   // ID пользователя, создавшего турнир
}