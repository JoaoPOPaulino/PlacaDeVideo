import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  of,
  map,
} from 'rxjs';
import { UsuarioService } from '../../../../services/usuario.service';
import { AuthService } from '../../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Perfil } from '../../../../models/usuario/perfil.model';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatIconModule,
  ],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.css',
})
export class CadastroComponent implements OnInit {
  formGroup: FormGroup;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.formGroup = this.formBuilder.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      login: ['', [Validators.required, Validators.minLength(3)]],
      senha: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  ngOnInit(): void {
    this.setupLoginValidation();
  }

  setupLoginValidation() {
    const loginControl = this.formGroup.get('login');
    if (loginControl) {
      loginControl.valueChanges
        .pipe(
          debounceTime(500),
          distinctUntilChanged(),
          switchMap((value) => this.validateLogin(value))
        )
        .subscribe();
    }
  }

  validateLogin(login: string) {
    if (!login || login.length < 3) {
      return of(false);
    }

    return this.usuarioService.checkLoginExists(login).pipe(
      map((exists) => {
        if (exists) {
          this.formGroup.get('login')?.setErrors({ loginExists: true });
        }
        return exists;
      }),
      catchError(() => of(false))
    );
  }

  criarConta() {
    if (this.formGroup.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;

    const formData = this.formGroup.value;
    const novoUsuario = {
      ...formData,
      perfil: { id: 1, label: 'Usuário' }, // Perfil fixo
    };

    this.usuarioService.insert(novoUsuario).subscribe({
      next: () => {
        this.authService.login(formData.login, formData.senha).subscribe({
          next: () => {
            this.snackBar.open('Conta criada com sucesso!', 'Fechar', {
              duration: 3000,
            });
            this.router.navigateByUrl('/home');
          },
          error: (err) => {
            console.error(`Erro ao logar após cadastro`, err);
            this.snackBar.open('Erro ao logar. Tente novamente.', 'Fechar', {
              duration: 5000,
            });
          },
        });
      },
      error: (err) => {
        console.error('Erro ao criar conta', err);
        const errorMessage = err.message || 'Erro ao criar conta';
        this.snackBar.open(errorMessage, 'Fechar', { duration: 5000 });
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}
