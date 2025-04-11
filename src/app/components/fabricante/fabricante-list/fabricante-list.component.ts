import { Component, OnInit } from '@angular/core';
import { Fabricante } from '../../../models/placa-de-video/fabricante.model';
import { FabricanteService } from '../../../services/fabricante.service';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-fabricante-list',
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
  templateUrl: './fabricante-list.component.html',
  styleUrl: './fabricante-list.component.css',
})
export class FabricanteListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'nome', 'acao'];
  fabricantes: Fabricante[] = [];
  totalRecords = 0;
  pageSize = 5;
  page = 0;

  constructor(private fabricanteService: FabricanteService) {}

  ngOnInit(): void {
    console.log('Componente inicializado! Carregando fabricantes...');

    forkJoin({
      fabricantes: this.fabricanteService.findAll(this.page, this.pageSize),
      total: this.fabricanteService.count(),
    }).subscribe({
      next: ({ fabricantes, total }) => {
        console.log('Fabricantes recebidos:', fabricantes);
        console.log('Total de fabricantes:', total);
        this.fabricantes = fabricantes;
        this.totalRecords = total;
      },
      error: (error) => {
        console.error('Erro ao buscar dados:', error);
      },
    });
  }

  paginar(event: PageEvent): void {
    console.log(
      'Mudando página:',
      event.pageIndex,
      'Tamanho da página:',
      event.pageSize
    );
    this.page = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadFabricantes();
  }

  loadFabricantes(): void {
    forkJoin({
      fabricantes: this.fabricanteService.findAll(this.page, this.pageSize),
      total: this.fabricanteService.count(),
    }).subscribe({
      next: ({ fabricantes, total }) => {
        this.fabricantes = fabricantes;
        this.totalRecords = total;
      },
      error: (error) => {
        console.error('Erro ao buscar dados:', error);
        alert('Erro ao carregar fabricantes');
      },
    });
  }

  excluir(id: number): void {
    if (confirm('Tem certeza que deseja excluir este fabricante?')) {
      this.fabricanteService.delete(id).subscribe({
        next: () => {
          console.log(`Fabricante ${id} excluído com sucesso!`);
          // Atualiza a paginação corretamente
          if (this.fabricantes.length === 1 && this.page > 0) {
            this.page--;
          }
          this.loadFabricantes();
        },
        error: (error) => {
          console.error('Erro ao excluir fabricante:', error);
          // Adicione feedback para o usuário
          alert(
            'Não foi possível excluir o fabricante. Verifique se não há placas de vídeo associadas.'
          );
        },
      });
    }
  }
}
