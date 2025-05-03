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
import { Perfil } from '../../../../models/usuario/perfil';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

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

  constructor(private usuarioService: UsuarioService) {}

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
        console.error('Error loading usuarios:', error);
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
          alert('Usuário excluído com sucesso!');
          this.loadUsuarios();
        },
        error: (error) => {
          console.error('Erro ao excluir usuário:', error);
        },
      });
    }
  }

  getBadgeClass(perfil: Perfil): string {
    switch (perfil) {
      case Perfil.ADMIN:
        return 'admin';
      case Perfil.USER:
        return 'usuario';
      default:
        return '';
    }
  }

  getPerfilId(perfil: Perfil): number {
    switch (perfil) {
      case Perfil.USER:
        return 1;
      case Perfil.ADMIN:
        return 2;
      default:
        return 0;
    }
  }
}
