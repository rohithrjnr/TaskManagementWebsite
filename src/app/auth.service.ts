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

    // If the role is 'Developer', add the username to the Developer list
    if (role === 'developer') {
      this.addDeveloper(username);
    }
  }

  login(username: string, password: string): boolean {
    const storedPassword = sessionStorage.getItem(username);
    if (storedPassword === password) {
      this.loggedIn = true;
      this.currentUser = username;
      const role = localStorage.getItem(username);
      if (role) {
        sessionStorage.setItem('currentUserRole', role);
      }
      return true;
    }
    return false;
  }

  logout(): void {
    this.loggedIn = false;
    this.currentUser = null;
    sessionStorage.removeItem('currentUserRole');
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  getCurrentUserType(): string | null {
    return sessionStorage.getItem('currentUserRole');
  }

  private addDeveloper(username: string): void {
    // Retrieve the developers from localStorage and parse it as an array
    let developers = JSON.parse(localStorage.getItem('developers') || '[]');
    
    // Check if the username is not already in the array
    if (!developers.includes(username)) {
      // Add the username to the array
      developers.push(username);
      
      // Save the updated array back to localStorage
      localStorage.setItem('developers', JSON.stringify(developers));
    }
  }
  
}
