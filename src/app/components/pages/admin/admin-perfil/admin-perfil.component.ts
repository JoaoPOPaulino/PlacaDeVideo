import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { firstValueFrom, Observable, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
} from 'rxjs/operators';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '../../../../services/auth.service';
import { Usuario } from '../../../../models/usuario/usuario.model';
import { Telefone } from '../../../../models/usuario/telefone.model';
import { Endereco } from '../../../../models/usuario/endereco.model';
import { UsuarioService } from '../../../../services/usuario.service';
import { NovoEnderecoDialogComponent } from '../../../shared/dialog/novo-endereco-dialog/novo-endereco-dialog.component';
import { NovoTelefoneDialogComponent } from '../../../shared/dialog/novo-telefone-dialog/novo-telefone-dialog.component';
import { SidebarComponent } from '../../../template/sidebar/sidebar.component';
import { ConfirmPasswordDialogComponent } from '../../../shared/dialog/confirm-password-dialog/confirm-password-dialog.component';

enum ProfileTab {
  PERSONAL_INFO = 'PERSONAL_INFO',
  SECURITY = 'SECURITY',
}

@Component({
  selector: 'app-admin-perfil',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    MatDialogModule,
    SidebarComponent,
    MatSidenavModule,
    MatToolbarModule,
    RouterModule,
    RouterOutlet,
    MatTabsModule,
    MatTooltipModule,
  ],
  templateUrl: './admin-perfil.component.html',
  styleUrls: ['./admin-perfil.component.css'],
})
export class AdminPerfilComponent implements OnInit {
  activeTab: ProfileTab = ProfileTab.PERSONAL_INFO;
  ProfileTab = ProfileTab;
  usuario$!: Observable<Usuario | null>;
  perfilForm!: FormGroup;
  securityForm!: FormGroup;
  imagePreview: string | null = null;
  selectedFile: File | null = null;
  passwordChanged = false;
  originalValues: any;

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadUserData();
    this.setupValidations();
  }

  private initializeForms(): void {
    this.perfilForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      login: ['', [Validators.required, Validators.minLength(3)]],
      cpf: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d+$/),
          Validators.minLength(11),
          Validators.maxLength(11),
        ],
      ],
    });

    this.securityForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validator: this.passwordMatchValidator }
    );
  }

  private passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  private loadUserData(): void {
    this.usuario$ = this.authService.getUsuarioLogado();
    this.usuario$.subscribe((usuario: Usuario | null) => {
      if (usuario) {
        this.perfilForm.patchValue({
          nome: usuario.nome,
          email: usuario.email,
          login: usuario.login,
          cpf: usuario.cpf,
        });
        this.originalValues = {
          nome: usuario.nome,
          email: usuario.email,
          login: usuario.login,
          cpf: usuario.cpf,
        };
        this.imagePreview = usuario.nomeImagem
          ? `http://localhost:8080/usuarios/download/imagem/${usuario.nomeImagem}`
          : null;
      } else {
        this.showSnackBar('Usuário não encontrado.');
      }
    });
  }

  private setupValidations(): void {
    const loginControl = this.perfilForm.get('login');
    const emailControl = this.perfilForm.get('email');
    const cpfControl = this.perfilForm.get('cpf');

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

  validateLogin(login: string): Observable<boolean> {
    if (!login || login.length < 3) return of(false);
    const currentUsuario = this.authService.getUsuarioLogadoSnapshot();
    if (currentUsuario && currentUsuario.login === login) return of(false);
    return this.usuarioService.checkLoginExists(login).pipe(
      map((exists) => {
        if (exists)
          this.perfilForm.get('login')?.setErrors({ loginExists: true });
        return exists;
      }),
      catchError(() => of(false))
    );
  }

  validateEmail(email: string): Observable<boolean> {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return of(false);
    const currentUsuario = this.authService.getUsuarioLogadoSnapshot();
    if (currentUsuario && currentUsuario.email === email) return of(false);
    return this.usuarioService.checkEmailExists(email).pipe(
      map((exists) => {
        if (exists)
          this.perfilForm.get('email')?.setErrors({ emailExists: true });
        return exists;
      }),
      catchError(() => of(false))
    );
  }

  validateCpf(cpf: string): Observable<boolean> {
    const cpfNumeros = cpf.replace(/\D/g, '');
    if (!cpfNumeros || cpfNumeros.length !== 11) return of(false);
    const currentUsuario = this.authService.getUsuarioLogadoSnapshot();
    if (currentUsuario && currentUsuario.cpf === cpfNumeros) return of(false);
    return this.usuarioService.checkCpfExists(cpfNumeros).pipe(
      map((exists) => {
        if (exists) this.perfilForm.get('cpf')?.setErrors({ cpfExists: true });
        return exists;
      }),
      catchError(() => of(false))
    );
  }

  hasChanges(): boolean {
    if (!this.originalValues || !this.perfilForm) return false;
    const currentValues = this.perfilForm.value;
    return Object.keys(this.originalValues).some(
      (key) => currentValues[key] !== this.originalValues[key]
    );
  }

  async onSubmit(): Promise<void> {
    if (this.perfilForm.invalid) {
      this.showSnackBar('Formulário inválido. Verifique os campos.');
      return;
    }

    const usuarioAtual = this.authService.getUsuarioLogadoSnapshot();
    if (!usuarioAtual) {
      this.showSnackBar('Usuário não encontrado.');
      return;
    }

    const formValues = this.perfilForm.value;
    const camposSensiveisAlterados =
      formValues.login !== usuarioAtual.login ||
      formValues.email !== usuarioAtual.email ||
      formValues.cpf !== usuarioAtual.cpf;

    if (camposSensiveisAlterados) {
      const senhaValida = await firstValueFrom(
        this.openPasswordConfirmDialog('alterar informações sensíveis')
      );
      if (!senhaValida) {
        this.showSnackBar('Senha incorreta. Alterações não salvas.');
        return;
      }
    }

    const usuarioId = this.authService.getUsuarioId();
    if (!usuarioId) {
      this.showSnackBar('Usuário não encontrado.');
      return;
    }

    const payload = {
      nome: formValues.nome,
      email: formValues.email,
      login: formValues.login,
      cpf: formValues.cpf.replace(/\D/g, ''),
      perfil: usuarioAtual.perfil.label.toUpperCase(),
      nomeImagem: usuarioAtual.nomeImagem,
    };

    this.usuarioService.update(payload, usuarioId).subscribe({
      next: (updatedUsuario) => {
        this.authService.updateUsuarioLogado(updatedUsuario);
        this.originalValues = {
          nome: updatedUsuario.nome,
          email: updatedUsuario.email,
          login: updatedUsuario.login,
          cpf: updatedUsuario.cpf,
        };
        this.showSnackBar('Perfil atualizado com sucesso!');
      },
      error: (err) => {
        const message = err.message.includes('Login já está em uso')
          ? 'Login já está em uso.'
          : `Erro ao atualizar perfil: ${err.error?.message || err.message}`;
        this.showSnackBar(message, 5000);
        if (err.message.includes('Login já está em uso')) {
          this.perfilForm.get('login')?.setErrors({ loginExists: true });
        }
      },
    });
  }

  onChangePassword(): void {
    if (this.securityForm.invalid) {
      this.showSnackBar('Preencha todos os campos corretamente.');
      return;
    }

    const usuarioId = this.authService.getUsuarioId();
    if (!usuarioId) {
      this.showSnackBar('Usuário não encontrado.');
      return;
    }

    const { currentPassword, newPassword } = this.securityForm.value;

    this.usuarioService
      .changePassword(usuarioId, currentPassword, newPassword)
      .subscribe({
        next: () => {
          this.passwordChanged = true;
          this.securityForm.reset();
          this.showSnackBar('Senha alterada com sucesso!');
        },
        error: (err) => {
          this.showSnackBar(
            err.error?.message || 'Erro ao alterar senha',
            5000
          );
        },
      });
  }

  onRequestPasswordReset(): void {
    const email = this.perfilForm.get('email')?.value;
    if (!email) {
      this.showSnackBar('E-mail não encontrado.');
      return;
    }

    const snackBarRef = this.showSnackBar('Enviando e-mail...');
    this.authService.solicitarRecuperacaoSenha(email).subscribe({
      next: (response) => {
        snackBarRef.dismiss();
        this.showSnackBar(
          response.message || 'E-mail de recuperação enviado!',
          5000
        );
      },
      error: (err) => {
        snackBarRef.dismiss();
        this.showSnackBar(err.error?.message || 'Erro ao enviar e-mail.', 5000);
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => (this.imagePreview = reader.result as string);
      reader.readAsDataURL(this.selectedFile);
    }
  }

  uploadImagem(): void {
    const usuarioId = this.authService.getUsuarioId();
    if (usuarioId && this.selectedFile) {
      const snackBarRef = this.showSnackBar('Enviando imagem...');
      this.usuarioService.uploadImagem(usuarioId, this.selectedFile).subscribe({
        next: (updatedUsuario) => {
          snackBarRef.dismiss();
          this.authService.updateUsuarioLogado(updatedUsuario);
          this.imagePreview = `http://localhost:8080/usuarios/download/imagem/${
            updatedUsuario.nomeImagem
          }?timestamp=${Date.now()}`;
          this.selectedFile = null;
          this.showSnackBar('Imagem atualizada com sucesso!');
        },
        error: (err) => {
          snackBarRef.dismiss();
          this.showSnackBar(`Erro ao atualizar imagem: ${err.message}`, 5000);
        },
      });
    }
  }

  openTelefoneDialog(): void {
    const dialogRef = this.dialog.open(NovoTelefoneDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((telefone: Telefone) => {
      if (telefone) this.addTelefone(telefone);
    });
  }

  private addTelefone(telefone: Telefone): void {
    const usuarioId = this.authService.getUsuarioId();
    const currentUsuario = this.authService.getUsuarioLogadoSnapshot();
    if (usuarioId && currentUsuario) {
      const updatedTelefones = [...(currentUsuario.telefones || []), telefone];
      const payload = {
        ...currentUsuario,
        telefones: updatedTelefones,
        enderecos: currentUsuario.enderecos || [],
        perfil: currentUsuario.perfil.label.toUpperCase(),
      };
      this.updateUsuario(
        payload,
        Number(usuarioId),
        'Telefone adicionado com sucesso!',
        'adicionar telefone'
      );
    }
  }

  removeTelefone(telefoneId: number): void {
    const usuarioId = this.authService.getUsuarioId();
    const currentUsuario = this.authService.getUsuarioLogadoSnapshot();
    if (usuarioId && currentUsuario) {
      const updatedTelefones =
        currentUsuario.telefones?.filter((t) => t.id !== telefoneId) || [];
      const payload = {
        ...currentUsuario,
        telefones: updatedTelefones,
        enderecos: currentUsuario.enderecos || [],
        perfil: currentUsuario.perfil.label.toUpperCase(),
      };
      this.updateUsuario(
        payload,
        Number(usuarioId),
        'Telefone removido com sucesso!',
        'remover telefone'
      );
    }
  }

  openEnderecoDialog(): void {
    const dialogRef = this.dialog.open(NovoEnderecoDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((endereco: Endereco) => {
      if (endereco) this.addEndereco(endereco);
    });
  }

  private addEndereco(endereco: Endereco): void {
    const usuarioId = this.authService.getUsuarioId();
    const currentUsuario = this.authService.getUsuarioLogadoSnapshot();
    if (usuarioId && currentUsuario) {
      const updatedEnderecos = [...(currentUsuario.enderecos || []), endereco];
      const payload = {
        ...currentUsuario,
        telefones: currentUsuario.telefones || [],
        enderecos: updatedEnderecos,
        perfil: currentUsuario.perfil.label.toUpperCase(),
      };
      this.updateUsuario(
        payload,
        Number(usuarioId),
        'Endereço adicionado com sucesso!',
        'adicionar endereço'
      );
    }
  }

  removeEndereco(enderecoId: number): void {
    const usuarioId = this.authService.getUsuarioId();
    const currentUsuario = this.authService.getUsuarioLogadoSnapshot();
    if (usuarioId && currentUsuario) {
      const updatedEnderecos =
        currentUsuario.enderecos?.filter((e) => e.id !== enderecoId) || [];
      const payload = {
        ...currentUsuario,
        telefones: currentUsuario.telefones || [],
        enderecos: updatedEnderecos,
        perfil: currentUsuario.perfil.label.toUpperCase(),
      };
      this.updateUsuario(
        payload,
        Number(usuarioId),
        'Endereço removido com sucesso!',
        'remover endereço'
      );
    }
  }

  onDeleteAccount(): void {
    const dialogRef = this.dialog.open(ConfirmPasswordDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((senha: string | null) => {
      if (!senha) return;

      const usuarioId = this.authService.getUsuarioId();
      if (!usuarioId) {
        this.showSnackBar('Usuário não encontrado.');
        return;
      }

      this.authService.validarSenha(usuarioId, senha).subscribe({
        next: (valido) => {
          if (valido) {
            this.usuarioService.delete(usuarioId).subscribe({
              next: () => {
                this.authService.logout();
                this.showSnackBar('Conta excluída com sucesso!');
                window.location.href = '/';
              },
              error: (err) => {
                this.showSnackBar(
                  `Erro ao excluir conta: ${err.error?.message || err.message}`,
                  5000
                );
              },
            });
          } else {
            this.showSnackBar('Senha incorreta.');
          }
        },
        error: () => {
          this.showSnackBar('Erro ao validar senha.', 5000);
        },
      });
    });
  }

  private updateUsuario(
    payload: any,
    usuarioId: number,
    successMessage: string,
    errorAction: string
  ): void {
    this.usuarioService.update(payload, usuarioId).subscribe({
      next: (updatedUsuario) => {
        this.authService.updateUsuarioLogado(updatedUsuario);
        this.showSnackBar(successMessage);
      },
      error: (err) => {
        this.showSnackBar(`Erro ao ${errorAction}: ${err.message}`, 5000);
      },
    });
  }

  private openPasswordConfirmDialog(action: string): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmPasswordDialogComponent, {
      width: '400px',
      data: { action },
    });

    return dialogRef.afterClosed().pipe(
      switchMap((password: string | null) => {
        if (!password) return of(false);

        const usuarioId = this.authService.getUsuarioId();
        if (!usuarioId) {
          this.showSnackBar('Usuário não encontrado.');
          return of(false);
        }

        return this.authService.validarSenha(usuarioId, password).pipe(
          catchError(() => {
            this.showSnackBar('Erro ao validar senha.');
            return of(false);
          })
        );
      })
    );
  }

  private showSnackBar(message: string, duration: number = 3000) {
    return this.snackBar.open(message, 'Fechar', { duration });
  }
}
