import { Component, OnInit } from '@angular/core';
import { PlacaDeVideo } from '../../../models/placa-de-video/placa-de-video.model';
import { PlacaDeVideoService } from '../../../services/placa-de-video.service';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { CategoriaPipe } from '../../../pipes/categoria.pipe';
import { Categoria } from '../../../models/placa-de-video/categoria';

@Component({
  selector: 'app-placa-de-video-list',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    RouterLink,
    MatPaginatorModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    CategoriaPipe,
  ],
  templateUrl: './placa-de-video-list.component.html',
  styleUrl: './placa-de-video-list.component.css',
})
export class PlacaDeVideoListComponent implements OnInit {
  placas: PlacaDeVideo[] = [];
  totalRecords = 0;
  pageSize = 8;
  page = 0;
  searchTerm = '';
  imageLoaded = false;

  constructor(private placaService: PlacaDeVideoService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    forkJoin({
      placas: this.placaService.findAll(
        this.page,
        this.pageSize,
        this.searchTerm
      ),
      total: this.searchTerm
        ? this.placaService.count(this.searchTerm)
        : this.placaService.count(),
    }).subscribe({
      next: ({ placas, total }) => {
        this.placas = placas.sort((a, b) => a.id - b.id);
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

  pesquisar(): void {
    this.page = 0;
    console.log('Termo de pesquisa:', this.searchTerm);
    this.loadData();
  }

  limparPesquisa(): void {
    this.searchTerm = '';
    this.pesquisar();
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

  getBadgeClass(categoria: Categoria): string {
    switch (categoria) {
      case Categoria.ENTRADA:
        return 'entrada';
      case Categoria.INTERMEDIARIA:
        return 'intermediaria';
      case Categoria.ALTO_DESEMPENHO:
        return 'alto-desempenho';
      default:
        return '';
    }
  }

  getEstoqueClass(estoque: number): string {
    if (estoque < 5) return 'estoque-baixo';
    if (estoque < 10) return 'estoque-medio';
    return 'estoque-ok';
  }

  getImageUrl(imageName: string): string {
    if (!imageName) return 'assets/images/default-card.jpg';
    return `assets/images/${imageName}`;
  }

  handleImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/images/default-card.png';
    this.imageLoaded = true; // evita que o placeholder continue aparecendo
  }

  imageLoadedMap = new Set<number>();

  isImageLoaded(id: number): boolean {
    return this.imageLoadedMap.has(id);
  }

  markImageLoaded(id: number): void {
    this.imageLoadedMap.add(id);
  }
}
