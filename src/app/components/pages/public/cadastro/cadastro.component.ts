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
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
    MatProgressSpinnerModule,
  ],
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.css'],
})
export class CadastroComponent implements OnInit {
  formGroup: FormGroup;
  isLoading = false;
  hidePassword = true;

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
      cpf: ['', [
          Validators.required,
          Validators.pattern(/^\d{11}$/),
          Validators.maxLength(11),
        ],],
    });
  }

  ngOnInit(): void {
    this.setupValidations();
  }

   togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  setupValidations() {
    const loginControl = this.formGroup.get('login');
    const emailControl = this.formGroup.get('email');
    const cpfControl = this.formGroup.get('cpf');

    if (loginControl) {
      loginControl.valueChanges
        .pipe(
          debounceTime(500),
          distinctUntilChanged(),
          switchMap((value) => this.validateLogin(value))
        )
        .subscribe();
    }

    if (emailControl) {
      emailControl.valueChanges
        .pipe(
          debounceTime(500),
          distinctUntilChanged(),
          switchMap((value) => this.validateEmail(value))
        )
        .subscribe();
    }

    if (cpfControl) {
      cpfControl.valueChanges
        .pipe(
          debounceTime(500),
          distinctUntilChanged(),
          switchMap((value) => this.validateCpf(value))
        )
        .subscribe();
    }
  }

  validateCpf(cpf: string) {
    if (!cpf || !/^\d{11}$/.test(cpf)) {
      return of(false);
    }
    return this.usuarioService.checkCpfExists(cpf).pipe(
      map((exists) => {
        if (exists) {
          this.formGroup.get('cpf')?.setErrors({ cpfExists: true });
        }
        return exists;
      }),
      catchError(() => of(false))
    );
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

  validateEmail(email: string) {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return of(false);
    }
    return this.usuarioService.checkEmailExists(email).pipe(
      map((exists) => {
        if (exists) {
          this.formGroup.get('email')?.setErrors({ emailExists: true });
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
      nome: formData.nome,
      email: formData.email,
      login: formData.login,
      senha: formData.senha,
      cpf: formData.cpf,
      perfil: {id: 1},
      telefones: [],
      enderecos: [],
      nomeImagem: null,
    };

    this.usuarioService.insert(novoUsuario).subscribe({
      next: () => {
        this.authService.login(formData.login, formData.senha).subscribe({
          next: () => {
            this.snackBar.open('Conta criada com sucesso!', 'Fechar', {
              duration: 3000,
            });
            this.router.navigateByUrl('/');
          },
          error: (err) => {
            console.error('Erro ao logar após cadastro', err);
            this.snackBar.open(
              'Conta criada, mas erro ao logar. Tente novamente.',
              'Fechar',
              { duration: 5000 }
            );
            this.isLoading = false;
          },
        });
      },
      error: (err) => {
        console.error('Erro ao criar conta', err);
        let errorMessage = 'Erro ao criar conta';
        if (err.error && err.error.message) {
          errorMessage = err.error.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        this.snackBar.open(errorMessage, 'Fechar', { duration: 5000 });
        if (errorMessage.includes('Login já está em uso')) {
          this.formGroup.get('login')?.setErrors({ loginExists: true });
        } else if (errorMessage.includes('CPF já está em uso')) {
          this.formGroup.get('cpf')?.setErrors({ cpfExists: true });
        } else if (errorMessage.includes('E-mail já está em uso')) {
          this.formGroup.get('email')?.setErrors({ emailExists: true });
        }
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}
