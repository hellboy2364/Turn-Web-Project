import { Component } from '@angular/core';
import { RouterOutlet, Event, NavigationEnd, Router} from '@angular/router';
import { HeaderComponent } from './common-ui/header/header.component';
import { MainPageComponent } from './page/main-page/main-page.component';
import { FooterComponent } from './common-ui/footer/footer.component';
import { AuthComponent } from './auth/auth.component';
/* import {} */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Turn';
  constructor(private router: Router) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0); // Прокрутка страницы в начало
      }
    });
  }
  ngOnInit(): void {
    this.router.navigate(['/main-page']);
  }
}
