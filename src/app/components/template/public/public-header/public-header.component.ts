import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule, Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { CartService } from '../../../../services/cart.service';
import { CartComponent } from '../../../cart/cart.component';
import { CartUIService } from '../../../../services/cart-ui.service';

@Component({
  selector: 'app-public-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    RouterModule,
    CartComponent,
  ],
  templateUrl: './public-header.component.html',
  styleUrls: ['./public-header.component.css'],
})
export class PublicHeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  isAdmin = false;
  cartItemsCount = 0;
  private usuarioSub?: Subscription;
  private cartSub?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cartService: CartService,
    private cartUIService: CartUIService
  ) {}

  ngOnInit(): void {
    this.updateLoginStatus();
    this.usuarioSub = this.authService
      .getUsuarioLogado()
      .subscribe((usuario) => {
        this.isLoggedIn = !!usuario && this.authService.isLoggedIn();
        this.isAdmin = this.authService.getPerfil() === 'ADMIN';
      });
    this.cartSub = this.cartService.cartItems$.subscribe((items) => {
      this.cartItemsCount = items.reduce(
        (sum, item) => sum + item.quantidade,
        0
      );
    });
  }

  ngOnDestroy(): void {
    this.usuarioSub?.unsubscribe();
    this.cartSub?.unsubscribe();
  }

  private updateLoginStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.getPerfil() === 'ADMIN';
  }

  logout(): void {
    this.authService.logout();
    this.updateLoginStatus();
    this.router.navigateByUrl('/');
  }

  openCart(): void {
    this.cartUIService.openCart();
  }
}
