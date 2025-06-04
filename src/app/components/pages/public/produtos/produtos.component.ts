import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatGridListModule } from '@angular/material/grid-list';
import { PlacaDeVideoService } from '../../../../services/placa-de-video.service';
import { PlacaDeVideo } from '../../../../models/placa-de-video/placa-de-video.model';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatIconModule,
    FormsModule,
    MatGridListModule,
  ],
  templateUrl: './produtos.component.html',
  styleUrl: './produtos.component.css',
})
export class ProdutosComponent implements OnInit, OnDestroy {
  placas: PlacaDeVideo[] = [];
  totalItems: number = 0;
  pageSize = 8;
  currentPage = 0;
  searchTerm: string = '';
  filterFabricante: string | null = null;
  filterCategoria: string | null = null;
  private subscription: Subscription = new Subscription();

  constructor(
    private placaDeVideoService: PlacaDeVideoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPlacas();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadPlacas(): void {
    this.subscription.add(
      this.placaDeVideoService
        .findAll(this.currentPage, this.pageSize, this.searchTerm)
        .subscribe((placas) => {
          this.placas = placas;
        })
    );
    this.subscription.add(
      this.placaDeVideoService.count(this.searchTerm).subscribe((count) => {
        this.totalItems = count;
      })
    );
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadPlacas();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPlacas();
  }

  viewDetails(placaId: number): void {
    this.router.navigate(['/produto', placaId]);
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadPlacas();
  }

  getImageUrl(imageName: string): string {
    if (!imageName) return 'assets/images/default-card.png';
    return `${
      this.placaDeVideoService.url
    }/download/imagem/${encodeURIComponent(imageName)}`;
  }
}
