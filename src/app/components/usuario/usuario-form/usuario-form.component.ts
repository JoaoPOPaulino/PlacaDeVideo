import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Usuario } from '../../../models/usuario/usuario.model';
import { Perfil } from '../../../models/usuario/perfil';
import { MatDialog } from '@angular/material/dialog';
import { NovoTelefoneDialogComponent } from '../../dialog/novo-telefone-dialog/novo-telefone-dialog.component';
import { NovoEnderecoDialogComponent } from '../../dialog/novo-endereco-dialog/novo-endereco-dialog.component';
import { MatList, MatListItem } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, debounceTime, distinctUntilChanged, map, Observable, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NgIf,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatList,
    MatListItem
  ],
  templateUrl: './usuario-form.component.html',
  styleUrl: './usuario-form.component.css',
})
export class UsuarioFormComponent implements OnInit {
  @Input() isPublic = false;
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
      nome: [
        usuario?.nome || '',
        [Validators.required, Validators.minLength(3)]
      ],
      login: [
        usuario?.login || '',
        [Validators.required, Validators.minLength(3)]
      ],
      email: [
        usuario?.email || '',
        [Validators.required, Validators.email]
      ],
      senha: [
        '',
        this.isPublic ? [Validators.required, Validators.minLength(4)] : [Validators.minLength(4)]
      ],
      perfil: [
        usuario?.perfil || Perfil.USER,
        Validators.required
      ],
      telefones: this.isPublic ? [] : this.telefones,
      enderecos: this.isPublic ? [] : this.enderecos
    });
  }

  ngOnInit(): void {
    const routeData = this.activatedRoute.snapshot.data;
    if (routeData['isPublic']) {
      this.isPublic = true;
    }

    if (this.isPublic){
      this.formGroup.get('perfil')?.setValue(Perfil.USER);
      this.formGroup.get('perfil')?.disable();
    }

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

  validateLogin(login: string): Observable<boolean> {
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

  loginValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {
      return this.validateLogin(control.value).pipe(
        map(exists => exists ? { loginExists: true } : null)
      );
    };
  }

  carregarDadosUsuario(usuario: Usuario): void {
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
      perfil: formData.perfil, // Já é o ID numérico
      telefones: this.telefones,
      enderecos: this.enderecos
    };
  
    // Remove senha se estiver vazia (para atualização)
    if (usuario.id && !usuario.senha) {
      delete usuario.senha;
    }
  
    // Define senha padrão para novos usuários
    if (!usuario.id && !usuario.senha) {
      usuario.senha = '123456';
    }
  
    const operation = usuario.id 
      ? this.usuarioService.update(usuario, usuario.id)
      : this.usuarioService.insert(usuario);
  
    operation.subscribe({
      next: () => {
        this.snackBar.open('Usuário salvo com sucesso!', 'Fechar', { duration: 3000 });
        const redirectUrl = this.isPublic ? '/' : '/admin/usuarios';
        this.router.navigateByUrl(redirectUrl);
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
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      if (id) {
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
  }

  abrirDialogNovoTelefone(): void {
    const dialogRef = this.dialog.open(NovoTelefoneDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.telefones.push(result);
      }
    });
  }

  abrirDialogNovoEndereco(): void {
    const dialogRef = this.dialog.open(NovoEnderecoDialogComponent, {
      width: '500px'
    });

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