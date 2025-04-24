import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    RouterModule,
    MatIcon
  ],
})
export class LoginComponent {
  identificador = '';
  senha = '';
  errorMessage = '';
  hide = true;

  constructor(private authService: AuthService, private router: Router){}


  login() {
    console.log('Login com:', this.identificador, this.senha);
  
    this.authService.login(this.identificador, this.senha).subscribe({
      next: () => {
        this.router.navigate(['/']); // Redireciona para home ou onde preferir
      },
      error: (err) => {
        console.error('Erro ao fazer login', err);
        this.errorMessage = 'Usuário ou senha inválidos.';
      },
    });
  }
  
  toggleVisibility() {
    this.hide = !this.hide;
  }
}
