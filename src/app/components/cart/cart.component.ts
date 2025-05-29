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
import { MatSidenavModule } from '@angular/material/sidenav';
import { CartUIService } from '../../services/cart-ui.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatDividerModule,
    RouterModule,
    MatInputModule,
    FormsModule,],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit, OnDestroy {
  items: ItemCarrinho[] = [];
  isSidenavOpen = false;
  private uiSub?: Subscription;
  private cartSubscription?: Subscription;

  constructor(private cartService: CartService,
              private router: Router,
              private cartUIService: CartUIService,
              private authService: AuthService){}


  ngOnInit(): void {
    this.uiSub = this.cartUIService.sidenavOpen$.subscribe( open => {
      this.isSidenavOpen = open;
    });
    this.cartSubscription = this.cartService.cartItems$.subscribe((items) => {
      this.items = items;
    });
  }

  ngOnDestroy(): void {
    this.uiSub?.unsubscribe();
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
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }
    this.router.navigate(['/checkout']);
  }

  get subtotal(): number {
    return this.cartService.subtotal;
  }

}
