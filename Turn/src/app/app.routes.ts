import { RouterModule, Routes } from '@angular/router';
import { MainPageComponent } from './page/main-page/main-page.component';
import { AuthComponent } from './auth/auth.component';
import { AutorizationComponent } from './auth/autorization/autorization.component';
import { NgModule } from '@angular/core';
import { AuthService } from './auth/services/auth.service';
import { UserService } from './auth/services/user.service';
import { ProfileComponent } from './page/profile/profile.component';
import { TournamentsComponent } from './page/tournaments/tournaments.component';
import { TeamsComponent } from './page/teams/teams.component';
import { TournComponent } from './common-ui/tourn/tourn.component'
import { RegistrationComponent } from './auth/registration/registration.component';
export const routes: Routes = [
    
    {path:'', component: MainPageComponent},
    {path:'main-page',component:MainPageComponent},
    {path:'auth', component:AuthComponent},
    {path:'autoriz', component:AutorizationComponent},
    {path:'registr', component:RegistrationComponent},
    {path:'prof', component: ProfileComponent},
    {path:'tour', component: TournamentsComponent},
    {path:'teams', component: TeamsComponent},
    {path:'tourn', component: TournComponent}
    
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: [AuthService, UserService]
  })

  export class SystemRoutingModule { }
