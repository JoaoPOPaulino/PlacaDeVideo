import { Component, OnDestroy, OnInit } from '@angular/core';
import { ItemCarrinho } from '../../models/item-carrinho';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { CartUIService } from '../../services/cart-ui.service';
import { AuthService } from '../../services/auth.service';
import { PlacaDeVideoService } from '../../services/placa-de-video.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    RouterModule,
    MatInputModule,
    FormsModule,
    MatCardModule,
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit, OnDestroy {
  items: ItemCarrinho[] = [];
  private cartSubscription?: Subscription;

  constructor(
    private cartService: CartService,
    private router: Router,
    private cartUIService: CartUIService,
    private authService: AuthService,
    private placaService: PlacaDeVideoService
  ) {}

  ngOnInit(): void {
    this.cartSubscription = this.cartService.cartItems$.subscribe((items) => {
      this.items = items;
    });
  }

  ngOnDestroy(): void {
    this.cartSubscription?.unsubscribe();
  }

  closeSidenav(): void {
    this.cartUIService.closeCart();
  }

  updateItemQuantity(item: ItemCarrinho, newQuantity: number): void {
    if (newQuantity >= 1) {
      this.cartService.updateQuantity(item.id, newQuantity);
    }
  }

  removeItem(itemId: number): void {
    this.cartService.removeFromCart(itemId);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  finalizePurchase(): void {
    this.closeSidenav();
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/checkout' },
      });
      return;
    }
    this.router.navigate(['/checkout']);
  }

  get subtotal(): number {
    return this.cartService.getSubtotal();
  }

  getImageUrl(imageName: string | undefined): string {
    if (!imageName) {
      return 'assets/images/default-card.png';
    }
    return `${this.placaService.url}/download/imagem/${encodeURIComponent(
      imageName
    )}`;
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/images/default-card.png';
  }
}
