import { Component } from '@angular/core';
import { PlacaDeVideoService } from '../../../../services/placa-de-video.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { PlacaDeVideo } from '../../../../models/placa-de-video/placa-de-video.model';

@Component({
  selector: 'app-public-home',
  templateUrl: './public-home.component.html',
  styleUrls: ['./public-home.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
})
export class PublicHomeComponent {
  featuredProducts: PlacaDeVideo[] = [];
  loading = true;

  constructor(
    private placaService: PlacaDeVideoService,
    private router: Router
  ) {
    this.loadFeaturedProducts();
  }

  loadFeaturedProducts() {
    this.placaService.findAll(0, 4, '').subscribe({
      next: (products) => {
        this.featuredProducts = products;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar produtos:', err);
        this.loading = false;
      },
    });
  }

  getImageUrl(imageName: string): string {
    if (!imageName) return 'assets/images/default-card.png';
    return `${this.placaService.url}/download/imagem/${encodeURIComponent(
      imageName
    )}`;
  }

  viewDetails(productId: number): void {
    this.router.navigate(['/produto', productId]);
  }
}
