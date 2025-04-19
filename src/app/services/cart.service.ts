// cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PlacaDeVideo } from '../models/placa-de-video/placa-de-video.model';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface CartItem {
  product: PlacaDeVideo;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  constructor(private snackBar: MatSnackBar) {
    this.loadCartFromStorage();
  }

  private loadCartFromStorage(): void {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cartItemsSubject.next(JSON.parse(savedCart));
    }
  }

  private saveCartToStorage(items: CartItem[]): void {
    localStorage.setItem('cart', JSON.stringify(items));
    this.cartItemsSubject.next(items);
  }

  get items(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  get itemsCount(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  get subtotal(): number {
    return this.items.reduce(
      (sum, item) => sum + (item.product.preco * item.quantity),
      0
    );
  }

  addToCart(product: PlacaDeVideo, quantity: number = 1): void {
    const currentItems = this.items;
    const existingItem = currentItems.find(item => item.product.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      currentItems.push({ product, quantity });
    }

    this.saveCartToStorage(currentItems);
    this.snackBar.open('Produto adicionado ao carrinho!', 'OK', {
      duration: 2000,
      panelClass: ['success-snackbar']
    });
  }

  removeFromCart(productId: number): void {
    const updatedItems = this.items.filter(item => item.product.id !== productId);
    this.saveCartToStorage(updatedItems);
    this.snackBar.open('Produto removido do carrinho', 'OK', {
      duration: 2000
    });
  }

  updateQuantity(productId: number, newQuantity: number): void {
    if (newQuantity < 1) {
      this.removeFromCart(productId);
      return;
    }

    const updatedItems = this.items.map(item => {
      if (item.product.id === productId) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });

    this.saveCartToStorage(updatedItems);
  }

  clearCart(): void {
    this.saveCartToStorage([]);
    this.snackBar.open('Carrinho limpo', 'OK', {
      duration: 2000
    });
  }
}