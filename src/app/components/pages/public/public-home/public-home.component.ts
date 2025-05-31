// public-home.component.ts
import { Component } from '@angular/core';
import { PlacaDeVideoService } from '../../../../services/placa-de-video.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../../../services/cart.service';
import { ItemCarrinho } from '../../../../models/item-carrinho';

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
  featuredProducts: any[] = [];
  loading = true;

  constructor(
    private placaService: PlacaDeVideoService,
    private cartService: CartService
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

  addToCart(product: any): void {
    const item: ItemCarrinho = {
      id: product.id,
      nome: product.nome,
      preco: product.preco,
      quantidade: 1,
      nomeImagem: product.nomeImagem, // Alterado de imagem para nomeImagem
    };
    this.cartService.addToCart(item);
  }
}
