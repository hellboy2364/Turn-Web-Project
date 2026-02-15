  import { Component, EventEmitter, Output, OnInit } from '@angular/core';
  import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
  import { UserService } from '../services/user.service';
  import { User } from '../models/user.model';
  import { CommonModule } from '@angular/common';
  import * as bcrypt from 'bcryptjs'; // Импорт bcryptjs
  @Component({
    selector: 'app-registration',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './registration.component.html',
    styleUrls: ['./registration.component.scss']
  })
  export class RegistrationComponent implements OnInit {
    @Output() toggle = new EventEmitter<void>();

    // Метод для переключения на страницу входа
    switchToLogin() {
      this.toggle.emit();
    }
  
    regform!: FormGroup;  // Экземпляр формы
  
    constructor(private userService: UserService) {}
  
    ngOnInit(): void {
      // Инициализация формы с валидаторами
      this.regform = new FormGroup({
        nickname: new FormControl('', [Validators.required]),
        name: new FormControl('', [Validators.required]),
        surname: new FormControl('', [Validators.required]),
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [Validators.required, Validators.minLength(8)])
      });
    }
  
    
  
    // Метод для отправки данных формы
    async onSubmit() {
      if (this.regform.invalid) {
        return;  // Если форма не валидна, ничего не отправляем
      }
      
      const { nickname, name, surname, email, password } = this.regform.value;
      // Хэширование пароля
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser: User = {
        nickname,
        name,
        surname,
        email,
        password: hashedPassword,
        teams: [],
        turns: []
      };
  
      // Отправка нового пользователя на сервер
      this.userService.addUser(newUser).subscribe((addedUser) => {
        console.log('User added successfully:', addedUser);
      });
  
      // Очистка формы после отправки
      this.regform.reset();
    }
  }
  