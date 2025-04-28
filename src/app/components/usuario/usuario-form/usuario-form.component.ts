import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { catchError, debounceTime, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { UsuarioService } from '../../../services/usuario.service';
import { Usuario } from '../../../models/usuario/usuario.model';
import { Perfil } from '../../../models/usuario/perfil';
import { NovoTelefoneDialogComponent } from '../../dialog/novo-telefone-dialog/novo-telefone-dialog.component';
import { NovoEnderecoDialogComponent } from '../../dialog/novo-endereco-dialog/novo-endereco-dialog.component';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';

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
  perfis = [
    { id: Perfil.USER, label: 'Usuário' },
    { id: Perfil.ADMIN, label: 'Administrador' },
  ];
  telefones: any[] = [];
  enderecos: any[] = [];
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    const usuario: Usuario = this.activatedRoute.snapshot.data['usuario'];
    this.formGroup = this.formBuilder.group({
      id: [usuario?.id || null],
      nome: [usuario?.nome || '', [Validators.required, Validators.minLength(3)]],
      login: [usuario?.login || '', [Validators.required, Validators.minLength(3)]],
      email: [usuario?.email || '', [Validators.required, Validators.email]],
      senha: ['', [Validators.minLength(4)]],
      perfil: [usuario?.perfil || Perfil.USER, Validators.required],
    });
  }

  ngOnInit(): void {
    const usuario: Usuario = this.activatedRoute.snapshot.data['usuario'];
    if (usuario) {
      this.carregarDadosUsuario(usuario);
    }
    this.setupLoginValidation();
  }

  setupLoginValidation() {
    const loginControl = this.formGroup.get('login');
    if (loginControl) {
      loginControl.valueChanges
        .pipe(
          debounceTime(500),
          distinctUntilChanged(),
          switchMap(value => this.validateLogin(value))
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
      map(exists => {
        if (exists) {
          this.formGroup.get('login')?.setErrors({ loginExists: true });
        }
        return exists;
      }),
      catchError(() => of(false))
    );
  }

  carregarDadosUsuario(usuario: Usuario) {
    this.formGroup.patchValue({
      id: usuario.id,
      nome: usuario.nome,
      login: usuario.login,
      email: usuario.email,
      perfil: usuario.perfil,
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
      return;
    }

    this.isLoading = true;
    const formData = this.formGroup.value;

    const usuario = {
      ...formData,
      telefones: this.telefones,
      enderecos: this.enderecos
    };

    if (usuario.id && !usuario.senha) {
      delete usuario.senha;
    }

    if (!usuario.id && !usuario.senha) {
      usuario.senha = '123456';
    }

    const operation = usuario.id
      ? this.usuarioService.update(usuario, usuario.id)
      : this.usuarioService.insert(usuario);

    operation.subscribe({
      next: () => {
        this.snackBar.open('Usuário salvo com sucesso!', 'Fechar', { duration: 3000 });
        this.router.navigateByUrl('/admin/usuarios');
      },
      error: (err) => {
        console.error('Erro detalhado:', err);
        const errorMessage = err.message || 'Erro ao salvar usuário';
        this.snackBar.open(errorMessage, 'Fechar', { duration: 5000, panelClass: ['error-snackbar'] });

        if (err.message.includes('Login já está em uso')) {
          this.formGroup.get('login')?.setErrors({ loginExists: true });
        }
      },
      complete: () => this.isLoading = false
    });
  }

  excluir() {
    const id = this.formGroup.get('id')?.value;
    if (confirm('Tem certeza que deseja excluir este usuário?') && id) {
      this.usuarioService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Usuário excluído com sucesso!', 'Fechar', { duration: 3000 });
          this.router.navigateByUrl('/admin/usuarios');
        },
        error: (err) => {
          console.error('Erro ao excluir:', err);
          this.snackBar.open('Erro ao excluir usuário', 'Fechar', { duration: 5000 });
        }
      });
    }
  }

  abrirDialogNovoTelefone() {
    const dialogRef = this.dialog.open(NovoTelefoneDialogComponent, { width: '400px' });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.telefones.push(result);
      }
    });
  }

  abrirDialogNovoEndereco() {
    const dialogRef = this.dialog.open(NovoEnderecoDialogComponent, { width: '500px' });

    dialogRef.afterClosed().subscribe(result => {
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
