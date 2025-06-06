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
import { firstValueFrom, Observable, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
} from 'rxjs/operators';
import { FooterComponent } from '../../../template/shared/footer/footer.component';
import { PublicHeaderComponent } from '../../../template/public/public-header/public-header.component';
import { ConfirmPasswordDialogComponent } from '../../../shared/dialog/confirm-password-dialog/confirm-password-dialog.component';

enum ProfileTab {
  PERSONAL_INFO = 'PERSONAL_INFO',
  SECURITY = 'SECURITY',
  ORDERS = 'ORDERS',
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
  originalValues: any;

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
      cpf: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d+$/), // Só aceita números
          Validators.minLength(11), // Mínimo 11 dígitos
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

    this.usuario$.subscribe((usuario) => {
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
        this.snackBar.open('Usuário não encontrado.', 'Fechar', {
          duration: 3000,
        });
      }
    });

    this.setupValidations();
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
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

  async onSubmitPersonalInfo(): Promise<void> {
    if (this.perfilForm.invalid) {
      this.snackBar.open(
        'Formulário inválido. Verifique os campos.',
        'Fechar',
        { duration: 3000 }
      );
      return;
    }

    const usuarioAtual = this.authService.getUsuarioLogadoSnapshot();
    if (!usuarioAtual) {
      this.snackBar.open('Usuário não encontrado.', 'Fechar', {
        duration: 3000,
      });
      return;
    }

    // Verificar se campos sensíveis foram alterados
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
        this.snackBar.open(
          'Senha incorreta. Alterações não salvas.',
          'Fechar',
          { duration: 3000 }
        );
        return;
      }
    }

    const usuarioId = this.authService.getUsuarioId();
    if (!usuarioId) {
      this.snackBar.open('Usuário não encontrado.', 'Fechar', {
        duration: 3000,
      });
      return;
    }

    // Criar payload simplificado - apenas campos que podem ser atualizados
    const payload = {
      nome: formValues.nome,
      email: formValues.email,
      login: formValues.login,
      cpf: formValues.cpf.replace(/\D/g, ''),
      perfil: usuarioAtual.perfil.id, // Mantém o perfil existente
      nomeImagem: usuarioAtual.nomeImagem, // Mantém a imagem existente
      // Não envia telefones e endereços - devem ser gerenciados separadamente
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
        this.snackBar.open('Perfil atualizado com sucesso!', 'Fechar', {
          duration: 3000,
        });
      },
      error: (err) => {
        console.error('Erro ao atualizar usuário:', err);
        this.snackBar.open(
          `Erro ao atualizar perfil: ${err.error?.message || err.message}`,
          'Fechar',
          { duration: 5000 }
        );
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
        console.log('Telefone payload:', telefone);
        const usuarioId = this.authService.getUsuarioId();
        if (usuarioId) {
          this.usuarioService.addTelefone(usuarioId, telefone).subscribe({
            next: (updatedUsuario) => {
              this.authService.updateUsuarioLogado(updatedUsuario);
              this.usuario$ = of(updatedUsuario);
              this.snackBar.open(
                'Telefone adicionado com sucesso!',
                'Sucesso',
                { duration: 3000 }
              );
            },
            error: (err) => {
              console.error('Erro ao adicionar telefone:', err);
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

  removeTelefone(telefoneId: number): void {
    const usuarioId = this.authService.getUsuarioId();
    if (!usuarioId) {
      this.snackBar.open('Usuário não encontrado.', 'Fechar', {
        duration: 3000,
      });
      return;
    }

    const snackBarRef = this.snackBar.open('Removendo telefone...', 'Fechar');

    this.usuarioService.removeTelefone(usuarioId, telefoneId).subscribe({
      next: (updatedUsuario) => {
        snackBarRef.dismiss();
        this.authService.updateUsuarioLogado(updatedUsuario);
        this.usuario$ = of(updatedUsuario);
        this.snackBar.open('Telefone removido com sucesso!', 'Sucesso', {
          duration: 3000,
        });
      },
      error: (err) => {
        snackBarRef.dismiss();
        console.error('Erro ao remover telefone:', err);
        this.snackBar.open(
          `Erro ao remover telefone: ${err.error?.message || err.message}`,
          'Fechar',
          { duration: 5000 }
        );
      },
    });
  }

  openEnderecoDialog(): void {
    const dialogRef = this.dialog.open(NovoEnderecoDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((endereco: Endereco) => {
      if (endereco) {
        console.log('Endereço payload:', endereco); // Add this
        const usuarioId = this.authService.getUsuarioId();
        if (usuarioId) {
          this.usuarioService.addEndereco(usuarioId, endereco).subscribe({
            next: (updatedUsuario) => {
              this.authService.updateUsuarioLogado(updatedUsuario);
              this.usuario$ = of(updatedUsuario);
              this.snackBar.open(
                'Endereço adicionado com sucesso!',
                'Sucesso',
                { duration: 3000 }
              );
            },
            error: (err) => {
              console.error('Erro ao adicionar endereço:', err);
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

  removeEndereco(enderecoId: number): void {
    const usuarioId = this.authService.getUsuarioId();
    if (!usuarioId) {
      this.snackBar.open('Usuário não encontrado.', 'Fechar', {
        duration: 3000,
      });
      return;
    }

    const snackBarRef = this.snackBar.open('Removendo endereço...', 'Fechar');

    this.usuarioService.removeEndereco(usuarioId, enderecoId).subscribe({
      next: (updatedUsuario) => {
        snackBarRef.dismiss();
        this.authService.updateUsuarioLogado(updatedUsuario);
        this.usuario$ = of(updatedUsuario);
        this.snackBar.open('Endereço removido com sucesso!', 'Sucesso', {
          duration: 3000,
        });
      },
      error: (err) => {
        snackBarRef.dismiss();
        console.error('Erro ao remover endereço:', err);
        this.snackBar.open(
          `Erro ao remover endereço: ${err.error?.message || err.message}`,
          'Fechar',
          { duration: 5000 }
        );
      },
    });
  }

  onChangePassword(): void {
    if (this.securityForm.invalid) {
      this.snackBar.open('Preencha todos os campos corretamente.', 'Fechar', {
        duration: 3000,
      });
      return;
    }

    const usuarioId = this.authService.getUsuarioId();
    if (!usuarioId) {
      this.snackBar.open('Usuário não encontrado.', 'Fechar', {
        duration: 3000,
      });
      return;
    }

    const { currentPassword, newPassword } = this.securityForm.value;

    this.usuarioService
      .changePassword(usuarioId, currentPassword, newPassword)
      .subscribe({
        next: () => {
          this.passwordChanged = true;
          this.securityForm.reset();
          this.snackBar.open('Senha alterada com sucesso!', 'Fechar', {
            duration: 3000,
          });
        },
        error: (err) => {
          this.snackBar.open(
            err.error?.message || 'Erro ao alterar senha',
            'Fechar',
            { duration: 5000 }
          );
        },
      });
  }

  onRequestPasswordReset(): void {
    const email = this.perfilForm.get('email')?.value;
    if (!email) {
      this.snackBar.open('E-mail não encontrado.', 'Fechar', {
        duration: 3000,
      });
      return;
    }
    const snackBarRef = this.snackBar.open('Enviando e-mail...', 'Fechar');
    this.authService.solicitarRecuperacaoSenha(email).subscribe({
      next: (response) => {
        snackBarRef.dismiss();
        this.snackBar.open(
          response.message || 'E-mail de recuperação enviado!',
          'Fechar',
          { duration: 5000 }
        );
      },
      error: (err) => {
        snackBarRef.dismiss();
        this.snackBar.open(
          err.error?.message || 'Erro ao enviar e-mail.',
          'Fechar',
          { duration: 5000 }
        );
      },
    });
  }

  validateCpf(cpf: string) {
    const cpfNumeros = cpf.replace(/\D/g, '');

    if (!cpfNumeros || cpfNumeros.length !== 11) {
      return of(false);
    }

    return this.usuarioService.checkCpfExists(cpfNumeros).pipe(
      map((exists) => {
        if (exists) {
          this.perfilForm.get('cpf')?.setErrors({ cpfExists: true });
        }
        return exists;
      }),
      catchError(() => of(false))
    );
  }

  onDeleteAccount(): void {
    const dialogRef = this.dialog.open(ConfirmPasswordDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((senha: string | null) => {
      if (!senha) return;

      const usuarioId = this.authService.getUsuarioId();
      if (!usuarioId) {
        this.snackBar.open('Usuário não encontrado.', 'Fechar', {
          duration: 3000,
        });
        return;
      }

      // Verifica a senha antes de excluir
      this.authService.validarSenha(usuarioId, senha).subscribe({
        next: (valido) => {
          if (valido) {
            this.usuarioService.delete(usuarioId).subscribe({
              next: () => {
                this.authService.logout();
                this.snackBar.open('Conta excluída com sucesso!', 'Fechar', {
                  duration: 3000,
                });
                window.location.href = '/';
              },
              error: (err) => {
                this.snackBar.open(
                  `Erro ao excluir conta: ${err.error?.message || err.message}`,
                  'Fechar',
                  { duration: 5000 }
                );
              },
            });
          } else {
            this.snackBar.open('Senha incorreta.', 'Fechar', {
              duration: 3000,
            });
          }
        },
        error: () => {
          this.snackBar.open('Erro ao validar senha.', 'Fechar', {
            duration: 5000,
          });
        },
      });
    });
  }

  openPasswordConfirmDialog(action: string): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmPasswordDialogComponent, {
      width: '400px',
      data: { action },
    });

    return dialogRef.afterClosed().pipe(
      switchMap((password: string | null) => {
        if (!password) return of(false);

        const usuarioId = this.authService.getUsuarioId();
        if (!usuarioId) {
          this.snackBar.open('Usuário não encontrado.', 'Fechar', {
            duration: 3000,
          });
          return of(false);
        }

        return this.authService.validarSenha(usuarioId, password).pipe(
          catchError(() => {
            this.snackBar.open('Erro ao validar senha.', 'Fechar', {
              duration: 3000,
            });
            return of(false);
          })
        );
      })
    );
  }

  hasChanges(): boolean {
    if (!this.originalValues || !this.perfilForm) {
      return false;
    }

    const currentValues = this.perfilForm.value;

    return Object.keys(this.originalValues).some(
      (key) => currentValues[key] !== this.originalValues[key]
    );
  }

  formatCPF() {
    let cpfControl = this.perfilForm.get('cpf');
    if (cpfControl) {
      // Remove tudo que não é dígito
      let value = cpfControl.value.replace(/\D/g, '');

      // Limita a 11 caracteres
      if (value.length > 11) {
        value = value.substring(0, 11);
      }

      // Atualiza o valor no controle
      cpfControl.setValue(value, { emitEvent: false });
    }
  }
}
