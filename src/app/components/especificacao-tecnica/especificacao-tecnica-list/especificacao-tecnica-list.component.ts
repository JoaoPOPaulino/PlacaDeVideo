import { Component, OnInit } from '@angular/core';
import { EspecificacaoTecnica } from '../../../models/placa-de-video/especificacao-tecnica.model';
import { EspecificacaoTecnicaService } from '../../../services/especificacao-tecnica.service';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-especificacao-tecnica-list',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    RouterLink,
    MatPaginatorModule,
    MatTableModule,
    MatButtonModule,
  ],
  templateUrl: './especificacao-tecnica-list.component.html',
  styleUrl: './especificacao-tecnica-list.component.css',
})
export class EspecificacaoTecnicaListComponent implements OnInit {
  displayedColumns: string[] = [
    'id',
    'memoria',
    'clock',
    'barramento',
    'consumoEnergia',
    'acao',
  ];
  especificacoes: EspecificacaoTecnica[] = [];
  totalRecords = 0;
  pageSize = 2;
  page = 0;

  constructor(private especificacaoService: EspecificacaoTecnicaService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    forkJoin({
      especificacoes: this.especificacaoService.findAll(
        this.page,
        this.pageSize
      ),
      total: this.especificacaoService.count(),
    }).subscribe({
      next: ({ especificacoes, total }) => {
        this.especificacoes = especificacoes;
        this.totalRecords = total;
      },
      error: (error) => {
        console.error('Erro ao buscar dados:', error);
      },
    });
  }

  paginar(event: PageEvent): void {
    this.page = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadData();
  }

  excluir(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta especificação técnica?')) {
      this.especificacaoService.delete(id).subscribe({
        next: () => {
          this.loadData();
        },
        error: (error) => {
          console.error('Erro ao excluir:', error);
        },
      });
    }
  }
}
