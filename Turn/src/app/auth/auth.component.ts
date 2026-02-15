import { Component } from '@angular/core';
import { RegistrationComponent } from './registration/registration.component';
import { AutorizationComponent } from './autorization/autorization.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [RegistrationComponent, AutorizationComponent, CommonModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  isRegistering = true;

  toggleForm(isRegistering: boolean) {
    this.isRegistering = isRegistering;
  }
}
