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
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { UsuarioService } from '../../../../services/usuario.service';
import { Usuario } from '../../../../models/usuario/usuario.model';
import { Telefone } from '../../../../models/usuario/telefone.model';
import { Endereco } from '../../../../models/usuario/endereco.model';
import { NovoTelefoneDialogComponent } from '../../../shared/dialog/novo-telefone-dialog/novo-telefone-dialog.component';
import { NovoEnderecoDialogComponent } from '../../../shared/dialog/novo-endereco-dialog/novo-endereco-dialog.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
} from 'rxjs/operators';
import { FooterComponent } from '../../../template/shared/footer/footer.component';
import { PublicHeaderComponent } from '../../../template/public/public-header/public-header.component';


enum ProfileTab {
  PERSONAL_INFO = 'PERSONAL_INFO',
  SECURITY = 'SECURITY',
  ORDERS = 'ORDERS'
}

@Component({
  selector: 'app-user-perfil',
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
    RouterModule,
    MatDialogModule,
    FooterComponent,
    PublicHeaderComponent,
  ],
  templateUrl: './user-perfil.component.html',
  styleUrls: ['./user-perfil.component.css'],
})
export class UserPerfilComponent implements OnInit {

  activeTab: ProfileTab = ProfileTab.PERSONAL_INFO;
  ProfileTab = ProfileTab;

  securityForm!: FormGroup;
  showChangePassword = false;
  passwordChanged = false;

  usuario$!: Observable<Usuario | null>;
  perfilForm!: FormGroup;
  imagePreview: string | null = null;
  selectedFile: File | null = null;

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Carrega o usuário logado
    this.usuario$ = this.authService.getUsuarioLogado().pipe(
      switchMap((usuario) => {
        if (usuario) {
          return of(usuario);
        } else {
          const usuarioId = this.authService.getUsuarioId();
          if (usuarioId) {
            return this.usuarioService.findById(usuarioId.toString()).pipe(
              catchError((err) => {
                this.snackBar.open('Erro ao carregar usuário', 'Fechar', {
                  duration: 3000,
                });
                return of(null);
              })
            );
          }
          return of(null);
        }
      })
    );

