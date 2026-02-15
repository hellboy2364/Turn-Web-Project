export class AuthService {
    private isAuthenticated;
    constructor() {
      if (localStorage.getItem('user') == null) {
        this.isAuthenticated = false;
      }
      else {
        this.isAuthenticated = true;
      }
    }
  
    login() {
      this.isAuthenticated = true;
    }
  
    logout() {
      this.isAuthenticated = false;
      window.localStorage.clear();
    }
  
    isLoggedIn(): boolean {
  
      return this.isAuthenticated;
    }
  }