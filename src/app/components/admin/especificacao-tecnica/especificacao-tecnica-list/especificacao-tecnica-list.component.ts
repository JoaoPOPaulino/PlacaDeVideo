import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { forkJoin } from 'rxjs';
import { EspecificacaoTecnica } from '../../../../models/placa-de-video/especificacao-tecnica.model';
import { EspecificacaoTecnicaService } from '../../../../services/especificacao-tecnica.service';

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
  pageSize = 5;
  page = 0;

  constructor(private especificacaoService: EspecificacaoTecnicaService) {}

  ngOnInit(): void {
    this.loadEspecificacaos();
  }

  loadEspecificacaos(): void {
    forkJoin({
      especificacoes: this.especificacaoService.findAll(
        this.page,
        this.pageSize
      ),
      total: this.especificacaoService.count(),
    }).subscribe({
      next: ({ especificacoes, total }) => {
        this.especificacoes = especificacoes.sort((a, b) => a.id - b.id);
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
    this.loadEspecificacaos();
  }

  excluir(id: number): void {
    if (confirm('Tem certeza que deseja excluir este especificacao?')) {
      this.especificacaoService.delete(id).subscribe({
        next: () => {
          console.log(`Especificacao ${id} excluído com sucesso!`);
          // Atualiza a paginação corretamente
          if (this.especificacoes.length === 1 && this.page > 0) {
            this.page--;
          }
          this.loadEspecificacaos();
        },
        error: (error) => {
          console.error('Erro ao excluir especificacao:', error);
          // Adicione feedback para o usuário
          alert(
            'Não foi possível excluir o especificacao. Verifique se não há placas de vídeo associadas.'
          );
        },
      });
    }
  }
}