    this.perfilForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      login: ['', [Validators.required, Validators.minLength(3)]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
    });

    this.securityForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });

    this.usuario$.subscribe((usuario) => {
      if (usuario) {
        this.perfilForm.patchValue({
          nome: usuario.nome,
          email: usuario.email,
          login: usuario.login,
          cpf: usuario.cpf,
        });
        this.imagePreview = usuario.nomeImagem
          ? `http://localhost:8080/usuarios/download/imagem/${usuario.nomeImagem}`
          : null;
      } else {
        this.snackBar.open('Usuário não encontrado.', 'Fechar', {
          duration: 3000,
        });
      }
    });

    this.setupValidations();
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value 
      ? null : { mismatch: true };
  }

  setupValidations() {
    const loginControl = this.perfilForm.get('login');
    const emailControl = this.perfilForm.get('email');

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
  }

  validateLogin(login: string): Observable<boolean> {
    if (!login || login.length < 3) {
      return of(false);
    }
    const currentUsuario = this.authService.getUsuarioLogadoSnapshot();
    if (currentUsuario && currentUsuario.login === login) {
      return of(false);
    }
    return this.usuarioService.checkLoginExists(login).pipe(
      map((exists) => {
        if (exists) {
          this.perfilForm.get('login')?.setErrors({ loginExists: true });
        }
        return exists;
      }),
      catchError(() => of(false))
    );
  }

  validateEmail(email: string): Observable<boolean> {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return of(false);
    }
    const currentUsuario = this.authService.getUsuarioLogadoSnapshot();
    if (currentUsuario && currentUsuario.email === email) {
      return of(false);
    }
    return this.usuarioService.checkEmailExists(email).pipe(
      map((exists) => {
        if (exists) {
          this.perfilForm.get('email')?.setErrors({ emailExists: true });
        }
        return exists;
      }),
      catchError(() => of(false))
    );
  }

  onSubmitPersonalInfo(): void {
    if (this.perfilForm.invalid) {
      this.snackBar.open('Formulário inválido. Verifique os campos.', 'Fechar', { duration: 3000 });
      return;
    }

    const usuarioId = this.authService.getUsuarioId();
    if (!usuarioId) {
      this.snackBar.open('Usuário não encontrado.', 'Fechar', { duration: 3000 });
      return;
    }

    const payload = {
      ...this.perfilForm.value,
      perfil: {
        id: this.authService.getUsuarioLogadoSnapshot()?.perfil.id || 1,
        label: 'USER',
      },
      telefones: this.authService.getUsuarioLogadoSnapshot()?.telefones || [],
      enderecos: this.authService.getUsuarioLogadoSnapshot()?.enderecos || [],
    };

    this.usuarioService.update(payload, usuarioId).subscribe({
      next: (updatedUsuario) => {
        this.authService.updateUsuarioLogado(updatedUsuario);
        this.snackBar.open('Perfil atualizado com sucesso!', 'Fechar', { duration: 3000 });
      },
      error: (err) => {
        const message = err.message.includes('Login já está em uso')
          ? 'Login já está em uso.'
          : err.message.includes('CPF')
          ? 'CPF inválido ou já em uso.'
          : `Erro ao atualizar perfil: ${err.message}`;
        this.snackBar.open(message, 'Fechar', { duration: 5000 });
        if (err.message.includes('Login já está em uso')) {
          this.perfilForm.get('login')?.setErrors({ loginExists: true });
        } else if (err.message.includes('CPF')) {
          this.perfilForm.get('cpf')?.setErrors({ cpfInvalid: true });
        }
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
      const snackBarRef = this.snackBar.open('Enviando imagem...', 'Fechar');

      this.usuarioService.uploadImagem(usuarioId, this.selectedFile).subscribe({
        next: (updatedUsuario) => {
          snackBarRef.dismiss();
          this.authService.updateUsuarioLogado(updatedUsuario);
          this.imagePreview = `http://localhost:8080/usuarios/download/imagem/${
            updatedUsuario.nomeImagem
          }?timestamp=${Date.now()}`;
          this.selectedFile = null;
          this.snackBar.open('Imagem atualizada com sucesso!', 'Fechar', {
            duration: 3000,
          });
        },
        error: (err) => {
          snackBarRef.dismiss();
          this.snackBar.open(
            `Erro ao atualizar imagem: ${err.message}`,
            'Fechar',
            { duration: 5000 }
          );
        },
      });
    }
  }

  openTelefoneDialog(): void {
    const dialogRef = this.dialog.open(NovoTelefoneDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((telefone: Telefone) => {
      if (telefone) {
        const usuarioId = this.authService.getUsuarioId();
        if (usuarioId) {
          const currentUsuario = this.authService.getUsuarioLogadoSnapshot();
          const updatedTelefones = [
            ...(currentUsuario?.telefones || []),
            telefone,
          ];
          const payload = {
            ...currentUsuario,
            telefones: updatedTelefones,
            enderecos: currentUsuario?.enderecos || [],
            perfil: currentUsuario?.perfil.label.toUpperCase(),
          };
          this.usuarioService.update(payload, usuarioId).subscribe({
            next: (updatedUsuario) => {
              this.authService.updateUsuarioLogado(updatedUsuario);
              this.snackBar.open('Telefone adicionado com sucesso!', 'Fechar', {
                duration: 3000,
              });
            },
            error: (err) => {
              this.snackBar.open(
                `Erro ao adicionar telefone: ${err.message}`,
                'Fechar',
                { duration: 5000 }
              );
            },
          });
        }
      }
    });
  }

  openEnderecoDialog(): void {
    const dialogRef = this.dialog.open(NovoEnderecoDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((endereco: Endereco) => {
      if (endereco) {
        const usuarioId = this.authService.getUsuarioId();
        if (usuarioId) {
          const currentUsuario = this.authService.getUsuarioLogadoSnapshot();
          const updatedEnderecos = [
            ...(currentUsuario?.enderecos || []),
            endereco,
          ];
          const payload = {
            ...currentUsuario,
            telefones: currentUsuario?.telefones || [],
            enderecos: updatedEnderecos,
            perfil: currentUsuario?.perfil.label.toUpperCase(),
          };
          this.usuarioService.update(payload, usuarioId).subscribe({
            next: (updatedUsuario) => {
              this.authService.updateUsuarioLogado(updatedUsuario);
              this.snackBar.open('Endereço adicionado com sucesso!', 'Fechar', {
                duration: 3000,
              });
            },
            error: (err) => {
              this.snackBar.open(
                `Erro ao adicionar endereço: ${err.message}`,
                'Fechar',
                { duration: 5000 }
              );
            },
          });
        }
      }
    });
  }

  removeTelefone(index: number): void {
    const usuarioId = this.authService.getUsuarioId();
    if (usuarioId) {
      const currentUsuario = this.authService.getUsuarioLogadoSnapshot();
      const updatedTelefones = [...(currentUsuario?.telefones || [])];
      updatedTelefones.splice(index, 1);
      const payload = {
        ...currentUsuario,
        telefones: updatedTelefones,
        enderecos: currentUsuario?.enderecos || [],
        perfil: currentUsuario?.perfil.label.toUpperCase(),
      };
      this.usuarioService.update(payload, usuarioId).subscribe({
        next: (updatedUsuario) => {
          this.authService.updateUsuarioLogado(updatedUsuario);
          this.snackBar.open('Telefone removido com sucesso!', 'Fechar', {
            duration: 3000,
          });
        },
        error: (err) => {
          this.snackBar.open(
            `Erro ao remover telefone: ${err.message}`,
            'Fechar',
            { duration: 5000 }
          );
        },
      });
    }
  }

  removeEndereco(index: number): void {
    const usuarioId = this.authService.getUsuarioId();
    if (usuarioId) {
      const currentUsuario = this.authService.getUsuarioLogadoSnapshot();
      const updatedEnderecos = [...(currentUsuario?.enderecos || [])];
      updatedEnderecos.splice(index, 1);
      const payload = {
        ...currentUsuario,
        telefones: currentUsuario?.telefones || [],
        enderecos: updatedEnderecos,
        perfil: currentUsuario?.perfil.label.toUpperCase(),
      };
      this.usuarioService.update(payload, usuarioId).subscribe({
        next: (updatedUsuario) => {
          this.authService.updateUsuarioLogado(updatedUsuario);
          this.snackBar.open('Endereço removido com sucesso!', 'Fechar', {
            duration: 3000,
          });
        },
        error: (err) => {
          this.snackBar.open(
            `Erro ao remover endereço: ${err.message}`,
            'Fechar',
            { duration: 5000 }
          );
        },
      });
    }
  }

  onChangePassword(): void {
    if (this.securityForm.invalid) {
      this.snackBar.open('Preencha todos os campos corretamente.', 'Fechar', { duration: 3000 });
      return;
    }

    const usuarioId = this.authService.getUsuarioId();
    if (!usuarioId) {
      this.snackBar.open('Usuário não encontrado.', 'Fechar', { duration: 3000 });
      return;
    }

    const { currentPassword, newPassword } = this.securityForm.value;

    this.usuarioService.changePassword(usuarioId, currentPassword, newPassword).subscribe({
      next: () => {
        this.passwordChanged = true;
        this.securityForm.reset();
        this.snackBar.open('Senha alterada com sucesso!', 'Fechar', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Erro ao alterar senha', 'Fechar', { duration: 5000 });
      }
    });
  }

  onRequestPasswordReset(): void {
  const email = this.perfilForm.get('email')?.value;
  if (!email) {
    this.snackBar.open('E-mail não encontrado no formulário.', 'Fechar', { duration: 3000 });
    return;
  }

  const snackBarRef = this.snackBar.open('Enviando e-mail de recuperação...', 'Fechar');

  this.usuarioService.requestPasswordReset(email).subscribe({
    next: () => {
      snackBarRef.dismiss();
      this.snackBar.open('E-mail de recuperação enviado! Verifique sua caixa de entrada.', 'Fechar', { 
        duration: 5000,
        panelClass: ['success-snackbar'] 
      });
    },
    error: (err) => {
      snackBarRef.dismiss();
      const errorMessage = err.error?.message || 
                         err.message || 
                         'Erro ao enviar e-mail de recuperação. Tente novamente mais tarde.';
      this.snackBar.open(errorMessage, 'Fechar', { 
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  });
}
}
