import { Component, ViewChild } from '@angular/core';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatNavList, MatListItem } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet, RouterModule, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-client-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatNavList,
    MatListItem,
    RouterOutlet,
    RouterModule,
    RouterLinkActive,
    MatIcon,
    MatButtonModule,
  ],
  templateUrl: './client-sidebar.component.html',
  styleUrl: './client-sidebar.component.css',
})
export class ClientSidebarComponent {
  @ViewChild('drawer') public drawer!: MatDrawer;

  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}
