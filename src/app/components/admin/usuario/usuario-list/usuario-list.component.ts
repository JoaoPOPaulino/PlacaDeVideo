import { CommonModule, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { Usuario } from '../../../../models/usuario/usuario.model';
import { UsuarioService } from '../../../../services/usuario.service';
import { forkJoin } from 'rxjs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Perfil } from '../../../../models/usuario/perfil.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PerfilPipe } from "../../../shared/pipes/Perfil.pipe";

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [
    NgFor,
    MatTableModule,
    MatToolbarModule,
    MatIconModule,
    RouterLink,
    CommonModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    PerfilPipe
],
  templateUrl: './usuario-list.component.html',
  styleUrl: './usuario-list.component.css',
})
export class UsuarioListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'nome', 'login', 'perfil', 'acao'];
  usuarios: Usuario[] = [];
  totalRecords = 0;
  pageSize = 5;
  page = 0;
  searchTerm = '';

  constructor(
    private usuarioService: UsuarioService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsuarios();
  }

  loadUsuarios(): void {
    forkJoin({
      usuarios: this.usuarioService.findAll(
        this.page,
        this.pageSize,
        this.searchTerm
      ),
      total: this.searchTerm
        ? this.usuarioService.count(this.searchTerm)
        : this.usuarioService.count(),
    }).subscribe({
      next: ({ usuarios, total }) => {
        this.usuarios = usuarios.sort((a, b) => a.id - b.id);
        this.totalRecords = total;
      },
      error: (error) => {
        console.error('Erro ao carregar usuários:', error);
        this.snackBar.open(
          'Erro ao carregar usuários. Tente novamente.',
          'Fechar',
          {
            duration: 3000,
          }
        );
      },
    });
  }

  paginar(event: PageEvent): void {
    this.page = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsuarios();
  }

  pesquisar(): void {
    this.page = 0;
    this.loadUsuarios();
  }

  limparPesquisa(): void {
    this.searchTerm = '';
    this.pesquisar();
  }

  excluir(id: number): void {
    if (confirm('Tem certeza que deseja excluir?')) {
      this.usuarioService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Usuário excluído com sucesso!', 'Fechar', {
            duration: 3000,
          });
          this.loadUsuarios();
        },
        error: (error) => {
          console.error('Erro ao excluir usuário:', error);
          this.snackBar.open('Erro ao excluir usuário.', 'Fechar', {
            duration: 3000,
          });
        },
      });
    }
  }

  getBadgeClass(perfil: Perfil): string {
    switch (perfil?.id) {
      case 1:
        return 'usuario';
      case 2:
        return 'admin';
      default:
        return '';
    }
  }

  getPerfilId(perfil: Perfil): number {
    return perfil?.id || 0;
  }
}
