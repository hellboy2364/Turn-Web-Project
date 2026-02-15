import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router'; 
import { AuthService } from '../../auth/services/auth.service';

import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  constructor(private authService: AuthService) { }


  auth() {
    return this.authService.isLoggedIn()
  }
}