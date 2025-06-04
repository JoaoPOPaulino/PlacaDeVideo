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
import { Observable, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
} from 'rxjs/operators';
import { AuthService } from '../../../../services/auth.service';
import { UsuarioService } from '../../../../services/usuario.service';
import { Usuario } from '../../../../models/usuario/usuario.model';
import { Telefone } from '../../../../models/usuario/telefone.model';
import { Endereco } from '../../../../models/usuario/endereco.model';
import { NovoTelefoneDialogComponent } from '../../../shared/dialog/novo-telefone-dialog/novo-telefone-dialog.component';
import { NovoEnderecoDialogComponent } from '../../../shared/dialog/novo-endereco-dialog/novo-endereco-dialog.component';

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
  ],
  templateUrl: './admin-perfil.component.html',
  styleUrls: ['./admin-perfil.component.css'],
})
export class AdminPerfilComponent implements OnInit {
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
    this.initializeForm();
    this.loadUserData();
    this.setupValidations();
  }

  private initializeForm(): void {
    this.perfilForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      login: ['', [Validators.required, Validators.minLength(3)]],
      senha: ['', [Validators.minLength(6)]],
    });
  }

  private loadUserData(): void {
    this.usuario$ = this.authService.getUsuarioLogado();
    this.usuario$.subscribe((usuario) => {
      if (usuario) {
        this.perfilForm.patchValue({
          nome: usuario.nome,
          email: usuario.email,
          login: usuario.login,
        });
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

  onSubmit(): void {
    if (this.perfilForm.invalid) {
      this.showSnackBar('Formulário inválido. Verifique os campos.');
      return;
    }

    const usuarioId = this.authService.getUsuarioId();
    if (!usuarioId) {
      this.showSnackBar('Usuário não encontrado.');
      return;
    }

    const currentUsuario = this.authService.getUsuarioLogadoSnapshot();
    if (!currentUsuario) {
      this.showSnackBar('Dados do usuário não disponíveis.');
      return;
    }

    const payload = {
      nome: this.perfilForm.value.nome,
      email: this.perfilForm.value.email,
      login: this.perfilForm.value.login,
      senha: this.perfilForm.value.senha || undefined,
      perfil: currentUsuario.perfil.label.toUpperCase(),
      telefones: currentUsuario.telefones || [],
      enderecos: currentUsuario.enderecos || [],
    };

    this.usuarioService.update(payload, Number(usuarioId)).subscribe({
      next: (updatedUsuario) => {
        this.authService.updateUsuarioLogado(updatedUsuario);
        this.showSnackBar('Perfil atualizado com sucesso!');
      },
      error: (err) => {
        const message = err.message.includes('Login já está em uso')
          ? 'Login já está em uso.'
          : `Erro ao atualizar perfil: ${err.message}`;
        this.showSnackBar(message, 5000);
        if (err.message.includes('Login já está em uso')) {
          this.perfilForm.get('login')?.setErrors({ loginExists: true });
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
      this.usuarioService
        .uploadImagem(Number(usuarioId), this.selectedFile)
        .subscribe({
          next: (updatedUsuario) => {
            this.authService.updateUsuarioLogado(updatedUsuario);
            this.showSnackBar('Imagem atualizada com sucesso!');
          },
          error: (err) => {
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
      if (telefone) {
        this.addTelefone(telefone);
      }
    });
  }

  private addTelefone(telefone: Telefone): void {
    const usuarioId = this.authService.getUsuarioId();
    if (usuarioId) {
      const currentUsuario = this.authService.getUsuarioLogadoSnapshot();
      if (!currentUsuario) return;

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

  openEnderecoDialog(): void {
    const dialogRef = this.dialog.open(NovoEnderecoDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((endereco: Endereco) => {
      if (endereco) {
        this.addEndereco(endereco);
      }
    });
  }

  private addEndereco(endereco: Endereco): void {
    const usuarioId = this.authService.getUsuarioId();
    if (usuarioId) {
      const currentUsuario = this.authService.getUsuarioLogadoSnapshot();
      if (!currentUsuario) return;

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

  removeTelefone(index: number): void {
    const usuarioId = this.authService.getUsuarioId();
    if (usuarioId) {
      const currentUsuario = this.authService.getUsuarioLogadoSnapshot();
      if (!currentUsuario) return;

      const updatedTelefones = [...(currentUsuario.telefones || [])];
      updatedTelefones.splice(index, 1);
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

  removeEndereco(index: number): void {
    const usuarioId = this.authService.getUsuarioId();
    if (usuarioId) {
      const currentUsuario = this.authService.getUsuarioLogadoSnapshot();
      if (!currentUsuario) return;

      const updatedEnderecos = [...(currentUsuario.enderecos || [])];
      updatedEnderecos.splice(index, 1);
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

  private showSnackBar(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Fechar', { duration });
  }
}
