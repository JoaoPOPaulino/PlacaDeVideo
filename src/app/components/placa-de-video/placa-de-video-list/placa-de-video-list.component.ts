import { Component, OnInit } from '@angular/core';
import { PlacaDeVideo } from '../../../models/placa-de-video/placa-de-video.model';
import { PlacaDeVideoService } from '../../../services/placa-de-video.service';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-placa-de-video-list',
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
  templateUrl: './placa-de-video-list.component.html',
  styleUrl: './placa-de-video-list.component.css',
})
export class PlacaDeVideoListComponent implements OnInit {
  displayedColumns: string[] = [
    'id',
    'nome',
    'preco',
    'fabricante',
    'categoria',
    'estoque',
    'acao',
  ];
  placas: PlacaDeVideo[] = [];
  totalRecords = 0;
  pageSize = 5;
  page = 0;

  constructor(private placaService: PlacaDeVideoService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    forkJoin({
      placas: this.placaService.findAll(this.page, this.pageSize),
      total: this.placaService.count(),
    }).subscribe({
      next: ({ placas, total }) => {
        this.placas = placas;
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
    if (confirm('Tem certeza que deseja excluir esta placa de vídeo?')) {
      this.placaService.delete(id).subscribe({
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
