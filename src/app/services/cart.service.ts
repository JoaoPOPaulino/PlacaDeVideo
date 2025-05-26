import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ItemCarrinho } from '../models/item-carrinho';
import { LocalStorageService } from './local-storage.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<ItemCarrinho[]>([]);
  cartItems$: Observable<ItemCarrinho[]> = this.cartItemsSubject.asObservable();

  constructor(
    private localStorageService: LocalStorageService,
    private snackBar: MatSnackBar
  ) {
    this.loadCartFromStorage();
  }

  private loadCartFromStorage(): void {
    const savedCart = this.localStorageService.getItem('cart') || [];
    this.cartItemsSubject.next(savedCart);
  }

  private saveCartToStorage(): void {
    this.localStorageService.setItem('cart', this.cartItemsSubject.value);
  }

  get items(): ItemCarrinho[] {
    return this.cartItemsSubject.value;
  }

  get itemsCount(): number {
    return this.items.reduce((sum, item) => sum + item.quantidade, 0);
  }

  get subtotal(): number {
    return this.items.reduce(
      (sum, item) => sum + item.preco * item.quantidade,
      0
    );
  }

  addToCart(item: ItemCarrinho): void {
    const currentItems = this.items;
    const existingItem = currentItems.find((cartItem) => cartItem.id === item.id);

    if (existingItem) {
      existingItem.quantidade += item.quantidade || 1;
    } else {
      currentItems.push({ ...item, quantidade: item.quantidade || 1 });
    }

    this.cartItemsSubject.next(currentItems);
    this.saveCartToStorage();
    this.snackBar.open('Produto adicionado ao carrinho!', 'OK', {
      duration: 2000,
      panelClass: ['success-snackbar'],
    });
  }

  removeFromCart(itemId: number): void {
    const updatedItems = this.items.filter((item) => item.id !== itemId);
    this.cartItemsSubject.next(updatedItems);
    this.saveCartToStorage();
    this.snackBar.open('Produto removido do carrinho', 'OK', {
      duration: 2000,
    });
  }

  updateQuantity(itemId: number, newQuantity: number): void {
    if (newQuantity < 1) {
      this.removeFromCart(itemId);
      return;
    }

    const updatedItems = this.items.map((item) =>
      item.id === itemId ? { ...item, quantidade: newQuantity } : item
    );

    this.cartItemsSubject.next(updatedItems);
    this.saveCartToStorage();
  }

  clearCart(): void {
    this.cartItemsSubject.next([]);
    this.saveCartToStorage();
    this.snackBar.open('Carrinho limpo', 'OK', {
      duration: 2000,
    });
  }
}