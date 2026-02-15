import { Component } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink} from '@angular/router';
@Component({
  selector: 'app-main-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent {

  constructor(private authService:AuthService, private router: Router){}
  auth() {
    return this.authService.isLoggedIn()
  }

  go_toAuth(){
    this.router.navigate(['/auth']);
    alert('Сначала следует пройти регистрацию/авторизацию');
  }
}

