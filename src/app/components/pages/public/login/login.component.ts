import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    RouterModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  hidePassword = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      login: ['', [Validators.required, Validators.minLength(3)]],
      senha: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const login = this.loginForm.get('login')!.value;
      const senha = this.loginForm.get('senha')!.value;

      this.authService.login(login, senha).subscribe({
        next: () => {
          this.isLoading = false;
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigateByUrl(returnUrl);
          this.showNotification('🚀 Login realizado com sucesso!', 'success');
        },
        error: (err) => {
          this.isLoading = false;
          const errorMessage = this.getErrorMessage(err);
          this.showNotification(errorMessage, 'error');
        },
      });
    } else {
      this.markFormGroupTouched();
      this.showNotification('⚠️ Por favor, preencha todos os campos corretamente', 'error');
    }
  }

  onRegister() {
    this.router.navigateByUrl('/cadastro');
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  private getErrorMessage(err: any): string {
    switch (err.status) {
      case 404:
        return '🔒 Usuário ou senha inválidos';
      case 401:
        return '🔒 Credenciais inválidas';
      case 500:
        return '🔧 Erro interno do servidor';
      case 0:
        return '🌐 Erro de conexão. Verifique sua internet';
      default:
        return '❌ Erro ao conectar com o servidor';
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  private showNotification(message: string, type: 'success' | 'error') {
    const config = {
      duration: 4000,
      verticalPosition: 'top' as const,
      horizontalPosition: 'center' as const,
      panelClass: type === 'success' ? 'success-snackbar' : 'error-snackbar'
    };

    this.snackBar.open(message, 'Fechar', config);
  }
}