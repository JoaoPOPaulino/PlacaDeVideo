import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  switchMap,
} from 'rxjs';
import { UsuarioService } from '../../../../services/usuario.service';
import { Usuario } from '../../../../models/usuario/usuario.model';
import { NovoTelefoneDialogComponent } from '../../../shared/dialog/novo-telefone-dialog/novo-telefone-dialog.component';
import { NovoEnderecoDialogComponent } from '../../../shared/dialog/novo-endereco-dialog/novo-endereco-dialog.component';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { Perfil } from '../../../../models/usuario/perfil.model';
import { Endereco } from '../../../../models/usuario/endereco.model';
import { Telefone } from '../../../../models/usuario/telefone.model';

@Component({
  selector: 'app-usuario-form',
  templateUrl: './usuario-form.component.html',
  styleUrls: ['./usuario-form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    MatSnackBarModule,
    MatSelectModule,
    MatListModule,
    MatDialogModule,
  ],
})
export class UsuarioFormComponent implements OnInit {
  formGroup: FormGroup;
  perfis: Perfil[] = [
    { id: 1, label: 'Usuário' },
    { id: 2, label: 'Administrador' },
  ];
  telefones: Telefone[] = [];
  enderecos: Endereco[] = [];
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    const usuario: Usuario = this.activatedRoute.snapshot.data['usuario'] || {};
    this.formGroup = this.formBuilder.group({
      id: [usuario.id || null],
      nome: [
        usuario.nome || '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(255),
        ],
      ],
      login: [
        usuario.login || '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      email: [
        usuario.email || '',
        [Validators.required, Validators.email, Validators.maxLength(255)],
      ],
      senha: [
        '',
        [
          usuario.id ? Validators.nullValidator : Validators.required,
          Validators.minLength(6),
          Validators.maxLength(255),
        ],
      ],
      cpf: [
        usuario.cpf || '',
        [
          Validators.required,
          Validators.pattern(/^\d{11}$/),
          Validators.maxLength(11),
        ],
      ],
      perfil: [usuario.perfil?.id || 1, Validators.required],
    });
  }

  ngOnInit(): void {
    const usuario: Usuario = this.activatedRoute.snapshot.data['usuario'] || {};
    if (usuario.id) {
      this.carregarDadosUsuario(usuario);
    }
    this.setupValidations();
  }

  setupValidations() {
    const loginControl = this.formGroup.get('login');
    const cpfControl = this.formGroup.get('cpf');
    const emailControl = this.formGroup.get('email');

    if (loginControl) {
      loginControl.valueChanges
        .pipe(
          debounceTime(500),
          distinctUntilChanged(),
          switchMap((value) => this.validateLogin(value))
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

    if (emailControl) {
      emailControl.valueChanges
        .pipe(
          debounceTime(500),
          distinctUntilChanged(),
          switchMap((value) => this.validateEmail(value))
        )
        .subscribe();
    }
  }

  validateLogin(login: string) {
    if (!login || login.length < 3) {
      return of(false);
    }

    const currentId = this.formGroup.get('id')?.value;
    if (currentId) {
      const originalUser = this.activatedRoute.snapshot.data['usuario'];
      if (originalUser && originalUser.login === login) {
        return of(false);
      }
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

  validateCpf(cpf: string) {
    if (!cpf || !/^\d{11}$/.test(cpf)) {
      return of(false);
    }

    // Validação dos dígitos verificadores do CPF
    if (!this.isValidCpf(cpf)) {
      this.formGroup.get('cpf')?.setErrors({ cpfInvalid: true });
      return of(false);
    }

    const currentId = this.formGroup.get('id')?.value;
    if (currentId) {
      const originalUser = this.activatedRoute.snapshot.data['usuario'];
      if (originalUser && originalUser.cpf === cpf) {
        return of(false);
      }
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

  validateEmail(email: string) {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return of(false);
    }

    const currentId = this.formGroup.get('id')?.value;
    if (currentId) {
      const originalUser = this.activatedRoute.snapshot.data['usuario'];
      if (originalUser && originalUser.email === email) {
        return of(false);
      }
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

  isValidCpf(cpf: string): boolean {
    if (!cpf || cpf.length !== 11 || !/^\d{11}$/.test(cpf)) {
      return false;
    }

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpf)) {
      return false;
    }

    // Calcula o primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let firstDigit = 11 - (sum % 11);
    if (firstDigit >= 10) {
      firstDigit = 0;
    }

    if (parseInt(cpf.charAt(9)) !== firstDigit) {
      return false;
    }

    // Calcula o segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    let secondDigit = 11 - (sum % 11);
    if (secondDigit >= 10) {
      secondDigit = 0;
    }

    return parseInt(cpf.charAt(10)) === secondDigit;
  }

  carregarDadosUsuario(usuario: Usuario) {
    this.formGroup.patchValue({
      id: usuario.id,
      nome: usuario.nome,
      login: usuario.login,
      email: usuario.email,
      cpf: usuario.cpf,
      perfil: usuario.perfil.id,
    });

    if (usuario.telefones) {
      this.telefones = [...usuario.telefones];
    }
    if (usuario.enderecos) {
      this.enderecos = [...usuario.enderecos];
    }
  }

  salvar() {
    if (this.formGroup.invalid || this.isLoading) {
      this.snackBar.open(
        'Formulário inválido. Verifique os campos obrigatórios.',
        'Fechar',
        { duration: 3000 }
      );
      return;
    }

    this.isLoading = true;
    const formData = this.formGroup.value;

    const usuario: Usuario = {
      id: formData.id,
      nome: formData.nome,
      login: formData.login,
      email: formData.email,
      senha: formData.senha || undefined,
      cpf: formData.cpf,
      perfil: {
        id: formData.perfil,
        label: this.perfis.find((p) => p.id === formData.perfil)!.label,
      },
      telefones: this.telefones,
      enderecos: this.enderecos,
      nomeImagem: '',
    };

    const operation = usuario.id
      ? this.usuarioService.update(usuario, usuario.id)
      : this.usuarioService.insert(usuario);

    operation.subscribe({
      next: () => {
        this.snackBar.open('Usuário salvo com sucesso!', 'Fechar', {
          duration: 3000,
        });
        this.router.navigateByUrl('/admin/usuarios');
      },
      error: (err) => {
        console.error('Erro detalhado:', err);
        let errorMessage = 'Erro ao salvar usuário';

        if (err.error && err.error.message) {
          errorMessage = err.error.message;
        } else if (err.message) {
          errorMessage = err.message;
        }

        this.snackBar.open(errorMessage, 'Fechar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });

        if (errorMessage.includes('Login já está em uso')) {
          this.formGroup.get('login')?.setErrors({ loginExists: true });
        } else if (errorMessage.includes('CPF já está em uso')) {
          this.formGroup.get('cpf')?.setErrors({ cpfExists: true });
        } else if (errorMessage.includes('E-mail já está em uso')) {
          this.formGroup.get('email')?.setErrors({ emailExists: true });
        }
        this.isLoading = false;
      },
    });
  }

  excluir() {
    const id = this.formGroup.get('id')?.value;
    if (confirm('Tem certeza que deseja excluir este usuário?') && id) {
      this.usuarioService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Usuário excluído com sucesso!', 'Fechar', {
            duration: 3000,
          });
          this.router.navigateByUrl('/admin/usuarios');
        },
        error: (err) => {
          console.error('Erro ao excluir:', err);
          this.snackBar.open('Erro ao excluir usuário', 'Fechar', {
            duration: 5000,
          });
        },
      });
    }
  }

  abrirDialogNovoTelefone() {
    const dialogRef = this.dialog.open(NovoTelefoneDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result: Telefone) => {
      if (result) {
        this.telefones.push(result);
      }
    });
  }

  abrirDialogNovoEndereco() {
    const dialogRef = this.dialog.open(NovoEnderecoDialogComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe((result: Endereco) => {
      if (result) {
        this.enderecos.push(result);
      }
    });
  }

  removerTelefone(index: number) {
    this.telefones.splice(index, 1);
  }

  removerEndereco(index: number) {
    this.enderecos.splice(index, 1);
  }
}
