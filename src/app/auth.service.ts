import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = false;
  private currentUser: string | null = null;

  constructor() { }

  register(username: string, password: string, role: string): void {
    // Store the user data in session storage
    sessionStorage.setItem(username, password);
    localStorage.setItem(username, role);
  }

  login(username: string, password: string): boolean {
    const storedPassword = sessionStorage.getItem(username);
    if (storedPassword === password) {
      this.loggedIn = true;
      this.currentUser = username;
      return true;
    }
    return false;
  }

  logout(): void {
    this.loggedIn = false;
    this.currentUser = null;
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  getCurrentUserType(): string | null {
    if (this.currentUser) {
      return localStorage.getItem(this.currentUser);
    }
    return null;
  }
}
