// public-template.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicHeaderComponent } from '../public-header/public-header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { RouterOutlet } from '@angular/router';
import { CartComponent } from '../../../cart/cart.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Subscription } from 'rxjs';
import { CartUIService } from '../../../../services/cart-ui.service';

@Component({
  selector: 'app-public-template',
  standalone: true,
  imports: [
    CommonModule,
    PublicHeaderComponent,
    FooterComponent,
    RouterOutlet,
    CartComponent,
    MatSidenavModule,
  ],
  templateUrl: './public-template.component.html',
  styleUrl: './public-template.component.css',
})
export class PublicTemplateComponent implements OnInit, OnDestroy {
  isCartOpen = false;
  private uiSub?: Subscription;

  constructor(private cartUIService: CartUIService) {}

  ngOnInit(): void {
    this.uiSub = this.cartUIService.sidenavOpen$.subscribe((open) => {
      this.isCartOpen = open;
    });
  }

  ngOnDestroy(): void {
    this.uiSub?.unsubscribe();
  }
}
