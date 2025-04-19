// cart.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatInputModule,
    FormsModule,
    RouterModule,
    CurrencyPipe
  ]
})
export class CartComponent {
  displayedColumns: string[] = ['imagem', 'nome', 'preco', 'quantity', 'subtotal', 'actions'];

  constructor(public cartService: CartService) {}

  incrementQuantity(item: any): void {
    this.cartService.updateQuantity(item.product.id, item.quantity + 1);
  }

  decrementQuantity(item: any): void {
    this.cartService.updateQuantity(item.product.id, item.quantity - 1);
  }

  getImageUrl(imageName: string): string {
    // Implemente conforme seu serviço de imagens
    return imageName ? `assets/products/${imageName}` : 'assets/images/default-card.png';
  }
}