import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { forkJoin } from 'rxjs';
import { Avaliacao } from '../../../../models/avaliacao/avaliacao.model';
import { AvaliacaoService } from '../../../../services/avaliacao.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';

@Component({
  selector: 'app-avaliacao-list',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    RouterLink,
    MatPaginatorModule,
    MatTableModule,
    MatButtonModule,
    MatMenuModule,
    MatSnackBarModule,
    TruncatePipe,
  ],
  templateUrl: './avaliacao-list.component.html',
  styleUrl: './avaliacao-list.component.css',
})
export class AvaliacaoListComponent implements OnInit {
  displayedColumns: string[] = [
    'id',
    'usuario',
    'placa',
    'nota',
    'comentario',
    'data',
    'acao',
  ];
  avaliacoes: Avaliacao[] = [];
  totalRecords = 0;
  pageSize = 5;
  page = 0;

  constructor(
    private avaliacaoService: AvaliacaoService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAvaliacoes();
  }

  loadAvaliacoes(): void {
    forkJoin({
      avaliacoes: this.avaliacaoService.findAll(this.page, this.pageSize),
      total: this.avaliacaoService.count(),
    }).subscribe({
      next: ({ avaliacoes, total }) => {
        this.avaliacoes = avaliacoes.sort((a, b) => a.id - b.id);
        this.totalRecords = total;
      },
      error: (error) => {
        console.error('Erro ao buscar avaliações:', error);
        this.snackBar.open('Erro ao carregar avaliações', 'Fechar', {
          duration: 3000,
        });
      },
    });
  }

  paginar(event: PageEvent): void {
    this.page = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAvaliacoes();
  }

  excluir(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta avaliação?')) {
      this.avaliacaoService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Avaliação excluída com sucesso!', 'Fechar', {
            duration: 3000,
          });
          if (this.avaliacoes.length === 1 && this.page > 0) {
            this.page--;
          }
          this.loadAvaliacoes();
        },
        error: (error) => {
          console.error('Erro ao excluir avaliação:', error);
          this.snackBar.open('Erro ao excluir avaliação', 'Fechar', {
            duration: 3000,
          });
        },
      });
    }
  }
}
