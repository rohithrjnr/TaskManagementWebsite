import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username: string = '';
  password: string = '';
  role: string = 'tester';

  constructor(private router: Router, private authService: AuthService) {}

  onRegister(): void {
    this.authService.register(this.username, this.password, this.role);
    console.log('Registered', this.username, this.password, this.role);
    // Optionally, redirect to login or dashboard after registration
    this.router.navigate(['/login']);
  }
}
