import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { forkJoin, fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { PlacaDeVideo } from '../../../../models/placa-de-video/placa-de-video.model';
import { PlacaDeVideoService } from '../../../../services/placa-de-video.service';

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
  ],
  templateUrl: './placa-de-video-list.component.html',
  styleUrls: ['./placa-de-video-list.component.css'],
})
export class PlacaDeVideoListComponent implements OnInit {
  placas: PlacaDeVideo[] = [];
  totalRecords = 0;
  pageSize = 8;
  page = 0;
  searchTerm = '';
  showDebugInfo = false;

  constructor(
    private placaService: PlacaDeVideoService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.calculatePageSize();
    this.loadData();

    fromEvent(window, 'resize')
      .pipe(debounceTime(200))
      .subscribe(() => {
        this.calculatePageSize();
      });
  }

  calculatePageSize(): void {
    const cardWidth = 280;
    const container = document.querySelector('.cards-container');
    if (container) {
      const containerWidth = container.clientWidth;
      const cardsPerRow = Math.floor(containerWidth / cardWidth);
      this.pageSize = Math.max(4, cardsPerRow * 2);
    }
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement) {
      imgElement.src = 'assets/images/default-card.png';
    }
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
        console.log('Placas carregadas:', placas); // Log para depuração
        this.placas = placas.sort((a, b) => a.id! - b.id!);
        this.totalRecords = total;
      },
      error: (error) => {
        console.error('Erro ao buscar dados:', error);
        this.snackBar.open(
          'Erro ao carregar placas. Tente novamente.',
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
    this.loadData();
  }

  pesquisar(): void {
    this.page = 0;
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
          this.snackBar.open('Placa excluída com sucesso!', 'Fechar', {
            duration: 3000,
          });
          this.loadData();
        },
        error: (error) => {
          console.error('Erro ao excluir:', error);
          this.snackBar.open('Erro ao excluir placa.', 'Fechar', {
            duration: 3000,
          });
        },
      });
    }
  }

  getEstoqueClass(estoque: number): string {
    if (estoque < 5) return 'estoque-baixo';
    if (estoque < 10) return 'estoque-medio';
    return 'estoque-ok';
  }

  getImageUrl(imageName: string): string {
    if (!imageName) return 'assets/images/default-card.png';
    return `${this.placaService.url}/download/imagem/${encodeURIComponent(
      imageName
    )}`;
  }

  getBadgeClass(categoria: string): string {
    if (!categoria) return '';
    switch (categoria.toLowerCase()) {
      case 'entrada':
        return 'entrada';
      case 'intermediária':
        return 'intermediaria';
      case 'alto desempenho':
        return 'alto-desempenho';
      default:
        return '';
    }
  }

  toggleDebugInfo(): void {
    this.showDebugInfo = !this.showDebugInfo;
  }
}