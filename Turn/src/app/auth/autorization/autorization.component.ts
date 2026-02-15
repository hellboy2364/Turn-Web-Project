import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-autorization',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './autorization.component.html',
  styleUrl: './autorization.component.scss'
})
export class AutorizationComponent implements OnInit{
  @Output() toggle = new EventEmitter<void>();

  switchToRegister() {
    this.toggle.emit();
  }

  logform!: FormGroup;

  constructor(private userService: UserService, private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    // Инициализация формы авторизации
    this.logform = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    });
  }

  onSubmit(): void {
    if (this.logform.invalid) {
      return;
    }

    const { email, password } = this.logform.value;

    // Проверка пользователя в базе данных
    this.userService.login(email, password).subscribe({
      next: (user) => {
        if (user) {
          console.log('Login successful:', user);
          // Перенаправление на главную страницу
          if (user.id !== undefined) {
            this.userService.setCurrentUserId(user.id); // Проверка на `undefined`
          }
          this.authService.login()
          this.router.navigate(['/prof']);
        } else {
          alert('Неверный email или пароль');
        }
      },
      error: (error) => {
        console.error('Error during login:', error);
        alert('Произошла ошибка при авторизации');
      },
      complete: () => {
        console.log('Login process completed.');
      },
    });

  }
}
